import { test } from 'vitest';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

import { APP_ORIGIN } from './domain/app-info.ts';

/**
 * The sitemap, checked against the routes that actually exist.
 *
 * A static file cannot enumerate routes for itself — the same gap `headers.test.ts`
 * closes for cache rules. Add a route without a sitemap entry, or leave an entry for
 * a route that is gone, and this fails by name.
 */

const SITEMAP = readFileSync('static/sitemap.xml', 'utf8');
const ROBOTS = readFileSync('static/robots.txt', 'utf8');

/** Route paths derived from the filesystem, the same way SvelteKit derives them. */
function routes(dir = 'src/routes', prefix = ''): string[] {
	const found: string[] = [];
	for (const entry of readdirSync(dir)) {
		const full = join(dir, entry);
		if (entry === '+page.svelte') found.push(prefix || '/');
		else if (statSync(full).isDirectory() && !entry.startsWith('_')) {
			found.push(...routes(full, `${prefix}/${entry}`));
		}
	}
	return found;
}

function sitemapLocs(): string[] {
	return [...SITEMAP.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
}

/**
 * Whether a route asks search engines not to index it.
 *
 * Read from the route's own source rather than from a list kept here, so the answer cannot
 * drift from the page. `e2e/app.spec.ts` checks the tag actually survives prerendering, which
 * this cannot see.
 */
function isNoindex(route: string): boolean {
	const file = route === '/' ? 'src/routes/+page.svelte' : `src/routes${route}/+page.svelte`;
	return /name=["']robots["'][^>]*noindex/.test(readFileSync(file, 'utf8'));
}

test('every route is either in the sitemap or marked noindex, never both or neither', () => {
	/*
	 * Stronger than "every route is in the sitemap", which is what this asserted while the three
	 * app screens were listed. They prerender to the word "Loading…" — every figure on them comes
	 * from the local database, which a crawler does not have — so submitting them asked Google to
	 * index three near-identical thin pages alongside the content pages that are the actual
	 * reason anyone finds this app.
	 *
	 * Framed as an exclusive choice so a new route cannot quietly be neither. Adding one now
	 * forces the question: is this a page worth finding, or a screen that only means something
	 * once there is data on the device?
	 */
	const locs = new Set(sitemapLocs());

	for (const route of routes()) {
		const expected = route === '/' ? `${APP_ORIGIN}/` : `${APP_ORIGIN}${route}`;
		const listed = locs.has(expected);
		const noindex = isNoindex(route);

		assert.ok(
			listed || noindex,
			`${route} is neither in static/sitemap.xml nor marked noindex. Decide which: add it to ` +
				'the sitemap if it is worth finding, or add <meta name="robots" content="noindex, ' +
				'follow"> if it only means anything with local data.'
		);
		assert.ok(
			!(listed && noindex),
			`${route} is in static/sitemap.xml and also marked noindex, which asks a crawler to ` +
				'index a page and then not to. Remove it from the sitemap.'
		);

		locs.delete(expected);
	}

	assert.deepEqual(
		[...locs],
		[],
		'static/sitemap.xml lists URLs that are not routes — remove them, or a crawler chases 404s'
	);
});

test('robots.txt does not block the crawl of a noindex page', () => {
	/*
	 * The mistake these two mechanisms invite. A `Disallow` looks like a stronger version of
	 * noindex and does the opposite: it stops the crawler fetching the page, so the noindex is
	 * never read, and a URL that is linked from anywhere can still end up indexed — with no
	 * description, because the crawler was never allowed to look.
	 */
	const disallowed = [...ROBOTS.matchAll(/^\s*Disallow:\s*(\S+)\s*$/gim)].map((m) => m[1]);
	for (const route of routes()) {
		if (!isNoindex(route)) continue;
		for (const path of disallowed) {
			assert.ok(
				!route.startsWith(path),
				`robots.txt disallows ${path}, which covers the noindex route ${route}. A blocked ` +
					'crawler never reads the noindex, and the URL can still be indexed from a link.'
			);
		}
	}
});

test('sitemap URLs use the canonical origin', () => {
	// A sitemap pointing at another host is ignored outright by crawlers.
	for (const loc of sitemapLocs()) {
		assert.ok(loc.startsWith(`${APP_ORIGIN}/`) || loc === `${APP_ORIGIN}/`, `${loc} is off-origin`);
	}
});

test('robots.txt allows crawling and names the sitemap', () => {
	assert.ok(
		ROBOTS.includes(`Sitemap: ${APP_ORIGIN}/sitemap.xml`),
		'robots.txt must carry the Sitemap line, or the sitemap is only found by luck'
	);
	assert.ok(
		!/Disallow:\s*\/\s*$/m.test(ROBOTS),
		'robots.txt must not disallow everything — the content pages are how people find this'
	);
});
