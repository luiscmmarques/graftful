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
 * Four languages exist: English, French, German and Portuguese. Anything else falls back
 * to English rather than guessing, because a half-understood interface is worse than a
 * foreign one you can at least read consistently.
 *
 * ## What this changes
 *
 * The domain layer has taken a `locale` argument from the start, so this decides the
 * language of the two artefacts that leave the app — the pharmacy order text and the
 * calendar export — as well as every screen, which reads its copy from
 * `src/lib/i18n`.
 */

import { browser } from '$app/environment';
import { derived, type Readable } from 'svelte/store';
import { settingsStore } from './db';
import { detectLocale, type Locale } from './domain/locale.ts';

export { type Locale, LOCALES } from './domain/locale.ts';

/**
 * The locale the browser asks for, ignoring any saved override.
 *
 * Exported because Setup's "Follow my browser" option names the language it would fall
 * back to. Reading the locale in force there would name the override instead, which is
 * the one thing that option is not.
 */
export function browserLocale(): Locale {
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
