import { dev } from '$app/environment';

/**
 * Service worker registration.
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
 * The plugin's helper exists mainly to drive update prompts. There is no prompt here —
 * `registerType: 'autoUpdate'` plus `clientsClaim` in the worker handles updates — so
 * the platform API is all that is needed.
 */
export async function registerServiceWorker(): Promise<void> {
	if (dev || !('serviceWorker' in navigator)) return;

	try {
		await navigator.serviceWorker.register('/service-worker.js', { scope: '/' });
	} catch (error) {
		// Not fatal: the app still works online, it just loses offline support.
		console.warn('[Graftful] Service worker registration failed', error);
	}
}
