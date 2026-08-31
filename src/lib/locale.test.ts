import { test } from 'vitest';
import assert from 'node:assert/strict';

import { detectLocale, LOCALES } from './domain/locale.ts';

test('the first supported language in preference order wins', () => {
	// The user's own ordering decides. A Swiss browser listing German first gets German,
	// not whatever we would have guessed from the country.
	assert.equal(detectLocale(['de-CH', 'fr-CH', 'en']), 'de');
	assert.equal(detectLocale(['fr-CH', 'de-CH']), 'fr');
	assert.equal(detectLocale(['en-GB', 'fr']), 'en');
});

test('an unsupported first choice is skipped, not treated as the end of the search', () => {
	assert.equal(detectLocale(['es-ES', 'fr-CH', 'en']), 'fr');
	assert.equal(detectLocale(['it-CH', 'de-CH']), 'de');
});

test('regions are ignored, only the base language matters', () => {
	// fr-BE and fr-CH get the same French; the content is Swiss-flavoured either way.
	assert.equal(detectLocale(['fr-BE']), 'fr');
	assert.equal(detectLocale(['pt-BR']), 'pt');
	assert.equal(detectLocale(['EN-us']), 'en');
});

test('an unsupported language falls back to English rather than guessing', () => {
	// A half-understood interface is worse than a foreign one that is at least consistent.
	assert.equal(detectLocale(['es-ES', 'it']), 'en');
	assert.equal(detectLocale([]), 'en');
});

test('every offered locale is actually detectable', () => {
	// Guards against adding a language to the picker that detection cannot return.
	for (const { value } of LOCALES) assert.equal(detectLocale([value]), value);
});
