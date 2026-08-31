/// <reference types="vite-plugin-pwa/client" />
// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
	/**
	 * Build identifier, injected by vite.config.ts. Date plus short commit.
	 *
	 * Declared inside `declare global` deliberately: at the top level of a file that has
	 * imports it would be module-scoped, and Svelte components would not see it.
	 */
	const __APP_VERSION__: string;

	/**
	 * Cloudflare Web Analytics token, injected by vite.config.ts from
	 * `PUBLIC_CF_BEACON_TOKEN`. Empty string when unset, which is the case in a clean clone,
	 * in CI, and in any fork — the beacon then renders nothing at all.
	 */
	const __CF_BEACON_TOKEN__: string;

	namespace App {
		// interface Error {}
		// interface Locals {}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
}

export {};
