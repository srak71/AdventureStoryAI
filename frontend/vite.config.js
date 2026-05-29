/**
 * vite.config.js
 * ---------------
 * Vite build + dev-server configuration.
 *
 * Local development proxy:
 *   Set VITE_DEBUG=true in frontend/.env.local to enable the proxy.
 *   This forwards any request starting with /api from the dev server
 *   to the FastAPI backend running on http://localhost:8000, avoiding
 *   browser CORS errors during local development.
 *
 *   In production (Vercel / Choreo) the reverse-proxy is handled by
 *   the hosting platform instead, so the proxy block is skipped.
 */
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ command, mode }) => {
  // loadEnv reads .env, .env.local, .env.[mode], etc.
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [react()],
    server: {
      // Only attach the proxy when VITE_DEBUG=true so production
      // builds are never accidentally pointed at localhost.
      ...(env.VITE_DEBUG === 'true' && {
        proxy: {
          '/api': {
            target: 'http://localhost:8000',
            changeOrigin: true,
            secure: false,
          },
        },
      }),
    },
  }
})
