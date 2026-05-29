/**
 * App.jsx
 * -------
 * Root component.  Wraps the entire app in React Router's BrowserRouter and
 * declares the two client-side routes:
 *
 *   /            → StoryGenerator  (enter theme → generate → redirect)
 *   /story/:id   → StoryLoader     (fetch story by ID → play)
 *
 * BrowserRouter uses the HTML5 History API so URLs look like real paths
 * (/story/42) rather than hash fragments (#/story/42).  Note: the hosting
 * platform must be configured to serve index.html for all paths so that
 * deep-linking and page refreshes work correctly.  The vercel.json in the
 * project root handles this for Vercel deployments.
 *
 * App.css is imported here to apply component-level styles globally after
 * the baseline reset in index.css.
 */

import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import StoryLoader from './components/StoryLoader';
import StoryGenerator from './components/StoryGenerator.jsx';

/**
 * App
 *
 * Intentionally thin — all logic lives in the routed components.
 * The <header> renders on every route, providing a persistent title bar.
 *
 * @returns {JSX.Element} The full application wrapped in a Router
 */
function App() {
  return (
    <Router>
      <div className="app-container">
        {/* Persistent header shown on every route */}
        <header>
          <h1>Interactive Story Generator</h1>
        </header>

        <main>
          <Routes>
            {/* /story/:id – load and play a previously generated story */}
            <Route path="/story/:id" element={<StoryLoader />} />

            {/* / – theme entry form + story generation flow */}
            <Route path="/" element={<StoryGenerator />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
