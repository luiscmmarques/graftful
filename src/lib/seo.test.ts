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

test('every route is in the sitemap, and nothing else is', () => {
	const locs = new Set(sitemapLocs());
	for (const route of routes()) {
		const expected = route === '/' ? `${APP_ORIGIN}/` : `${APP_ORIGIN}${route}`;
		assert.ok(locs.has(expected), `${route} is missing from static/sitemap.xml (${expected})`);
		locs.delete(expected);
	}
	assert.deepEqual(
		[...locs],
		[],
		'static/sitemap.xml lists URLs that are not routes — remove them, or a crawler chases 404s'
	);
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
