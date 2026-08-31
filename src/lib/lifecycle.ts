/**
 * Page lifecycle, and the current date as a reactive value.
 *
 * ## Why this exists
 *
 * The back/forward cache keeps a page's entire JavaScript heap alive when you
 * navigate away, and restores it verbatim on the way back. Nothing re-runs: no
 * module initialisation, no component setup, no `load`. That is what makes it fast,
 * and it is also a trap for any value computed once and assumed current.
 *
 * This app had exactly that bug. Every screen did `const today = todayIso()` at
 * setup, so a page opened at 23:55 and returned to at 00:05 would still believe it
 * was yesterday — showing the wrong doses as due, understating how urgently stock
 * needs reordering, and silently evaluating order triggers against a stale date.
 * Backgrounding an app on a phone overnight is not an edge case; it is the normal
 * way people use one.
 *
 * A frozen page also runs no timers, so a midnight `setTimeout` alone is not enough.
 * The date is therefore refreshed from three directions: a timer for the case where
 * the page stays open, `pageshow` for a bfcache restore, and `visibilitychange` for
 * the ordinary case of returning to a backgrounded tab.
 *
 * ## Staying eligible
 *
 * bfcache is not opt-in. It is opt-*out*, and easy to lose by accident:
 *
 * - **Never add an `unload` listener.** It disqualifies the page outright in Chrome
 *   and Firefox. `beforeunload` disqualifies in Firefox and is discouraged
 *   everywhere. There is a test asserting neither appears in this codebase, because
 *   the day someone adds "warn about unsaved changes" is the day this silently
 *   stops working with no error anywhere.
 * - **Never serve the document with `Cache-Control: no-store`.** That is a hard
 *   blocker in Chrome. See `static/_headers`.
 * - Use `pagehide`/`visibilitychange` for teardown, never `unload`.
 *
 * @see https://developer.mozilla.org/en-US/docs/Glossary/bfcache
 * @see https://web.dev/articles/bfcache
 */

import { browser } from '$app/environment';
import { readable, type Readable } from 'svelte/store';
import { todayIso } from './util.ts';

/**
 * Milliseconds until the next local midnight.
 *
 * Local rather than UTC because the question is "when does the user's day roll
 * over". Pure, so the awkward cases are testable: the value is always positive and
 * never more than a day, including across a daylight-saving change, where a local
 * day can be 23 or 25 hours long.
 */
export function msUntilNextLocalMidnight(now: Date): number {
	const next = new Date(now);
	next.setHours(24, 0, 0, 0);
	const delta = next.getTime() - now.getTime();
	// Guard against a zero or negative interval, which would spin the timer.
	return delta > 0 ? delta : 1;
}

/**
 * Callbacks to run whenever the page becomes current again — restored from
 * bfcache, or simply brought back to the foreground.
 */
const restoreHandlers = new Set<() => void>();

/**
 * Register work to redo when the page is restored or refocused.
 *
 * Returns an unsubscribe function. Handlers must be cheap and idempotent: on a
 * phone this fires every time the user switches back to the app.
 */
export function onRestore(handler: () => void): () => void {
	restoreHandlers.add(handler);
	return () => restoreHandlers.delete(handler);
}

function runRestoreHandlers() {
	for (const handler of restoreHandlers) handler();
}

if (browser) {
	/*
	 * `persisted` is true only for a genuine bfcache restore. The handlers run either
	 * way: a normal load has nothing stale to fix, and running them twice is harmless
	 * because they are idempotent.
	 */
	window.addEventListener('pageshow', (event) => {
		if (event.persisted) runRestoreHandlers();
	});

	document.addEventListener('visibilitychange', () => {
		if (document.visibilityState === 'visible') runRestoreHandlers();
	});
}

/**
 * The current calendar day, as YYYY-MM-DD, kept correct for the life of the page.
 *
 * Static outside the browser so the prerendered content pages stay deterministic.
 */
export const today: Readable<string> = browser
	? readable(todayIso(), (set) => {
			let timer: ReturnType<typeof setTimeout>;

			const refresh = () => {
				set(todayIso());
				schedule();
			};

			const schedule = () => {
				clearTimeout(timer);
				timer = setTimeout(refresh, msUntilNextLocalMidnight(new Date()));
			};

			schedule();
			const off = onRestore(() => set(todayIso()));

			return () => {
				clearTimeout(timer);
				off();
			};
		})
	: readable(todayIso());
