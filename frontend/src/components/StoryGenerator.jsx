/**
 * StoryGenerator.jsx
 * ------------------
 * Orchestrates the full story-creation flow from the root "/" route:
 *
 *   1. ThemeInput  → user types a theme and submits
 *   2. POST /api/stories/create  → backend starts a background job, returns job_id
 *   3. Poll GET /api/jobs/:id every 5 s  → wait for status "completed"
 *   4. Navigate to /story/:id   → StoryLoader takes over
 *
 * Background job pattern:
 *   Story generation can take 20–60 seconds (multiple LLM calls).  Rather
 *   than holding the HTTP connection open that long, the backend returns a
 *   job_id immediately (HTTP 202 Accepted) and the client polls a lightweight
 *   status endpoint until the job finishes.  This avoids proxy/gateway
 *   timeouts and lets the UI show live progress.
 *
 * State machine (simplified):
 *   idle  ──[submit]──► loading/polling ──[completed]──► navigate
 *                                        └─[failed]─────► error
 *
 * Props: none (this is a route-level component)
 *
 * Styling: .story-generator, .error-message — see App.css.
 */

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import ThemeInput from './ThemeInput.jsx';
import LoadingStatus from './LoadingStatus.jsx';
import { API_BASE_URL } from '../util.js';

/**
 * StoryGenerator
 *
 * @returns {JSX.Element} One of: ThemeInput form | LoadingStatus | error card
 */
function StoryGenerator() {
  const navigate = useNavigate();

  // theme     – stored so LoadingStatus can show "Generating Your <theme> Story"
  const [theme, setTheme] = useState('');
  // jobId     – ID returned by POST /stories/create; used to poll job status
  const [jobId, setJobId] = useState(null);
  // jobStatus – mirrors the backend job status: "processing" | "completed" | "failed"
  const [jobStatus, setJobStatus] = useState(null);
  // error     – non-null string shows the error card
  const [error, setError] = useState(null);
  // loading   – true while a job is in flight (creation or polling)
  const [loading, setLoading] = useState(false);

  /**
   * Polling effect
   * Runs whenever jobId or jobStatus changes.  When a job is processing,
   * sets up a 5-second interval that calls pollJobStatus repeatedly.
   *
   * The cleanup function (returned from useEffect) clears the interval when:
   *   • The component unmounts (user navigates away mid-generation)
   *   • The job finishes or fails (jobStatus changes out of "processing")
   * This prevents memory leaks and duplicate polls.
   */
  useEffect(() => {
    let pollInterval;

    if (jobId && jobStatus === 'processing') {
      // Poll every 5 000 ms — long enough to avoid hammering the backend,
      // short enough that the user doesn't wait an extra 5 s at the end.
      pollInterval = setInterval(() => {
        pollJobStatus(jobId);
      }, 5000);
    }

    // Cleanup: cancel the interval when this effect re-runs or unmounts
    return () => {
      if (pollInterval) {
        clearInterval(pollInterval);
      }
    };
  }, [jobId, jobStatus]);

  /**
   * generateStory
   * Called by ThemeInput's onSubmit when the user submits a valid theme.
   * POSTs to /api/stories/create and kicks off polling.
   *
   * An initial poll is triggered immediately after the job is created rather
   * than waiting 5 s for the interval to fire — this handles the rare case
   * where story generation finishes in under 5 seconds.
   *
   * @param {string} userTheme - Validated theme string from ThemeInput
   */
  const generateStory = async (userTheme) => {
    setLoading(true);
    setError(null);
    setTheme(userTheme);

    try {
      const response = await axios.post(`${API_BASE_URL}/stories/create`, {
        theme: userTheme,
      });
      const { job_id, status } = response.data;
      setJobId(job_id);
      setJobStatus(status);

      // Kick off the first poll immediately without waiting for the interval
      pollJobStatus(job_id);
    } catch (e) {
      setLoading(false);
      setError(`Failed to start story generation: ${e.message}`);
    }
  };

  /**
   * pollJobStatus
   * Fetches the current status of a background job.
   * When the job completes, calls fetchStory to navigate to the story route.
   * When the job fails, surfaces the backend error message.
   *
   * 404 responses are silently ignored — they occur briefly while the job
   * record is being created in the database and resolve on the next poll.
   *
   * @param {string} id - The job ID returned by POST /stories/create
   */
  const pollJobStatus = async (id) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/jobs/${id}`);
      const { status, story_id, error: jobError } = response.data;
      setJobStatus(status);

      if (status === 'completed' && story_id) {
        // Job finished — navigate to the story page
        fetchStory(story_id);
      } else if (status === 'failed' || jobError) {
        // Backend reported an explicit failure
        setError(jobError || 'Story generation failed. Please try again.');
        setLoading(false);
      }
      // If status is still "processing", do nothing — the interval will poll again
    } catch (e) {
      // Ignore 404 (job not yet persisted); surface all other errors
      if (e.response?.status !== 404) {
        setError(`Failed to check story status: ${e.message}`);
        setLoading(false);
      }
    }
  };

  /**
   * fetchStory
   * Navigates to the /story/:id route once the job completes.
   * StoryLoader at that route handles the actual data fetch.
   *
   * This is intentionally a navigation — not a fetch — because the story
   * URL is shareable and bookmarkable, so the fetch logic belongs in
   * StoryLoader rather than here.
   *
   * @param {string|number} id - The newly created story's ID
   */
  const fetchStory = (id) => {
    setLoading(false);
    setJobStatus('completed');
    navigate(`/story/${id}`);
  };

  /**
   * reset
   * Returns all state to its initial values so the user can try again after
   * an error without refreshing the page.
   */
  const reset = () => {
    setJobId(null);
    setJobStatus(null);
    setError(null);
    setTheme('');
    setLoading(false);
  };

  return (
    <div className="story-generator">
      {/* ── Error banner ──────────────────────────────────────────────── */}
      {error && (
        <div className="error-message">
          <p>{error}</p>
          <button onClick={reset}>Try Again</button>
        </div>
      )}

      {/* ── Theme input form (idle state) ─────────────────────────────── */}
      {/* Hidden when a job is running or an error is displayed */}
      {!jobId && !error && !loading && (
        <ThemeInput onSubmit={generateStory} />
      )}

      {/* ── Loading/polling spinner ───────────────────────────────────── */}
      {loading && <LoadingStatus theme={theme} />}
    </div>
  );
}

export default StoryGenerator;
