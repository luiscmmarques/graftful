/**
 * Which language to produce.
 *
 * Follows the browser by default and can be overridden in Setup. Following the
 * browser is the right default because the first users arrive from a French-speaking
 * transplant centre by scanning a QR code — being asked to pick a language before
 * seeing anything would be friction at exactly the wrong moment. But the override
 * matters too: plenty of people run an English-language phone and would still rather
 * send their pharmacy a French email.
 *
 * Only `en` and `fr` exist. Anything else falls back to English rather than guessing:
 * a half-translated interface is worse than a foreign one you can at least trust.
 *
 * ## What this already changes
 *
 * The domain layer has taken a `locale` argument from the start, so this immediately
 * decides the language of the two artefacts that leave the app: the pharmacy order
 * text and the calendar export. The interface chrome is still English — see TODO.md
 * for why translating it is deliberately a later, single pass.
 */

import { browser } from '$app/environment';
import { derived, type Readable } from 'svelte/store';
import { settingsStore } from './db';
import { detectLocale, type Locale } from './domain/locale.ts';

export { type Locale, LOCALES } from './domain/locale.ts';

function browserLocale(): Locale {
	if (!browser) return 'en';
	const candidates = navigator.languages?.length ? navigator.languages : [navigator.language];
	return detectLocale(candidates);
}

/** The locale in force: the saved override if there is one, otherwise the browser's. */
export const locale: Readable<Locale> = derived(
	settingsStore,
	($settings) => $settings?.locale ?? browserLocale()
);

/**
 * Keep `<html lang>` in step.
 *
 * Not cosmetic: it is what a screen reader uses to choose pronunciation, and getting
 * it wrong makes French drug names unintelligible when read aloud.
 */
if (browser) {
	locale.subscribe((value) => {
		document.documentElement.lang = value;
	});
}
