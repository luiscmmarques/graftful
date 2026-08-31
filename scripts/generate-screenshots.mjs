/**
 * Screenshots for the install prompt.
 *
 * Run with `npm run screenshots`, then `npm run build` again so the new files are copied into
 * the build and precache decisions are recalculated.
 *
 * Chrome shows a richer install dialogue when the manifest carries screenshots, and warns in
 * DevTools when it cannot: one with `form_factor: "wide"` for desktop, and one without it (or
 * narrow) for mobile. Without them the app still installs, it just gets the plain prompt.
 *
 * These are taken from the real built app rather than mocked up, so they cannot drift from
 * what someone actually sees. They deliberately use the **example regimen**, whose product
 * names are invented: a screenshot of a real regimen would publish somebody's medication in
 * an app store listing and in the browser's own install UI.
 */
import { chromium } from '@playwright/test';
import { spawn } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const outDir = join(root, 'static', 'screenshots');
const PORT = 4321;
const BASE = `http://localhost:${PORT}`;

/*
 * Same aspect ratio within each form factor, which is what Chrome expects. Narrow is a
 * common phone viewport; wide is 16:9, comfortably inside the 2.3:1 limit.
 */
const NARROW = { width: 390, height: 844 };
const WIDE = { width: 1280, height: 720 };

const SHOTS = [
	{ path: '/', file: 'today-narrow.png', viewport: NARROW, label: 'Today' },
	{ path: '/stock', file: 'stock-narrow.png', viewport: NARROW, label: 'Stock' },
	{ path: '/order', file: 'order-narrow.png', viewport: NARROW, label: 'Order' },
	{ path: '/', file: 'today-wide.png', viewport: WIDE, label: 'Today' },
	{ path: '/stock', file: 'stock-wide.png', viewport: WIDE, label: 'Stock' }
];

mkdirSync(outDir, { recursive: true });

const server = spawn('npx', ['vite', 'preview', '--port', String(PORT), '--strictPort'], {
	stdio: 'ignore',
	detached: true
});

const stop = () => {
	try {
		if (server.pid) process.kill(-server.pid, 'SIGKILL');
	} catch {
		/* already gone */
	}
};

try {
	let up = false;
	for (let attempt = 0; attempt < 80; attempt += 1) {
		try {
			if ((await fetch(BASE)).ok) {
				up = true;
				break;
			}
		} catch {
			/* not yet */
		}
		await new Promise((resolve) => setTimeout(resolve, 250));
	}
	if (!up) throw new Error('preview server never came up — run npm run build first');

	const browser = await chromium.launch();

	for (const shot of SHOTS) {
		const page = await browser.newPage({ viewport: shot.viewport, deviceScaleFactor: 1 });
		await page.goto(BASE);

		// Fictional data, on purpose. See the note at the top of this file.
		await page.getByRole('button', { name: 'Load example regimen' }).click();
		await page.getByRole('heading', { name: 'Today', exact: true }).waitFor();

		if (shot.path !== '/') await page.goto(BASE + shot.path);
		// Let the reactive stores settle so nothing is captured mid-load.
		await page.waitForTimeout(600);

		await page.screenshot({ path: join(outDir, shot.file) });
		await page.close();
		console.log(`${shot.file}  ${shot.viewport.width}x${shot.viewport.height}  ${shot.label}`);
	}

	await browser.close();
} finally {
	stop();
}
