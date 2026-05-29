/**
 * StoryLoader.jsx
 * ---------------
 * Route component for the `/story/:id` path.  Fetches a fully-generated story
 * from the backend by ID and hands it to StoryGame for rendering.
 *
 * This component handles all three states of the fetch lifecycle:
 *   loading  → shows the LoadingStatus spinner
 *   error    → shows an error card with a "Go to Story Generator" escape hatch
 *   success  → renders StoryGame with the fetched story data
 *
 * The story ID comes from the URL via React Router's `useParams` hook, so
 * this route can also be bookmarked or shared directly.
 *
 * Data shape expected from GET /api/stories/:id/complete:
 *   {
 *     id:        number,
 *     title:     string,
 *     theme:     string,
 *     root_node: { id: string, ... },
 *     all_nodes: { [nodeId: string]: StoryNode }
 *   }
 *
 * Styling: classes live in the "/* StoryLoader *\/" section of App.css.
 */

import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import LoadingStatus from './LoadingStatus.jsx';
import StoryGame from './StoryGame.jsx';
import { API_BASE_URL } from '../util.js';

/**
 * StoryLoader
 *
 * Fetches story data on mount (and again whenever the `id` URL param changes).
 * Using `useEffect` with `[id]` as the dependency means navigation from one
 * story URL to another automatically re-fetches without unmounting the tree.
 *
 * @returns {JSX.Element} Loading screen, error card, or interactive StoryGame
 */
function StoryLoader() {
  // id – extracted from the URL path e.g. /story/42 → "42"
  const { id } = useParams();
  const navigate = useNavigate();

  const [story, setStory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Re-run the fetch whenever the story ID in the URL changes
  useEffect(() => {
    loadStory(id);
  }, [id]);

  /**
   * loadStory
   * Fetches the complete story object (nodes + metadata) from the backend.
   * The /complete suffix instructs the backend to include all_nodes, which
   * StoryGame needs to navigate the story graph without additional requests.
   *
   * @param {string} storyId - The story's numeric ID from the URL param
   */
  const loadStory = async (storyId) => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.get(`${API_BASE_URL}/stories/${storyId}/complete`);
      setStory(response.data);
    } catch (err) {
      // Distinguish "not found" from other network/server errors so the
      // error message is actionable rather than generic.
      if (err.response?.status === 404) {
        setError('Story not found.');
      } else {
        setError('Failed to load story. Please try again.');
      }
    } finally {
      // Always clear the loading state, whether the request succeeded or failed
      setLoading(false);
    }
  };

  /**
   * createNewStory
   * Navigates back to the root route where the user can generate a new story.
   */
  const createNewStory = () => {
    navigate('/');
  };

  /* ── Render: loading ─────────────────────────────────────────────────── */
  if (loading) {
    // "story" here is a generic theme label — there's no user theme available
    return <LoadingStatus theme="story" />;
  }

  /* ── Render: error ───────────────────────────────────────────────────── */
  if (error) {
    return (
      <div className="story-loader">
        <div className="error-message">
          <h2>Story Not Found</h2>
          <p>{error}</p>
          <button onClick={createNewStory}>Go to Story Generator</button>
        </div>
      </div>
    );
  }

  /* ── Render: success ─────────────────────────────────────────────────── */
  if (story) {
    return (
      <div className="story-loader">
        {/* Pass createNewStory so StoryGame can render a "New Story" button */}
        <StoryGame story={story} onNewStory={createNewStory} />
      </div>
    );
  }
}

export default StoryLoader;
