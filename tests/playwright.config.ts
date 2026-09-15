import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright config for the todo-app suite.
 *
 * - UI tests drive the React client (Vite dev server, default port 5173).
 * - API tests hit the ASP.NET Core Web API directly (Kestrel, default port
 *   5000 per TodoApi/Properties/launchSettings.json).
 *
 * Both servers are declared in `webServer` below so `npx playwright test`
 * can boot them automatically. The API depends on a SQL Server instance
 * (see ../docker-compose.yml) — if that isn't running, the `dotnet run`
 * webServer entry will fail to become healthy. `reuseExistingServer` is
 * enabled locally so you can instead start everything yourself
 * (e.g. `docker compose up`, or `dotnet run` + `npm run dev`) and the
 * tests will just reuse whatever is already listening on these ports.
 */
export default defineConfig({
  testDir: './e2e',
  timeout: 30_000,
  expect: { timeout: 5_000 },
  fullyParallel: false,
  retries: process.env.CI ? 1 : 0,
  reporter: [['html', { open: 'never' }], ['list']],
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: [
    {
      command: 'npm run dev',
      cwd: '../todo-client',
      url: 'http://localhost:5173',
      reuseExistingServer: !process.env.CI,
      timeout: 30_000,
    },
    {
      command: 'dotnet run',
      cwd: '../TodoApi',
      url: 'http://localhost:5000/api/todos',
      reuseExistingServer: !process.env.CI,
      timeout: 60_000,
    },
  ],
});
