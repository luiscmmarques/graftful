import { test } from 'vitest';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

/*
 * A store or rune sigil rendered as literal text.
 *
 * This happened: a bulk rewrite that replaced the `today` variable with the `$today`
 * store also caught the English word "today" in prose, so Setup read "Stopping ends
 * consumption from $today". It compiles, it renders, and it is gibberish only to a human.
 *
 * Deliberately a source scan rather than a browser check. The first version of this test
 * read `body.innerText` on every page and passed even with the bug deliberately
 * reintroduced — because the offending sentence sits inside a collapsed therapy editor
 * that a page visit never expands. Most of Setup's copy is behind a panel, so anything
 * that only inspects what is currently visible gives false confidence.
 */

function svelteFiles(dir: string): string[] {
	return readdirSync(dir).flatMap((entry) => {
		const path = join(dir, entry);
		if (statSync(path).isDirectory()) return svelteFiles(path);
		return entry.endsWith('.svelte') ? [path] : [];
	});
}

function tsFiles(dir: string): string[] {
	return readdirSync(dir).flatMap((entry) => {
		const path = join(dir, entry);
		if (statSync(path).isDirectory()) return tsFiles(path);
		return entry.endsWith('.ts') ? [path] : [];
	});
}

/** Everything a user could read: markup with script, style, comments and {expressions} removed. */
export function visibleMarkup(source: string): string {
	let text = source
		.replace(/<script[\s\S]*?<\/script>/g, ' ')
		.replace(/<style[\s\S]*?<\/style>/g, ' ')
		.replace(/<!--[\s\S]*?-->/g, ' ');

	// Strip Svelte expressions innermost-first, so nested braces are handled.
	let previous: string;
	do {
		previous = text;
		text = text.replace(/\{[^{}]*\}/g, ' ');
	} while (text !== previous);

	return text;
}

test('the markup scanner ignores expressions but keeps prose', () => {
	// Guards the guard: a scanner that strips too much would pass everything.
	assert.match(visibleMarkup('<p>Due {$today} now</p>'), /Due\s+now/);
	assert.doesNotMatch(visibleMarkup('<p>{$today}</p>'), /\$today/);
	assert.match(visibleMarkup('<p>from $today and</p>'), /\$today/);
	assert.doesNotMatch(visibleMarkup('<script>const x = $today;</script>'), /\$today/);
	assert.match(visibleMarkup('<p>{fn({ a: 1 })} kept</p>'), /kept/);
});

test('no store or rune sigil is rendered as literal text', () => {
	const offenders: string[] = [];

	for (const path of svelteFiles('src/routes').concat(svelteFiles('src/lib'))) {
		const text = visibleMarkup(readFileSync(path, 'utf8'));
		for (const match of text.matchAll(/\$[a-zA-Z_][\w.]*/g)) {
			offenders.push(`${path}: ${match[0]}`);
		}
	}

	assert.deepEqual(
		offenders,
		[],
		'A $ sigil is being rendered as text. Wrap it in braces, or it was a prose word ' +
			'caught by a rename.'
	);
});

test('no build-time env variable is imported in a way that breaks a clean clone', () => {
	/*
	 * `.env` is gitignored, so a fresh clone, CI and Cloudflare Pages all build without one.
	 * Importing a named export from the static public env module is a hard error when that
	 * variable is absent, and the failure surfaces as a missing service worker file rather than
	 * anything mentioning env, which cost real time to diagnose. Build-time values go through a
	 * `define` in vite.config.ts instead, where an absent variable is an empty string.
	 *
	 * The needle is assembled rather than written out, so this test does not match itself.
	 */
	const needle = ['$env', 'static', 'public'].join('/');

	const offenders = svelteFiles('src/routes')
		.concat(svelteFiles('src/lib'))
		.concat(tsFiles('src/lib'))
		.filter((path) => !path.endsWith('.test.ts'))
		.filter((path) => readFileSync(path, 'utf8').includes(needle));

	assert.deepEqual(
		offenders,
		[],
		`use a define in vite.config.ts instead: importing from ${needle} fails the build ` +
			'outright when the variable is missing, which is the normal case outside a ' +
			'developer machine'
	);
});
