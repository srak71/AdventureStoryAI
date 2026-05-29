/**
 * ThemeInput.jsx
 * --------------
 * The landing-page form where users type a theme (e.g. "pirates") and kick
 * off story generation.  Rendered by StoryGenerator when no job is in
 * progress and no error has occurred.
 *
 * Responsibilities:
 *   • Maintain the controlled input value in local state
 *   • Perform client-side validation before calling `onSubmit`
 *   • Display an inline error if the user submits an empty value
 *
 * Props:
 *   onSubmit {Function} – Called with the trimmed theme string when the form
 *                         passes validation.  The parent (StoryGenerator) uses
 *                         this to fire the POST /api/stories/create request.
 *
 * Styling: classes live in the "/* ThemeInput *\/" section of App.css.
 */

import { useState } from 'react';

/**
 * ThemeInput
 *
 * Controlled form component.  `theme` lives in local state so React owns the
 * input value — this lets us clear it, validate it, and highlight errors
 * without the parent needing to know about every keystroke.
 *
 * @param {Object}   props
 * @param {Function} props.onSubmit - Receives the validated theme string
 * @returns {JSX.Element} A card with a text input and submit button
 */
function ThemeInput({ onSubmit }) {
  // theme  – the current value of the text input
  const [theme, setTheme] = useState('');
  // error  – non-empty string means validation failed; displayed beneath input
  const [error, setError] = useState('');

  /**
   * handleSubmit
   * Validates the input and delegates to the parent via `onSubmit`.
   * Calling e.preventDefault() stops the browser from navigating to a new URL
   * (the default behaviour for HTML form submissions).
   *
   * @param {React.FormEvent} e - Native form submit event
   */
  const handleSubmit = (e) => {
    e.preventDefault();

    // Reject blank or whitespace-only input before making any API call
    if (!theme.trim()) {
      setError('Please enter a theme name');
      return;
    }

    // Clear any previous error before delegating upward
    setError('');
    onSubmit(theme);
  };

  return (
    <div className="theme-input-container">
      <h2>Generate Your Adventure</h2>
      <p>Enter a theme for your interactive story</p>

      <form onSubmit={handleSubmit}>
        <div className="input-group">
          {/* Adding the "error" class switches the border to red (see App.css) */}
          <input
            type="text"
            value={theme}
            onChange={(e) => setTheme(e.target.value)}
            placeholder="Enter a theme (e.g. pirates, space, medieval...)"
            className={error ? 'error' : ''}
          />
          {/* Only render the error paragraph when there is an error to show */}
          {error && <p className="error-text">{error}</p>}
        </div>

        <button type="submit" className="generate-btn">
          Generate Story
        </button>
      </form>
    </div>
  );
}

export default ThemeInput;
