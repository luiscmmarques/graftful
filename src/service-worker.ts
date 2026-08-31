/// <reference lib="webworker" />
/**
 * Service worker.
 *
 * Hand-written rather than generated, because v2 needs a `push` handler here that
 * reads IndexedDB and composes the notification text on-device — the server will
 * only ever send an empty payload.
 *
 * `injectManifest` replaces `self.__WB_MANIFEST` with the build's precache list.
 * That substitution only happens in a real build, so everything that depends on it
 * is guarded: without the guard the whole script throws on evaluation, the
 * registration fails, and none of the handlers below are installed either.
 */

import {
	cleanupOutdatedCaches,
	createHandlerBoundToURL,
	precacheAndRoute
} from 'workbox-precaching';
import { NavigationRoute, registerRoute } from 'workbox-routing';
import { clientsClaim } from 'workbox-core';

declare const self: ServiceWorkerGlobalScope & {
	__WB_MANIFEST?: Array<{ url: string; revision: string | null }>;
};

/*
 * Take over as soon as possible, rather than waiting for every tab to close.
 *
 * `skipWaiting` plus `clientsClaim` is the pair that makes an update actually apply.
 * Asset filenames are hashed, so the files the previous worker precached stop existing
 * the moment a new version is deployed — leaving the old worker in charge means it
 * serves URLs that now 404. Replacing it promptly is the safer failure mode.
 *
 * It also matters on first visit. People will arrive by scanning a QR code on a flyer
 * in a hospital corridor; without claiming, the first load leaves the page
 * uncontrolled, and losing signal before navigating again means nothing was cached.
 */
clientsClaim();

const manifest = self.__WB_MANIFEST;

if (Array.isArray(manifest) && manifest.length > 0) {
	precacheAndRoute(manifest);
	cleanupOutdatedCaches();

	/*
	 * Fallback for a path with no prerendered shell of its own — a typo, or a route
	 * added since this worker was cached. Every real route *does* have its own shell
	 * (see src/routes/+layout.ts), so this is the exception rather than the mechanism.
	 *
	 * Bound to the precached copy rather than fetching, so the revision is respected
	 * and a stale shell is not served after an update. Guarded because
	 * `createHandlerBoundToURL` throws if the URL is not in the manifest, and a throw
	 * out here would take the whole worker down with it — including the handlers below.
	 */
	try {
		registerRoute(
			new NavigationRoute(createHandlerBoundToURL('/'), {
				denylist: [/^\/api\//]
			})
		);
	} catch (error) {
		console.warn('[Graftful] No precached shell to use as a navigation fallback', error);
	}
}

self.addEventListener('message', (event) => {
	if (event.data?.type === 'SKIP_WAITING') self.skipWaiting();
});

/**
 * Dormant in v1, and deliberately still here: v2 delivers reminders by push, and this
 * is where the text gets composed.
 *
 * The payload will always be empty. The server knows only *when* to ping a
 * subscription, never what the reminder says — the text is built here, on the device,
 * from data that never left it.
 *
 * Guarded on permission. A push handler is required to show a notification, but
 * `showNotification` rejects outright if permission was never granted or has since
 * been revoked, and an unhandled rejection inside `waitUntil` surfaces as a console
 * error with no way for the user to act on it. Permission can genuinely disappear
 * under us: people revoke it in site settings long after subscribing.
 */
async function showDoseReminder(): Promise<void> {
	if (self.Notification?.permission !== 'granted') {
		// Logged rather than swallowed silently, because the usual way to reach this
		// line is someone pressing "Push" in DevTools to see whether reminders work.
		// The answer is that v1 has no push: nothing in the app requests notification
		// permission, there is no subscription and no server to send one. To exercise
		// just this handler, grant notifications for the origin in site settings first.
		console.warn(
			'[Graftful] Push received but notifications are not permitted, so nothing was shown. ' +
				'Push reminders are v2; v1 uses the .ics calendar export.'
		);
		return;
	}

	try {
		await self.registration.showNotification('Graftful', {
			body: 'Time to take your medication.',
			icon: '/icons/icon-192.png',
			badge: '/icons/icon-192.png',
			tag: 'graftful-dose'
		});
	} catch (error) {
		// Nothing useful to do from a worker. Swallowed rather than left to become an
		// unhandled rejection.
		console.warn('[Graftful] Could not show the notification', error);
	}
}

self.addEventListener('push', (event) => {
	event.waitUntil(showDoseReminder());
});

self.addEventListener('notificationclick', (event) => {
	event.notification.close();
	event.waitUntil(
		self.clients.matchAll({ type: 'window' }).then((clients) => {
			const existing = clients.find((client) => 'focus' in client);
			return existing ? existing.focus() : self.clients.openWindow('/');
		})
	);
});
