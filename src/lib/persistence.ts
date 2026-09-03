/**
 * Durable storage.
 *
 * ## Why this exists
 *
 * Everything this app knows lives in one IndexedDB database in one browser profile.
 * By default that storage is *best-effort*: when a device runs short of space the
 * browser is free to evict whole origins to reclaim it, and it does so without asking
 * and without telling anyone afterwards. For a photo gallery that is a cache miss. Here
 * it is the complete loss of somebody's medication history — the doses, the stock
 * ledger, the order record — with no error, no prompt, and nothing on screen to
 * explain where it went.
 *
 * `navigator.storage.persist()` asks the browser to mark the origin as *persistent*
 * instead, which takes it out of the eviction pool: it can then only be cleared by the
 * user, deliberately. That is the whole of what this module does.
 *
 * ## When the request is made, and why not sooner
 *
 * Never on an empty first visit. The two engines behave quite differently:
 *
 * - **Chromium** decides silently, from installation and engagement signals. Asking
 *   costs the user nothing, so the timing is irrelevant there.
 * - **Firefox** shows a permission prompt. Asking somebody who has just scanned a QR
 *   code on a leaflet and not yet typed anything is hostile — and worse, it is a
 *   question about protecting data that does not exist. A refusal at that moment is
 *   remembered, so the one chance to ask has been spent on nothing.
 *
 * So the request waits until the database holds a regimen: `watchStoredData()` observes
 * the existing `regimen` store and fires once products or therapies appear, whether
 * they arrived from the example seed, from Setup, or from a restored backup. By then
 * there is something to lose, which is exactly when the question makes sense.
 *
 * `persisted()` is read first and never prompts, so an origin that is already
 * persistent — a reinstalled app, a returning user — is recognised without asking
 * again.
 *
 * ## What the outcome is used for
 *
 * One thing only: Setup says plainly, in the section about backups, that permanent
 * storage has not been guaranteed and that exporting a backup is the protection. A
 * granted origin shows nothing, and so does a browser without the API — there is
 * nothing useful to say, and a notice about a risk the user cannot act on is noise.
 *
 * @see https://developer.mozilla.org/en-US/docs/Web/API/StorageManager/persist
 * @see https://web.dev/articles/persistent-storage
 */

import { browser } from '$app/environment';
import { writable, type Readable } from 'svelte/store';
import { regimen } from './db';

/**
 * What the browser has said about keeping this data.
 *
 * - `unknown` — not asked yet, or the browser gave no usable answer. Nothing to report.
 * - `granted` — the origin is persistent and will not be evicted under pressure.
 * - `refused` — the browser declined. The data can still be evicted.
 * - `unsupported` — no Storage API, so the question cannot be put at all.
 */
export type PersistenceState = 'unknown' | 'granted' | 'refused' | 'unsupported';

/**
 * The part of `StorageManager` this module uses.
 *
 * Declared as an interface so the logic can be exercised with a stub in a test. There is
 * no browser in the unit suite, and a feature whose only failure mode is silent data
 * loss should not be tested exclusively by hand.
 */
export interface StorageManagerLike {
	persisted(): Promise<boolean>;
	persist(): Promise<boolean>;
}

/**
 * Read whether the origin is already persistent, without asking for anything.
 *
 * `persisted()` never prompts, so this is safe to call on any visit, including an empty
 * one. A `false` answer is reported as `unknown` rather than `refused`: not yet granted
 * is not the same as declined, and the difference decides whether Setup says anything.
 */
export async function checkPersisted(
	storage: StorageManagerLike | undefined
): Promise<PersistenceState> {
	if (!storage || typeof storage.persisted !== 'function') return 'unsupported';

	try {
		return (await storage.persisted()) ? 'granted' : 'unknown';
	} catch {
		// A rejected promise says nothing about eviction either way. Claiming a refusal
		// here would put a warning on screen off the back of an unrelated fault.
		return 'unknown';
	}
}

/**
 * Ask the browser to keep this origin, unless it already does.
 *
 * `persisted()` first, so an already-persistent origin is never re-asked — which on
 * Firefox would mean a second permission prompt for a permission already held.
 */
export async function requestPersistence(
	storage: StorageManagerLike | undefined
): Promise<PersistenceState> {
	if (
		!storage ||
		typeof storage.persisted !== 'function' ||
		typeof storage.persist !== 'function'
	) {
		return 'unsupported';
	}

	try {
		if (await storage.persisted()) return 'granted';
		return (await storage.persist()) ? 'granted' : 'refused';
	} catch {
		return 'unknown';
	}
}

/** The real `navigator.storage`, or `undefined` where it does not exist. */
function platformStorage(): StorageManagerLike | undefined {
	if (!browser) return undefined;
	return navigator.storage as StorageManagerLike | undefined;
}

/*
 * Named `current` rather than `state`, because `$state` is a Svelte 5 rune and the store
 * auto-subscription prefix collides with it — the same reason the regimen store is not
 * called `state`.
 */
const current = writable<PersistenceState>('unknown');

/**
 * What the browser has said, as a store, so Setup re-renders when the answer arrives.
 *
 * Stays `unknown` outside the browser, which is what the prerendered content pages need:
 * they render the shared layout on the server, where there is no `navigator`.
 */
export const persistence: Readable<PersistenceState> = { subscribe: current.subscribe };

/** Whether `ensurePersistence` has already run. The request is made at most once a page. */
let asked = false;

/**
 * Request persistence once, and publish the outcome.
 *
 * Idempotent, so callers do not have to track whether it has happened. Repeat calls
 * return immediately rather than putting the question again.
 */
export async function ensurePersistence(): Promise<void> {
	if (!browser || asked) return;
	asked = true;
	current.set(await requestPersistence(platformStorage()));
}

/**
 * Watch for the database holding a regimen, then ask.
 *
 * Returns an unsubscribe function for the caller's teardown. The observation is cheap:
 * the root layout already subscribes to `regimen` for the day counter, so this attaches
 * to a query that is running regardless.
 *
 * On the way in it also reads `persisted()`, which asks for nothing — so an origin that
 * is already persistent is recognised on an empty first visit too, and no prompt is ever
 * queued for it.
 */
export function watchStoredData(): () => void {
	if (!browser) return () => {};

	void checkPersisted(platformStorage()).then((initial) => {
		// Only ever an upgrade from the starting value. A later `ensurePersistence` result
		// is the more informed answer and must not be overwritten by this one arriving late.
		if (initial !== 'unknown') current.update((value) => (value === 'unknown' ? initial : value));
	});

	return regimen.subscribe((state) => {
		if (!state) return;
		if (state.products.length > 0 || state.therapies.length > 0) void ensurePersistence();
	});
}
