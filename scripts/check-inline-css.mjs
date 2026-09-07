#!/usr/bin/env node
/**
 * Render-blocking stylesheet guard.
 *
 * `inlineStyleThreshold` in vite.config.ts folds every route's CSS into the prerendered
 * documents, which is what removed the last render-blocking requests from the first paint —
 * three of them on the Today page, roughly 300 ms each on a throttled phone, to deliver about
 * 3 KB between them.
 *
 * It fails silently in the direction that matters. A stylesheet that grows one character past
 * the limit goes back to being a `<link rel="stylesheet">`, nothing anywhere says so, and the
 * cost lands on first-time visitors on slow connections — the people least able to tell it is
 * the app's fault and least likely to report it. So the threshold is checked rather than
 * hoped for.
 *
 * Why this runs from the `build` script rather than a Vite plugin hook, and why it is not a
 * unit test, is recorded at `INLINE_STYLE_THRESHOLD` in vite.config.ts.
 *
 * Both ways out are legitimate, so this names the file and reports the size rather than
 * prescribing a fix: trim the stylesheet, or raise the threshold and accept that it is
 * duplicated into every prerendered document. What it refuses to allow is the change passing
 * unnoticed.
 */

import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const ASSETS = 'build/_app/immutable/assets';

/*
 * The threshold is read out of vite.config.ts rather than repeated here, because two copies
 * of a number that must agree is the whole failure mode this script exists to prevent. If the
 * constant is ever renamed the read fails loudly — the same choice headers.test.ts makes in
 * refusing to skip when it cannot find what it is checking. A guard that quietly passes when
 * it cannot do its job is worse than no guard, because it also removes the suspicion.
 */
function threshold() {
	const config = readFileSync('vite.config.ts', 'utf8');
	const found = config.match(/^const INLINE_STYLE_THRESHOLD = (\d+);/m);
	if (!found) {
		console.error(
			'check-inline-css: could not find `const INLINE_STYLE_THRESHOLD = <number>;` in ' +
				'vite.config.ts.\nIf it was renamed, update this script to match — do not delete ' +
				'the check.'
		);
		process.exit(1);
	}
	return Number(found[1]);
}

const limit = threshold();

let stylesheets;
try {
	stylesheets = readdirSync(ASSETS).filter((name) => name.endsWith('.css'));
} catch {
	console.error(`check-inline-css: no ${ASSETS} directory. Run this after \`vite build\`.`);
	process.exit(1);
}

/*
 * SvelteKit measures the limit in UTF-16 code units, so this compares string length rather
 * than byte length. The two are identical for the ASCII the app emits today and diverge the
 * moment a stylesheet carries a non-Latin character — a `content: '…'` rule is enough.
 */
const tooBig = stylesheets
	.map((name) => ({ name, length: readFileSync(join(ASSETS, name), 'utf8').length }))
	.filter((sheet) => sheet.length > limit);

if (tooBig.length > 0) {
	console.error(
		`check-inline-css: ${tooBig.length} stylesheet(s) exceed the ${limit} UTF-16 code unit ` +
			`inlineStyleThreshold, so they ship as render-blocking <link rel="stylesheet"> and ` +
			`delay the first paint:\n` +
			tooBig.map((sheet) => `  ${sheet.name} — ${sheet.length}`).join('\n') +
			`\n\nEither trim the stylesheet, or raise INLINE_STYLE_THRESHOLD in vite.config.ts and ` +
			`accept that it is duplicated into every prerendered document.`
	);
	process.exit(1);
}

console.log(
	`check-inline-css: ${stylesheets.length} stylesheet(s), all within the ${limit} unit ` +
		`threshold, so none blocks the first paint.`
);
