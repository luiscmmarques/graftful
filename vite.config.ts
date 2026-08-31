import { defineConfig } from 'vitest/config';
import { loadEnv } from 'vite';
import adapter from '@sveltejs/adapter-static';
import { sveltekit } from '@sveltejs/kit/vite';
import { SvelteKitPWA } from '@vite-pwa/sveltekit';
import type { ManifestOptions } from 'vite-plugin-pwa';
import { execSync } from 'node:child_process';

/**
 * A human-readable build identifier.
 *
 * Caching is already handled by content hashes in asset filenames — this is not for that.
 * It answers a different question: which version is somebody actually running. Without it,
 * "I updated and it still does the wrong thing" is unanswerable, and the honest reply to a
 * bug report from a stranger is a guess.
 *
 * Falls back gracefully: a tarball with no git history still builds.
 */
function buildVersion(): string {
	let commit = 'unknown';
	try {
		commit = execSync('git rev-parse --short HEAD', { stdio: ['ignore', 'pipe', 'ignore'] })
			.toString()
			.trim();
	} catch {
		// No git available. Not worth failing a build over.
	}
	return `${new Date().toISOString().slice(0, 10)}-${commit}`;
}

/**
 * The web app manifest.
 *
 * Lifted out of the plugin options so the dev server can serve the same object. The plugin
 * only writes this file during a real build, so with a `<link rel="manifest">` in the shell
 * every dev page load was requesting a URL that returned 404 — harmless to the app, but it
 * clutters the console and means install metadata cannot be checked without building first.
 */
/*
 * Read via Vite's own loader rather than `process.env`.
 *
 * `process.env` is not populated from `.env` at the time this config is evaluated — Vite
 * loads those files afterwards — so reading it directly meant a token in `.env` was silently
 * ignored while appearing to work. Real shell variables, which is what Cloudflare Pages and
 * CI provide, still win.
 */
const publicEnv = loadEnv(process.env.NODE_ENV ?? 'production', process.cwd(), 'PUBLIC_');

const pwaManifest: Partial<ManifestOptions> = {
	name: 'Graftful',
	short_name: 'Graftful',
	description: 'Medication and refill tracking for transplant recipients.',
	/*
	 * The manifest cannot change language at runtime. English is the only language
	 * every route currently has, so claiming `fr` made installed-app metadata promise
	 * a French interface that Order, Setup and the content pages do not yet provide.
	 */
	lang: 'en',
	theme_color: '#1f6f4a',
	background_color: '#ffffff',
	display: 'standalone',
	start_url: '/',
	scope: '/',
	/*
	 * Chrome shows a fuller install dialogue when screenshots are present, and warns in
	 * DevTools when they are missing: it wants one `wide` for desktop and one narrow for
	 * mobile. Generated from the real app by `npm run screenshots`, using the example
	 * regimen — its product names are invented, so this cannot publish anyone's medication
	 * in an install prompt.
	 */
	screenshots: [
		{
			src: '/screenshots/today-narrow.png',
			sizes: '390x844',
			type: 'image/png',
			form_factor: 'narrow',
			label: 'Today: what to take, and when'
		},
		{
			src: '/screenshots/stock-narrow.png',
			sizes: '390x844',
			type: 'image/png',
			form_factor: 'narrow',
			label: 'Stock: how many days each product covers'
		},
		{
			src: '/screenshots/order-narrow.png',
			sizes: '390x844',
			type: 'image/png',
			form_factor: 'narrow',
			label: 'Order: a pharmacy order, ready to send'
		},
		{
			src: '/screenshots/today-wide.png',
			sizes: '1280x720',
			type: 'image/png',
			form_factor: 'wide',
			label: 'Today: what to take, and when'
		},
		{
			src: '/screenshots/stock-wide.png',
			sizes: '1280x720',
			type: 'image/png',
			form_factor: 'wide',
			label: 'Stock: how many days each product covers'
		}
	],
	icons: [
		{ src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
		{ src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
		{
			src: '/icons/icon-192-maskable.png',
			sizes: '192x192',
			type: 'image/png',
			purpose: 'maskable'
		},
		{
			src: '/icons/icon-512-maskable.png',
			sizes: '512x512',
			type: 'image/png',
			purpose: 'maskable'
		}
	]
};

export default defineConfig({
	define: {
		__APP_VERSION__: JSON.stringify(buildVersion()),
		/*
		 * The analytics token, via `define` rather than `$env/static/public`.
		 *
		 * Importing a named export from `$env/static/public` is a hard build error when the
		 * variable does not exist, and `.env` is deliberately gitignored — so a clean clone,
		 * CI and Cloudflare Pages all failed to build. Worse, the error surfaced as a missing
		 * service worker file, because the client build bailed before emitting one, which
		 * points at entirely the wrong thing.
		 *
		 * An absent token now means an empty string, which is exactly the "render nothing"
		 * case the component already handles.
		 */
		__CF_BEACON_TOKEN__: JSON.stringify(publicEnv.PUBLIC_CF_BEACON_TOKEN ?? '')
	},
	plugins: [
		sveltekit({
			compilerOptions: {
				runes: ({ filename }) =>
					filename.split(/[/\\]/).includes('node_modules') ? undefined : true
			},
			/*
			 * SvelteKit registers `src/service-worker.ts` itself, at a versioned URL, while
			 * the app registers the same worker at its plain URL. Two registrations in one
			 * scope replace each other and the precache can end up never completing —
			 * offline breaks while DevTools shows a healthy active worker and no errors.
			 *
			 * Note this file is the only place such options are read: SvelteKit prints
			 * "svelte.config.js is ignored when options are passed via your Vite config"
			 * once anything is passed to the plugin here.
			 */
			serviceWorker: { register: false },
			/*
			 * The fallback is named 404.html, and the name is the whole point.
			 *
			 * Every route is prerendered (see src/routes/+layout.ts). Left with no fallback at
			 * all, Cloudflare Pages serves index.html for anything it cannot match, so `/nope`,
			 * `/.env` and `/wp-login.php` all returned 200 with the Today page. That is worse
			 * than untidy: a scanner probing for `/.env` reads 200 as confirmation the file
			 * exists, and every probe counts as a successful page view in Cloudflare's traffic
			 * analytics, so the figures describe attention the app is not getting.
			 *
			 * Pages serves a file called 404.html with a 404 status, which is why the filename
			 * matters. The obvious `fallback: 'index.html'` would instead overwrite the
			 * prerendered root with a contentless shell that carries no page title — same
			 * mechanism, opposite result.
			 *
			 * Offline is deliberately different: the service worker's navigation route answers
			 * unmatched paths with the cached `/`. Someone offline who mistypes a URL wants their
			 * doses, not an error page.
			 */
			/*
			 * The Content-Security-Policy is generated here, not written by hand in
			 * static/_headers.
			 *
			 * SvelteKit's prerendered pages carry a small inline bootstrap script that hands
			 * hydration data to the client. A policy of `script-src 'self'` blocks it, so the
			 * app renders its server-rendered HTML and then never boots: no navigation, no
			 * data, not even an error page. A fixed hash cannot allow it either, because the
			 * script embeds a per-build identifier (`__sveltekit_<random>`) and so changes on
			 * every build.
			 *
			 * Letting SvelteKit emit the policy means the hashes always describe the bundle
			 * actually shipped. It writes them into a <meta> tag in each prerendered page,
			 * which has a useful side effect: the real policy is then enforced under `vite
			 * preview`, so the e2e suite can catch a policy that stops the app booting. A
			 * policy living only in _headers cannot be tested locally at all, which is how
			 * exactly this bug reached production once already.
			 *
			 * `frame-ancestors` is deliberately absent: browsers ignore it in a <meta> tag, so
			 * it stays an HTTP header in static/_headers, alongside X-Frame-Options.
			 */
			csp: {
				mode: 'hash',
				directives: {
					'default-src': ['self'],
					'script-src': ['self', 'https://static.cloudflareinsights.com'],
					'connect-src': ['self', 'https://cloudflareinsights.com'],
					'style-src': ['self', 'unsafe-inline'],
					'img-src': ['self', 'data:'],
					'font-src': ['self'],
					'object-src': ['none'],
					'base-uri': ['self'],
					'form-action': ['none']
				}
			},
			adapter: adapter({ fallback: '404.html' })
		}),
		/*
		 * Serve the manifest in dev.
		 *
		 * `devOptions.enabled` is left off on purpose: turning it on would also serve a
		 * service worker in dev, which caches a dev server and is a reliable way to spend an
		 * hour wondering why an edit has not appeared. This serves only the manifest, so the
		 * install metadata is inspectable and the shell's <link> resolves.
		 */
		{
			name: 'graftful:dev-manifest',
			apply: 'serve',
			configureServer(server) {
				server.middlewares.use('/manifest.webmanifest', (_request, response) => {
					response.setHeader('Content-Type', 'application/manifest+json');
					response.end(JSON.stringify(pwaManifest));
				});
			}
		},
		SvelteKitPWA({
			strategies: 'injectManifest',
			srcDir: 'src',
			filename: 'service-worker.ts',
			/*
			 * autoUpdate, not prompt.
			 *
			 * `prompt` only makes sense with UI that offers the update, and there is none.
			 * Without it a replacement worker installs and then waits indefinitely while
			 * the previous one keeps serving — and because asset filenames are hashed, the
			 * URLs that old worker precached stop existing the moment a new version is
			 * deployed. The result is an app that works offline right up until it is
			 * updated, then quietly breaks until every tab is closed. For something people
			 * rely on daily for medication, silently pinning them to an old version is the
			 * worse failure.
			 */
			registerType: 'autoUpdate',
			// Registered explicitly from the app — see src/lib/registerServiceWorker.ts.
			injectRegister: null,
			/*
			 * Off in dev on purpose. The precache manifest only exists in a real build,
			 * and a service worker caching a dev server is a reliable way to spend an
			 * hour wondering why an edit has not appeared. Test offline behaviour
			 * against `npm run preview`, which serves the actual build output.
			 */
			devOptions: { enabled: false },
			injectManifest: {
				globPatterns: ['**/*.{js,css,html,svg,png,ico,webmanifest}'],
				/*
				 * The iOS launch images are excluded deliberately. There are two dozen of them,
				 * Safari requests them itself when launching from the home screen rather than
				 * through the service worker, and nothing in the app ever displays one — so
				 * precaching them would inflate every install for no offline benefit.
				 *
				 * The install-prompt screenshots go too: the browser fetches them itself when it
				 * shows the dialogue, and nothing in the app ever renders one.
				 *
				 * The lockups and the social card go the same way. The lockups exist for the
				 * README and printed handouts; the card is fetched directly by whatever is
				 * unfurling a link. No screen in the app renders either one.
				 */
				globIgnores: [
					'**/icons/splash/**',
					'**/og-image.png',
					'**/lockup-inverse*',
					'**/screenshots/**'
				]
			},
			manifest: pwaManifest
		})
	],
	test: {
		// The domain suite asserts with node:assert/strict rather than expect(),
		// which keeps src/lib/domain free of test-framework imports.
		projects: [
			{
				extends: './vite.config.ts',
				test: {
					name: 'unit',
					environment: 'node',
					include: ['src/**/*.{test,spec}.{js,ts}'],
					exclude: ['src/**/*.svelte.{test,spec}.{js,ts}']
				}
			}
		]
	}
});
