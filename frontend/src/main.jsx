/**
 * main.jsx
 * --------
 * Application entry point.  Vite resolves this file from the `src` attribute
 * in index.html and uses it as the module graph root.
 *
 * StrictMode renders each component twice in development to surface
 * side-effects and deprecated API usage; it has no impact on production.
 *
 * index.css is imported here (not in App.jsx) so global baseline styles are
 * applied before the first paint, regardless of which route is rendered.
 */

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';

// Mount the React tree into the <div id="root"> element in index.html
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
