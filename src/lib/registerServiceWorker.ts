import { dev } from '$app/environment';
import { onRestore } from './lifecycle.ts';

/**
 * Service worker registration, and the update check.
 *
 * Skipped in dev. The plugin is configured with `devOptions: { enabled: false }`, so
 * the dev server does not build a worker — it serves a one-line ES module stub
 * (`import '/@fs/.../src/service-worker.ts'`) at that path instead. Registering it as
 * a classic script fails with "Cannot use import statement outside a module", and the
 * error surfaces in the console of anyone running `npm run dev`. The production build
 * is bundled to a classic script with no top-level imports, which is why no `type`
 * option is needed there.
 *
 * Plain `navigator.serviceWorker.register`, deliberately, rather than vite-pwa's
 * `virtual:pwa-register` helper or its `injectRegister` option. Both were tried and
 * neither registered anything: `injectRegister: 'auto'` emits a `registerSW.js` and
 * expects to add a script tag to the built HTML, which never reaches SvelteKit's
 * prerendered output — the file shipped, referenced by nothing.
 *
 * The failure mode was quiet and expensive to find. A worker *was* registered, by
 * SvelteKit's own automatic registration of `src/service-worker.ts`, so DevTools
 * showed an active worker and no errors while nothing was precached and every
 * navigation went to the network. Verified by stopping the server rather than by an
 * emulated offline mode, because Playwright's `setOffline` and its request
 * interception both sit in front of the worker and cannot see what it would serve.
 *
 * ## How an update reaches an installed app
 *
 * `register()` makes the browser revalidate `/service-worker.js` (served `no-cache`)
 * at every cold launch. But a phone app is mostly *resumed*, not relaunched, and an
 * SPA never navigates — so without the explicit check below, a session kept in the
 * background could stay pinned to an old version indefinitely. `onRestore` fires on
 * every return to the app (bfcache restore or foregrounding); the check is throttled
 * because it is a network request and resume happens many times a day.
 *
 * The updated worker installs and precaches in the background, then waits; it takes
 * over on the next launch. See the note in `src/service-worker.ts` for why it does
 * not take over immediately.
 */
export async function registerServiceWorker(): Promise<void> {
	if (dev || !('serviceWorker' in navigator)) return;

	try {
		const registration = await navigator.serviceWorker.register('/service-worker.js', {
			scope: '/'
		});

		let lastCheck = Date.now();
		onRestore(() => {
			if (Date.now() - lastCheck < 60 * 60 * 1000) return;
			lastCheck = Date.now();
			registration.update().catch(() => {
				// Offline, most likely. The next resume past the throttle tries again.
			});
		});
	} catch (error) {
		// Not fatal: the app still works online, it just loses offline support.
		console.warn('[Graftful] Service worker registration failed', error);
	}
}
