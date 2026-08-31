import { defineConfig, devices } from '@playwright/test';

/**
 * End-to-end tests run against the real build, never the dev server.
 *
 * The service worker is disabled in dev on purpose, and the precache manifest only
 * exists in build output — so an offline test against `npm run dev` would pass or
 * fail for reasons that have nothing to do with the shipped app.
 */
export default defineConfig({
	testDir: 'e2e',
	fullyParallel: false,
	forbidOnly: !!process.env.CI,
	retries: process.env.CI ? 1 : 0,
	workers: 1,
	reporter: process.env.CI ? 'list' : [['list']],
	use: {
		baseURL: 'http://localhost:4173',
		trace: 'retain-on-failure'
	},
	projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
	webServer: {
		command: 'npm run build && npm run preview -- --port 4173',
		url: 'http://localhost:4173',
		reuseExistingServer: !process.env.CI,
		timeout: 120_000
	}
});
