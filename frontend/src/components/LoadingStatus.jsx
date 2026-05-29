/**
 * LoadingStatus.jsx
 * -----------------
 * Displays a full-card loading screen while the AI generates a story in the
 * background.  Shown by both StoryGenerator (while the job is queued/running)
 * and StoryLoader (while fetching a pre-existing story by ID).
 *
 * Props:
 *   theme {string} – The story theme entered by the user (e.g. "pirates").
 *                    Rendered in the heading so the user knows what is being
 *                    generated.  Defaults gracefully to an empty string if
 *                    omitted (heading reads "Generating Your  Story").
 *
 * Styling: all classes live in App.css under the "/* Loading *\/" section.
 */

/**
 * LoadingStatus
 *
 * Pure presentational component – no state, no side-effects.  The spinner
 * animation is driven entirely by a CSS keyframe (@keyframes spin) defined
 * in App.css, keeping this component simple and re-renderable at any time.
 *
 * @param {Object} props
 * @param {string} props.theme - User-supplied story theme shown in the heading
 * @returns {JSX.Element} A centred loading card with spinner and status text
 */
function LoadingStatus({ theme }) {
  return (
    <div className="loading-container">
      {/* Capitalises the theme in the heading; whitespace is intentional if
          theme is an empty string — the heading still reads naturally */}
      <h2>Generating Your {theme} Story</h2>

      {/* CSS-animated spinner — the .spinner div uses border-top-color to
          create the rotating "arc" effect defined in App.css */}
      <div className="loading-animation">
        <div className="spinner"></div>
      </div>

      <p className="loading-info">
        Please wait while we generate your story...
      </p>
    </div>
  );
}

export default LoadingStatus;
