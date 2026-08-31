import { expect, test, type Page } from '@playwright/test';
import { spawn, type ChildProcess } from 'node:child_process';

/**
 * Offline behaviour.
 *
 * ## These tests pass, and they are the only proof that matters
 *
 * Offline support was asserted for several sessions before it was ever verified, then
 * reported as broken for several more because the harness below was wrong rather than the
 * worker. Both mistakes had the same cause: no test that could tell the difference.
 *
 * The worker is healthy — activated, controlling, and holding the whole precache — and a
 * navigation completes with the origin dead. What used to fail was the readiness check:
 * it killed the server the instant a controller first appeared, which can precede the
 * worker being ready to serve navigations.
 *
 * ## Why the server is stopped instead of using offline emulation
 *
 * Playwright cannot test a service worker with either of its network controls.
 * `context.setOffline(true)` and `context.route(..., abort)` both intercept in front
 * of the worker, so a navigation fails before the worker is ever consulted — a cached
 * response that would have been served looks identical to no cache at all. Both were
 * tried first and both produced false failures.
 *
 * So these tests kill the origin. Nothing is emulated: the server is gone, and any
 * page that still loads did so from the cache.
 *
 * Each test gets its own server. Sharing one meant the test that kills the origin left
 * every later test with a dead server and a guaranteed failure.
 */

const PORT = 4193;
const BASE = `http://localhost:${PORT}`;

let server: ChildProcess | undefined;

async function startServer() {
	server = spawn('npx', ['vite', 'preview', '--port', String(PORT), '--strictPort'], {
		stdio: 'ignore',
		detached: true
	});
	for (let attempt = 0; attempt < 60; attempt++) {
		try {
			if ((await fetch(BASE)).ok) return;
		} catch {
			/* not up yet */
		}
		await new Promise((resolve) => setTimeout(resolve, 500));
	}
	throw new Error('preview server never came up');
}

function stopServer() {
	if (!server?.pid) return;
	try {
		process.kill(-server.pid, 'SIGKILL');
	} catch {
		/* already gone */
	}
	server = undefined;
}

/**
 * Wait for the cache to be populated, not merely for a worker to exist.
 *
 * Checking `registration.active` is not enough and was itself a source of confusion:
 * it can be true while precaching is still in flight, or true for a worker that
 * precaches nothing at all.
 */
async function waitForPrecache(page: Page, atLeast = 40) {
	/*
	 * Do not stop at the first instant a controller and enough cache entries coexist. The
	 * previous harness killed the origin on that edge and intermittently raced the worker's
	 * final activation/route readiness. Require the same active controller and cache size on
	 * two observations separated by 250 ms instead.
	 */
	let previous = '';
	for (let attempt = 0; attempt < 120; attempt += 1) {
		const state = await page.evaluate(async () => {
			const names = await caches.keys();
			const registration = await navigator.serviceWorker.getRegistration();
			const count = names[0] ? (await (await caches.open(names[0])).keys()).length : 0;
			return {
				active: registration?.active?.state ?? '',
				controller: navigator.serviceWorker.controller?.scriptURL ?? '',
				count
			};
		});

		const signature = `${state.active}|${state.controller}|${state.count}`;
		if (
			state.active === 'activated' &&
			state.controller !== '' &&
			state.count >= atLeast &&
			signature === previous
		) {
			return;
		}
		previous = signature;
		await page.waitForTimeout(250);
	}
	throw new Error(`service worker did not reach a stable ${atLeast}-entry precache`);
}

test.beforeEach(startServer);
test.afterEach(stopServer);

test('the app is precached on first visit', async ({ page }) => {
	await page.goto(BASE);
	// The requirement in one line: after one visit, the whole app is on the device.
	await waitForPrecache(page);
});

test('every route loads with the origin gone', async ({ page }) => {
	await page.goto(BASE);
	await waitForPrecache(page);

	stopServer();
	await expect(fetch(BASE)).rejects.toThrow();

	for (const [path, content] of [
		['/', 'Nothing set up yet'],
		['/stock', 'Stock'],
		['/order', 'Order'],
		['/setup', 'Setup'],
		['/privacy', 'never leaves your device'],
		['/about', 'does not determine or suggest any dose']
	] as const) {
		await page.goto(BASE + path);
		await expect(page.getByText(content, { exact: false }).first()).toBeVisible();
	}
});

test('data can be entered with the origin gone', async ({ page }) => {
	await page.goto(BASE);
	await waitForPrecache(page);

	stopServer();

	await page.reload();
	await page.getByRole('button', { name: 'Load example regimen' }).click();
	await expect(page.getByText('Alfabine (maintenance)')).toBeVisible();

	// And it survives, because IndexedDB is local and the shell comes from cache.
	await page.reload();
	await expect(page.getByText('Alfabine (maintenance)')).toBeVisible();
});
