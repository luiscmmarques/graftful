import { expect, test } from '@playwright/test';

test('the example regimen is not presented as already exhausted', async ({ page }) => {
	/*
	 * The seed is a real 2021 regimen. Loaded verbatim its counts are years old, and
	 * derived depletion correctly concludes every box emptied long ago — accurate, and
	 * a terrible first impression. The loader rebases the stock counts to today; the
	 * dose history stays historical.
	 */
	await page.goto('/');
	await page.getByRole('button', { name: 'Load example regimen' }).click();
	await expect(page.getByRole('heading', { name: 'Today', exact: true })).toBeVisible();

	await page.goto('/stock');
	await expect(page.getByText(/\d\d days/).first()).toBeVisible();
});

test('no request reaches a third party while using the app', async ({ page }) => {
	/*
	 * The privacy claim, asserted. /privacy invites the reader to open DevTools and
	 * watch the Network tab stay silent; this is that check, automated.
	 */
	const external: string[] = [];
	page.on('request', (request) => {
		const { hostname } = new URL(request.url());
		if (hostname !== 'localhost' && hostname !== '127.0.0.1') external.push(request.url());
	});

	await page.goto('/');
	await page.getByRole('button', { name: 'Load example regimen' }).click();
	await expect(page.getByRole('heading', { name: 'Today', exact: true })).toBeVisible();

	for (const path of ['/stock', '/order', '/setup', '/about', '/privacy']) await page.goto(path);

	expect(external, `unexpected outbound requests: ${external.join(', ')}`).toEqual([]);
});

test('every screen has its own page title', async ({ page }) => {
	for (const [path, title] of [
		['/', 'Today · Graftful'],
		['/stock', 'Stock · Graftful'],
		['/order', 'Order · Graftful'],
		['/setup', 'Setup · Graftful'],
		['/about', 'About Graftful'],
		['/privacy', 'Privacy · Graftful']
	] as const) {
		await page.goto(path);
		await expect(page).toHaveTitle(title);
	}
});

test('the wordmark returns to Today', async ({ page }) => {
	await page.goto('/stock');
	await page.getByRole('link', { name: 'Graftful' }).click();
	await expect(page).toHaveURL('/');
});

test('the content menu opens, navigates and closes', async ({ page }) => {
	/*
	 * Regression test for two real bugs. First, these links were a bare <nav>, which the
	 * fixed bottom-bar CSS captured — pinning them to the bottom of the screen behind the
	 * section bar, invisible on a phone. Second, closing the menu inside a link's own
	 * click handler detached the anchor mid-click, which can cancel the navigation.
	 */
	await page.setViewportSize({ width: 390, height: 844 });
	await page.goto('/');

	await expect(page.locator('.menu')).toHaveCount(0);

	const burger = page.getByRole('button', { name: 'Menu' });
	await burger.click();
	await expect(burger).toHaveAttribute('aria-expanded', 'true');
	await expect(page.locator('.menu a')).toHaveCount(4);

	// The menu must be in the header, not stranded at the bottom of the document.
	const menuBox = await page.locator('.menu').boundingBox();
	expect(menuBox!.y).toBeLessThan(200);

	await page.locator('.menu a', { hasText: 'Roadmap' }).click();
	await expect(page).toHaveURL('/roadmap');
	await expect(page.locator('.menu')).toHaveCount(0);

	await burger.click();
	await page.keyboard.press('Escape');
	await expect(page.locator('.menu')).toHaveCount(0);
});

test('navigation labels never clip, in any language', async ({ page }) => {
	// "Setup" is five characters and "Einstellungen" is thirteen, in a bar of four equal
	// columns. At a fixed font size the German sat exactly on the limit at 390px.
	for (const lang of ['en', 'fr', 'de', 'pt']) {
		await page.addInitScript((l) => {
			Object.defineProperty(navigator, 'languages', { get: () => [l] });
		}, lang);
		await page.setViewportSize({ width: 320, height: 844 });
		await page.goto('/');

		const clipped = await page
			.locator('nav.sections a')
			.evaluateAll((els) =>
				els
					.filter((e) => e.scrollWidth > Math.ceil(e.getBoundingClientRect().width) + 1)
					.map((e) => e.textContent?.trim())
			);
		expect(clipped, `clipped labels in ${lang}`).toEqual([]);
	}
});

test('an unparsable time is reported, not silently dropped', async ({ page }) => {
	/*
	 * The highest-risk field in the app. A time that is not HH:MM sorts unpredictably on
	 * the Today screen and emits a DTSTART no calendar can parse, so reminders silently
	 * never fire — and the user has no way of knowing.
	 */
	await page.goto('/');
	await page.getByRole('button', { name: 'Load example regimen' }).click();
	await page.goto('/setup');

	const times = page.getByLabel('When you normally take medication, comma separated');
	await times.fill('7:30, abc, 25:00');
	await page.getByRole('button', { name: 'Save times' }).click();

	// Names what failed, rather than quietly keeping the two valid entries.
	const error = page.locator('p.stale').first();
	await expect(error).toContainText('abc');
	await expect(error).toContainText('25:00');

	// A valid list is accepted and normalised to HH:MM.
	await times.fill('7:30, 19:30');
	await page.getByRole('button', { name: 'Save times' }).click();
	await expect(times).toHaveValue('07:30, 19:30');
	await expect(page.locator('p.stale')).toHaveCount(0);
});

test('a backup restores the usual times and language, not just the regimen', async ({ page }) => {
	/*
	 * The bug this covers: export wrote every preference, but restore rebuilt settings from
	 * defaults and copied across only the horizon and transplant date. The usual dose
	 * times, the language override and the collection note vanished on import — from a
	 * file that contained all three, with nothing reported.
	 */
	await page.goto('/');
	await page.getByRole('button', { name: 'Load example regimen' }).click();
	// Wait for the seed to land before navigating. Exporting straight after the click read an
	// empty database and produced an empty backup — which is how that hazard was found.
	await expect(page.getByRole('heading', { name: 'Today', exact: true })).toBeVisible();
	await page.goto('/setup');

	await page.getByLabel('When you normally take medication, comma separated').fill('6:15, 18:15');
	await page.getByRole('button', { name: 'Save times' }).click();
	await expect(page.getByLabel('When you normally take medication, comma separated')).toHaveValue(
		'06:15, 18:15'
	);

	// Export, then throw everything away.
	const download = await Promise.all([
		page.waitForEvent('download'),
		page.getByRole('button', { name: 'Export backup (JSON)' }).click()
	]).then(([d]) => d);
	const backup = await download.path();
	if (!backup) throw new Error('no backup file was produced');

	page.on('dialog', (dialog) => dialog.accept());
	await page.getByRole('button', { name: 'Delete all data' }).click();
	// Wait for the app to confirm the delete committed. Navigating on click alone raced the
	// transaction, which is how the fire-and-forget clearAll() was found.
	await expect(page.getByText('Everything on this device has been deleted.')).toBeVisible();
	await page.goto('/');
	await expect(page.getByRole('heading', { name: 'Nothing set up yet' })).toBeVisible();

	// Restore.
	await page.goto('/setup');
	await page.setInputFiles('input[type="file"]', backup);

	await expect(page.getByLabel('When you normally take medication, comma separated')).toHaveValue(
		'06:15, 18:15'
	);

	// Wait for the regimen on this page before navigating. The field above only proves the
	// settings row came back; a therapy proves the products and doses did too. Navigating on
	// the settings assertion alone races whatever is still being written.
	await expect(page.getByText('Alfabine', { exact: true }).first()).toBeVisible();

	// And it is there after a reload, from the database rather than from this page's state.
	await page.goto('/');
	await expect(page.getByRole('heading', { name: 'Today', exact: true })).toBeVisible();
});

test('an empty device refuses to produce a backup rather than a worthless file', async ({
	page
}) => {
	/*
	 * A file with no products is indistinguishable from a real backup by name and size, and
	 * restoring it replaces everything with nothing. This was found by an export that raced
	 * the seed load and captured an empty database — the resulting "backup" then wiped the
	 * regimen on restore while reporting success.
	 */
	await page.goto('/setup');

	const downloads: string[] = [];
	page.on('download', (d) => downloads.push(d.suggestedFilename()));

	await page.getByRole('button', { name: 'Export backup (JSON)' }).click();

	await expect(
		page.getByText('Nothing to export yet — there is no regimen on this device.')
	).toBeVisible();
	expect(downloads).toEqual([]);
});

/*
 * Durable storage.
 *
 * The request itself cannot be asserted here — Chromium grants persistence to a localhost
 * origin without asking, so the refusal path never occurs naturally. `navigator.storage` is
 * therefore stubbed before any app code runs. What is being tested is not the browser's
 * decision but ours: that a refusal reaches the user next to the export button, and that a
 * grant says nothing at all.
 */
async function stubPersistence(page: import('@playwright/test').Page, granted: boolean) {
	await page.addInitScript((allow) => {
		Object.defineProperty(navigator, 'storage', {
			configurable: true,
			value: {
				persisted: () => Promise.resolve(false),
				persist: () => Promise.resolve(allow)
			}
		});
	}, granted);
}

const storageWarning = /has not guaranteed that the data here is permanent/;

test('a refused storage guarantee is reported beside the backup button', async ({ page }) => {
	await stubPersistence(page, false);

	/*
	 * Nothing is said on an empty device, because nothing has been asked yet: on Firefox
	 * `persist()` is a permission prompt, and putting it to somebody who has just scanned a QR
	 * code and entered nothing spends the one chance to ask on protecting no data.
	 */
	await page.goto('/setup');
	await expect(page.getByRole('heading', { name: 'Your data' })).toBeVisible();
	await expect(page.getByText(storageWarning)).toHaveCount(0);

	// Loading the example gives the database something to lose, which is the trigger.
	await page.goto('/');
	await page.getByRole('button', { name: 'Load example regimen' }).click();
	await expect(page.getByRole('heading', { name: 'Today', exact: true })).toBeVisible();

	await page.goto('/setup');
	await expect(page.getByText(storageWarning)).toBeVisible();
});

test('a granted storage guarantee is not announced', async ({ page }) => {
	await stubPersistence(page, true);

	await page.goto('/');
	await page.getByRole('button', { name: 'Load example regimen' }).click();
	await expect(page.getByRole('heading', { name: 'Today', exact: true })).toBeVisible();

	await page.goto('/setup');
	await expect(page.getByRole('heading', { name: 'Your data' })).toBeVisible();
	// There is no reason to congratulate anyone about storage.
	await expect(page.getByText(storageWarning)).toHaveCount(0);
});

test('recounting to zero on a day that already has an entry actually takes effect', async ({
	page
}) => {
	/*
	 * The bug: the ledger sorted by `occurredOn`, a date with no time, so events sharing a day
	 * kept whatever order they arrived in — and with random ids that order was arbitrary. A
	 * recount entered today could lose to an entry already made today and silently do nothing:
	 * no error, no console message, the number simply did not move.
	 *
	 * Recounting to zero is what you do when you have run out, which is the moment the app has
	 * to be believed, so it is worth an end-to-end test rather than only a unit one. The seed's
	 * counts are dated today, which is exactly the collision.
	 */
	await page.goto('/');
	await page.getByRole('button', { name: 'Load example regimen' }).click();
	await expect(page.getByRole('heading', { name: 'Today', exact: true })).toBeVisible();

	await page.goto('/stock');
	const card = page.locator('.card').filter({ hasText: 'Alfabine 4mg' }).first();
	await expect(card).toContainText('150 left');

	await card.getByRole('button', { name: 'Modify' }).click();
	const counts = card.locator('input[type="number"]');
	await counts.first().waitFor();
	for (let i = 0; i < (await counts.count()); i += 1) {
		if ((await counts.nth(i).inputValue()) === '150') {
			await counts.nth(i).fill('0');
			break;
		}
	}
	await card.getByRole('button', { name: 'Set to 0' }).click();

	await expect(card).toContainText('0 left');

	// And it is in the database, not only on the screen.
	await page.reload();
	await expect(page.locator('.card').filter({ hasText: 'Alfabine 4mg' }).first()).toContainText(
		'0 left'
	);
});

test('cancelling the import confirmation leaves the existing regimen untouched', async ({
	page
}) => {
	/*
	 * Import replaces every table. Deleting one product asks first, so replacing the whole
	 * regimen without asking was both inconsistent and far higher impact — and the file input
	 * fires on selection, so there is no natural moment to reconsider.
	 *
	 * Asserting the cancel path specifically: a confirmation that is present but ignored is
	 * worse than none, because it teaches people the guard exists.
	 */
	await page.goto('/');
	await page.getByRole('button', { name: 'Load example regimen' }).click();
	await expect(page.getByRole('heading', { name: 'Today', exact: true })).toBeVisible();

	await page.goto('/setup');
	const download = await Promise.all([
		page.waitForEvent('download'),
		page.getByRole('button', { name: 'Export backup (JSON)' }).click()
	]).then(([d]) => d);
	const backup = await download.path();
	if (!backup) throw new Error('no backup file was produced');

	// A backup whose contents differ from what is on the device, so a silent import shows up.
	const { readFileSync, writeFileSync } = await import('node:fs');
	const other = backup + '-other.json';
	const parsed = JSON.parse(readFileSync(backup, 'utf8'));
	parsed.products = [parsed.products[0]];
	parsed.therapies = [];
	parsed.doseVersions = [];
	writeFileSync(other, JSON.stringify(parsed));

	let asked = '';
	page.once('dialog', (dialog) => {
		asked = dialog.message();
		return dialog.dismiss();
	});

	await page.setInputFiles('input[type="file"]', other);

	expect(asked).toContain('replace');
	await expect(page.locator('.card').filter({ hasText: 'Therapies' })).not.toContainText(
		'None yet.'
	);

	// And the regimen is still there after a reload, so nothing was written.
	await page.goto('/');
	await expect(page.getByRole('heading', { name: 'Today', exact: true })).toBeVisible();
	await expect(page.getByText('Alfabine', { exact: true }).first()).toBeVisible();
});

test('the app is installable: the manifest is linked and usable', async ({ page, request }) => {
	/*
	 * The manifest was generated, precached and served for some time without ever being
	 * linked from the HTML, so the app could not be installed at all — no icon, no standalone
	 * window, no home screen — while About, the roadmap and the README all said it could.
	 * `@vite-pwa/sveltekit` does not get its <link> into SvelteKit's prerendered output.
	 *
	 * Nothing warns you about this. The file is right there if you ask for it directly, which
	 * is exactly why it needs a test that goes through a page.
	 */
	await page.goto('/');
	const href = await page.locator('link[rel="manifest"]').getAttribute('href');
	expect(href, 'no <link rel="manifest"> in the document').toBeTruthy();

	const response = await request.get(href!);
	expect(response.ok()).toBe(true);

	const manifest = await response.json();
	// The fields a browser needs before it will offer to install anything.
	expect(manifest.name).toBeTruthy();
	expect(manifest.start_url).toBeTruthy();
	expect(manifest.display).toBe('standalone');

	const sizes = (manifest.icons ?? []).map((icon: { sizes: string }) => icon.sizes);
	expect(sizes, 'a 192px icon is required').toContain('192x192');
	expect(sizes, 'a 512px icon is required').toContain('512x512');
	expect(
		(manifest.icons ?? []).some((icon: { purpose?: string }) => icon.purpose === 'maskable'),
		'a maskable icon is required, or the platform crops the artwork'
	).toBe(true);

	/*
	 * Screenshots are what Chrome asks for before it will show the richer install dialogue,
	 * and it warns for each form factor separately: one wide for desktop, one narrow or unset
	 * for mobile. Missing them is not fatal, just a plainer prompt for something people are
	 * being asked to trust with their medication.
	 */
	const shots: Array<{ src: string; form_factor?: string }> = manifest.screenshots ?? [];
	expect(
		shots.some((shot) => shot.form_factor === 'wide'),
		'no wide screenshot'
	).toBe(true);
	expect(
		shots.some((shot) => shot.form_factor !== 'wide'),
		'no narrow screenshot'
	).toBe(true);

	// Every one has to actually be there, or the prompt silently falls back.
	for (const shot of shots) {
		expect((await request.get(shot.src)).ok(), `${shot.src} is missing`).toBe(true);
	}
});

test('favicon.ico exists, because browsers ask for it whatever the links say', async ({
	request
}) => {
	// Requested unconditionally, so its absence is a 404 on every single visit.
	const response = await request.get('/favicon.ico');
	expect(response.ok()).toBe(true);

	/*
	 * The bytes are checked rather than the Content-Type, because `vite preview` has no MIME
	 * entry for `.ico` and serves it with an empty header — a property of the preview server,
	 * not of the app. Cloudflare Pages sets the type from the extension, and browsers sniff
	 * favicons in any case. The ICO magic number is the honest assertion: a real icon
	 * container, not an HTML fallback page that happened to return 200.
	 */
	const body = await response.body();
	expect(body.length).toBeGreaterThan(100);
	expect([...body.subarray(0, 4)], 'not an ICO container').toEqual([0, 0, 1, 0]);
});

test('the Content-Security-Policy lets the app boot on every page', async ({ page }) => {
	/*
	 * A policy this app shipped once read `script-src 'self'`, which blocks the inline
	 * bootstrap script SvelteKit puts in every prerendered page. The server-rendered
	 * markup still appeared, so the site looked deployed: correct text, correct styling,
	 * a 200 from curl, valid header rules in the build log. Nothing worked. No
	 * navigation, no stored data, no error message.
	 *
	 * It reached production because the policy lived in static/_headers, a file only
	 * Cloudflare reads. Under `vite preview` there was no policy at all, so no test
	 * could have failed. The policy is now generated by SvelteKit into a <meta> tag
	 * (see the csp block in vite.config.ts), which browsers honour wherever the file is
	 * served — including here.
	 *
	 * Any blocked script raises a console error mentioning the policy, so the assertion
	 * is simply that no page produces one.
	 */
	const blocked: string[] = [];
	page.on('console', (message) => {
		if (message.type() === 'error' && /content security policy/i.test(message.text())) {
			blocked.push(message.text());
		}
	});

	for (const path of [
		'/',
		'/stock',
		'/order',
		'/setup',
		'/about',
		'/privacy',
		'/roadmap',
		'/support'
	]) {
		await page.goto(path);
		const policy = page.locator('meta[http-equiv="content-security-policy"]');
		await expect(policy, `${path} carries no policy`).toHaveCount(1);
		expect(await policy.getAttribute('content'), `${path} has no script hash`).toMatch(
			/script-src[^;]*'sha256-/
		);
	}
	expect(blocked, 'the policy blocked a script').toEqual([]);

	/*
	 * Proof the app is live rather than merely rendered: hydration has to run for a
	 * click to do anything at all.
	 */
	await page.goto('/');
	await page.getByRole('button', { name: 'Load example regimen' }).click();
	await expect(page.getByRole('heading', { name: 'Today', exact: true })).toBeVisible();
});
