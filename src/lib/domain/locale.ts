/**
 * Languages the app produces text in.
 *
 * Base language codes rather than regional tags, matched against the browser by base
 * language, and the wording is international rather than tied to one country. French and
 * German therefore read the same in Lausanne, Lyon, Bern or Berlin — which matters
 * because transplant recipients move, and because a Swiss-only variant would exclude far
 * more readers than it would please. The German uses standard orthography, including "ß".
 *
 * Portuguese keeps its qualifier: European and Brazilian Portuguese diverge enough in
 * everyday vocabulary that claiming to serve both from one file would be a promise this
 * cannot keep.
 *
 * Italian follows the same international rule as French and German: standard Italian
 * rather than a Ticino variant, so it reads the same in Lugano, Milan or Rome and needs
 * no country qualifier.
 *
 * Kept in the domain because the pharmacy order and the calendar export are produced
 * here, and those are the two artefacts that actually leave the app.
 */
export type Locale = 'en' | 'fr' | 'de' | 'pt' | 'it';

export const LOCALES: ReadonlyArray<{ value: Locale; label: string }> = [
	{ value: 'en', label: 'English' },
	{ value: 'fr', label: 'Français' },
	{ value: 'de', label: 'Deutsch' },
	{ value: 'pt', label: 'Português (Portugal)' },
	{ value: 'it', label: 'Italiano' }
];

/**
 * The locale implied by a list of browser languages, in preference order.
 *
 * The first supported entry wins, so a Swiss browser set to `['de-CH', 'fr-CH', 'en']`
 * gets German — the user's own first choice — rather than falling through to English.
 * An unsupported language falls back to English rather than to something merely
 * geographically close: a half-understood interface is worse than a foreign one you can
 * at least read consistently. Regional tags are collapsed to the base language, so fr-CH
 * and fr-CA both get the same French.
 */
export function detectLocale(candidates: readonly string[]): Locale {
	const supported = new Set<string>(['en', 'fr', 'de', 'pt', 'it']);

	for (const candidate of candidates) {
		const base = candidate.toLowerCase().split('-')[0];
		if (supported.has(base)) return base as Locale;
	}

	return 'en';
}
