/**
 * The message catalogue for the locale in force.
 *
 * Read in a component as `$t.today.title`. A store rather than a function call so that
 * changing the language in Setup re-renders every screen without a reload.
 *
 * ## Why the four non-English catalogues are loaded on demand
 *
 * They used to be five static imports, which put all five languages in one chunk together
 * with Dexie: 99 KB gzipped, 64% of the whole page weight, and on the critical path of
 * every route. Four of those five are text nobody on that visit will ever read. Lighthouse
 * measured the chunk as the longest network chain on the app, and it gates the largest
 * contentful paint on every screen — the prerendered shell says only "Loading…", so nothing
 * meaningful can paint until this arrives, hydration runs and IndexedDB answers. Splitting
 * the four takes ~55 KB gzipped off a first visit.
 *
 * English stays a static import on purpose, for three reasons that all point the same way:
 * it is the source catalogue that defines the type, it is the fallback for every language
 * the app does not ship, and it is what the prerendered documents already contain (the
 * prerender runs with no browser, so `locale` resolves to `en`). Making it lazy too would
 * add a round trip for the one catalogue that is certain to be needed, and would leave the
 * store with nothing to hold in the meantime.
 *
 * ## What this costs, and what it does not
 *
 * A French visitor's first load shows the English shell — as it already did, because that
 * is what was prerendered — for roughly one extra round trip before the French arrives.
 * Every later visit pays nothing: the service worker precaches `**\/*.js`, so all four
 * catalogue chunks are already on the device and the import resolves from the cache. That
 * also means changing language still works with no network, which is the property that
 * matters for an app people open on a phone in a pharmacy queue.
 *
 * The one thing this must not do is flash English mid-session. Switching from French to
 * German keeps the French visible until the German has loaded, rather than falling back
 * through the source language — see the generation counter below.
 */

import { readable, type Readable } from 'svelte/store';
import type { Locale } from '$lib/domain/locale';
import { locale } from '$lib/locale';
import { en } from './en-source.ts';
import type { Messages } from './messages.ts';

/**
 * The lazy half of the catalogue.
 *
 * Typed as `Messages` per entry, so a language with a missing or misspelled key is still a
 * compile error — the whole point of `messages.ts` — and `Record<Exclude<Locale, 'en'>, …>`
 * means adding a sixth language to `Locale` fails to compile until it is listed here too.
 *
 * The paths are relative and keep their `.ts` extension. An aliased `$lib/i18n/fr.ts` would
 * not resolve: `rewriteRelativeImportExtensions` only covers relative paths.
 */
const LAZY: Record<Exclude<Locale, 'en'>, () => Promise<Messages>> = {
	fr: () => import('./fr.ts').then((module) => module.fr),
	de: () => import('./de.ts').then((module) => module.de),
	pt: () => import('./pt.ts').then((module) => module.pt),
	it: () => import('./it.ts').then((module) => module.it)
};

/**
 * Catalogues already in memory, so switching back to a language is instant.
 *
 * A dynamic import is itself cached by the module registry, but it still resolves on a
 * microtask, which would mean one frame of the previous language on every switch back.
 */
const resolved = new Map<Exclude<Locale, 'en'>, Messages>();

export const t: Readable<Messages> = readable(en, (set) => {
	/*
	 * Guards against a slow catalogue overwriting a newer choice. Switch from French to
	 * German quickly enough and the French import can settle last; without this, the screen
	 * would end up in French while Setup says German.
	 */
	let generation = 0;

	return locale.subscribe(($locale) => {
		generation += 1;
		const wanted = generation;

		// Checked before the map, not looked up in it, so the narrowing below is the compiler's
		// rather than an assertion: everything past here is a language that has to be fetched.
		if ($locale === 'en') {
			set(en);
			return;
		}

		const ready = resolved.get($locale);
		if (ready) {
			set(ready);
			return;
		}

		LAZY[$locale]()
			.then((messages) => {
				resolved.set($locale, messages);
				if (generation === wanted) set(messages);
			})
			.catch((error) => {
				/*
				 * The catalogue is precached, so this means offline on a first visit — before the
				 * service worker finished installing. Staying on the language already displayed is
				 * the only useful response: there is nothing else to show, and an empty screen
				 * would be worse than one in the wrong language.
				 */
				console.error(`Could not load the ${$locale} messages`, error);
			});
	});
});

export type { Messages };
