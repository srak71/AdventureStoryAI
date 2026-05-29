/**
 * util.js
 * -------
 * Shared constants and utilities used across all components.
 *
 * API_BASE_URL
 * ─────────────
 * The base path prepended to every backend API call (axios requests in
 * StoryGenerator and StoryLoader).
 *
 * Resolution order:
 *   1. VITE_API_BASE_URL env var  – set in .env.local for custom deployments
 *   2. "/api" fallback            – works with the Vite dev-server proxy
 *                                   (see vite.config.js; requires VITE_DEBUG=true)
 *
 * Vite replaces `import.meta.env.*` at build time, so the value is baked into
 * the production bundle — there is no runtime environment lookup.
 */

/**
 * Base URL for all backend API requests.
 * Append route paths directly, e.g. `${API_BASE_URL}/stories/create`.
 *
 * @type {string}
 */
export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || '/api';
