import { test } from 'vitest';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';

/**
 * Personal data must never be committed.
 *
 * This repository has already leaked a personal mailbox, a work address and the
 * maintainer's home town once each — every one written in good faith as useful
 * context, and every one scrubbed by hand later. The scan in
 * `scripts/check-personal-data.mjs` is the machine that reads for the third leak.
 *
 * The pre-commit hook in `.githooks/` runs the same script against staged content,
 * which is the layer that actually protects history: once pushed, a leak is permanent
 * short of rewriting every clone. This test is the backstop for a commit made with
 * the hook bypassed or never configured — CI fails on it either way.
 */
test('no tracked file contains personal data', () => {
	try {
		execFileSync('node', ['scripts/check-personal-data.mjs'], { encoding: 'utf8' });
	} catch (error) {
		const stderr = (error as { stderr?: string }).stderr ?? '';
		assert.fail(`personal data found in the repository:\n${stderr}`);
	}
});
