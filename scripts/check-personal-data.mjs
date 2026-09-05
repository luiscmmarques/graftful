#!/usr/bin/env node
/**
 * Personal-data guard.
 *
 * Scans file contents and file names for patterns that have already leaked into this
 * repository once and were scrubbed by hand: a personal mailbox, a work address, the
 * maintainer's home town, a payment method that encodes a phone number. The point is
 * that the *second* leak is caught by a machine rather than by a reader.
 *
 * Two callers, one source of truth for the patterns:
 *   - `.githooks/pre-commit` runs it with `--staged` against staged content, so a
 *     leak is stopped before it enters history (history cannot be scrubbed after a
 *     push — the first Gmail leak is permanent for exactly that reason).
 *   - `src/lib/personal-data.test.ts` runs it against every tracked file, so CI
 *     catches a commit made with the hook bypassed or never configured.
 *
 * Every pattern is assembled from fragments so this file never matches itself.
 * Deliberately NOT guarded: the transplant story on the About page (hospital, date) —
 * that disclosure was made knowingly and is recorded in TODO.md.
 */

import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

const joined = (...parts) => parts.join('');
const rx = (source, flags = 'i') => new RegExp(source, flags);

const RULES = [
	{
		name: 'personal Gmail address',
		pattern: rx(joined('marques', '\\.?', 'luis88'))
	},
	{
		// The repository's only legitimate addresses are @graftful.app and the GitHub
		// noreply. Any personal-mailbox domain is a leak, whoever it belongs to.
		name: 'personal mailbox domain',
		pattern: rx(
			joined('@', '(gmail|googlemail|hotmail|outlook|icloud|yahoo|bluewin|proton)', '\\.')
		)
	},
	{
		name: 'employer email address',
		pattern: rx(joined('@', 'ama', 'zon\\.'))
	},
	{
		// The employer or its cloud products, by name. Naming them connects a personal
		// health project to a workplace, and the hosting decision is recorded without
		// naming the alternatives considered (see COSTS.md) — deliberately.
		name: 'employer or employer product name',
		pattern: rx(joined('\\b(', 'ama', 'zon|', 'aw', 's)\\b'))
	},
	{
		name: 'work alias as a mailbox',
		pattern: rx(joined('luis', 'cmm', '@'))
	},
	{
		// The lookbehind stops matches inside base64 integrity hashes, where `+41`
		// followed by digits occurs by chance.
		name: 'Swiss phone number (international format)',
		pattern: rx(joined('(?<![A-Za-z0-9+/=])\\+', '41', '[\\s./-]?\\d{2}[\\s./-]?\\d{3}'), '')
	},
	{
		// Separators required: ten unbroken digits appear legitimately inside hashes.
		name: 'Swiss mobile number',
		pattern: rx(joined('\\b0', '7[5-9]', '[\\s./-]\\d{3}[\\s./-]\\d{2}[\\s./-]\\d{2}\\b'), '')
	},
	{
		name: 'home town',
		pattern: rx(joined('mart', 'igny'))
	},
	{
		// Removed project-wide because a personal QR for it encodes a mobile number.
		name: 'payment method tied to a phone number',
		pattern: rx(joined('tw', 'int'))
	}
];

/** Content scanning is skipped for binaries; their names are still checked. */
const BINARY = /\.(png|ico|jpg|jpeg|webp|gif|woff2?|pdf|zip)$/i;

/** Generated, huge, and full of base64 — file names are still checked. */
const GENERATED = /(^|\/)(package-lock\.json|.*\.lock|bun\.lockb)$/i;

function git(args) {
	return execFileSync('git', args, { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
}

function trackedFiles() {
	return git(['ls-files', '-z']).split('\0').filter(Boolean);
}

function stagedFiles() {
	return git(['diff', '--cached', '--name-only', '-z', '--diff-filter=ACMR'])
		.split('\0')
		.filter(Boolean);
}

function contentOf(path, staged) {
	try {
		// Staged mode reads the staged blob, not the working tree: what is about to be
		// committed is what matters, and the two can differ. The full scan reads the
		// working tree, so `npm test` catches a leak before it is even staged.
		if (staged) return git(['show', `:${path}`]);
		return readFileSync(path, 'utf8');
	} catch {
		return null;
	}
}

function scan(files, { staged }) {
	const findings = [];

	for (const path of files) {
		for (const rule of RULES) {
			if (rule.pattern.test(path)) {
				findings.push(`${path} (file name): ${rule.name}`);
			}
		}

		if (BINARY.test(path) || GENERATED.test(path)) continue;
		const content = contentOf(path, staged);
		if (content === null) continue;

		const lines = content.split('\n');
		for (const rule of RULES) {
			for (let i = 0; i < lines.length; i++) {
				if (rule.pattern.test(lines[i])) {
					findings.push(`${path}:${i + 1}: ${rule.name}`);
					break; // One report per rule per file is enough to act on.
				}
			}
		}
	}

	return findings;
}

const staged = process.argv.includes('--staged');
const files = staged ? stagedFiles() : trackedFiles();
const findings = scan(files, { staged });

if (findings.length > 0) {
	console.error('Personal data found:\n');
	for (const finding of findings) console.error(`  ${finding}`);
	console.error(
		'\nRemove it before committing. If the match is a false positive, refine the rule in' +
			'\nscripts/check-personal-data.mjs — do not bypass the hook, because the unit test' +
			'\nruns the same scan and CI will fail on it anyway.'
	);
	process.exit(1);
}

process.exit(0);
