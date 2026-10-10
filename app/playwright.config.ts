import { defineConfig } from '@playwright/test'

// Runs against a separate port (5181) in a fresh browser profile, so tests
// never touch your real progress on port 5180. Uses the Edge already
// installed on Windows, so no browser download is needed.
export default defineConfig({
  testDir: 'tests/e2e',
  timeout: 120_000,
  reporter: 'list',
  use: {
    baseURL: 'http://localhost:5181',
    channel: 'msedge',
    viewport: { width: 1280, height: 860 },
    reducedMotion: 'reduce',
    acceptDownloads: true,
  },
  webServer: {
    command: 'node node_modules/vite/bin/vite.js --port 5181 --strictPort',
    url: 'http://localhost:5181',
    reuseExistingServer: false,
    timeout: 60_000,
  },
})
