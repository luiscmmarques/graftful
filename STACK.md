# Tech stack

Platform: **Cloudflare**. See `COSTS.md` for how that was decided.

Guiding constraints, in the order they broke ties:

1. One maintainer, evenings, for years — boring beats clever.
2. Offline-first, local-only data. No account, no sync, no server-side state.
3. The audience skews older and may be on older Android phones; accessibility and
   text scaling are functional requirements, not polish.
4. Nothing in the stack may pull health data off the device.

## Summary

What v1 actually ships. Anything not in this table is not in the repository.

| Concern         | Choice                                                  |
| --------------- | ------------------------------------------------------- |
| Language        | TypeScript, `strict`                                    |
| Build           | Vite                                                    |
| Framework       | Svelte 5 + SvelteKit, `adapter-static`                  |
| Styling         | Plain CSS, custom properties, Svelte scoped styles      |
| Local storage   | IndexedDB via Dexie                                     |
| Reactivity      | Svelte 5 runes + Dexie `liveQuery`                      |
| Routing         | SvelteKit file-based                                    |
| PWA             | `@vite-pwa/sveltekit` in `injectManifest` mode          |
| i18n            | Hand-rolled typed catalogue, English as source          |
| Unit tests      | Vitest                                                  |
| E2E             | Playwright                                              |
| Hosting         | Cloudflare Pages                                        |
| Reminders       | Generated `.ics` with `VALARM`, no server               |
| Format          | Prettier (`npm run lint` is `prettier --check`)         |
| Types           | `svelte-check`                                          |
| Telemetry       | Cloudflare Web Analytics (cookieless, no custom events) |
| Tips            | TWINT QR + PayPal link (links only, no SDK)             |
| Assets          | `npm run icons` and `npm run lockup`, via Playwright    |
| Package manager | npm                                                     |

**Deferred to v2, and deliberately absent from the repository today:** a standalone
Cloudflare Worker for the push API and cron, Web Push with VAPID over Web Crypto, D1 for
subscriptions, and `wrangler.toml`. There is no ESLint config: Prettier plus
`svelte-check` is the whole gate, and adding a linter has not yet paid for itself on four
screens.

## The choices that needed a reason

### Svelte 5 + SvelteKit with `adapter-static`

This app is four screens of forms and lists, which is exactly what Svelte is good
at, and it compiles most of itself away — the smallest realistic bundle of the
mainstream frameworks. Less boilerplate is also less to maintain alone.

SvelteKit rather than bare Svelte because of the content pages. About, Roadmap,
Privacy, Support and the intended-use statement should be real prerendered HTML: readable
without JavaScript, indexable, and fast — they are the trust surface, and a
transplant recipient evaluating whether to type their medication into a stranger's
website should not have to wait for a bundle. `adapter-static` prerenders those
routes and emits an `index.html` SPA fallback for the app routes. Pure static
output, so Pages just serves files.

No SSR, no Pages Functions for the site. The backend is a separate Worker, so the
site build and the push tier stay independently deployable.

### Plain CSS, no Tailwind

Svelte scopes component styles automatically, so encapsulation is free without any
framework. At four screens Tailwind buys speed of authoring and costs a config
surface plus a purge step. More importantly, the accessibility requirements here
are easier to reason about in real CSS: `rem` everywhere so OS text scaling works,
44 px minimum tap targets, WCAG AA contrast, `prefers-reduced-motion` respected. A
design-token file of custom properties covers theming.

### Dexie over raw IndexedDB

About 25 KB, and it earns it on versioned migrations alone. The schema will change
— lot and expiry tracking is already deferred, not cancelled — and hand-rolling
IndexedDB `onupgradeneeded` chains across releases on devices that may skip several
versions is a genuine source of data-loss bugs. Dexie also gives `liveQuery`, which
plugs straight into Svelte's store contract, so the UI reacts to writes without a
state library.

Not `localStorage`: too small, synchronous, and string-only.

### The domain layer stays dependency-free

`src/lib/domain/` keeps zero dependencies and no framework imports. It already runs
under Node with no build step, which means it can be tested in isolation, reused in a
Worker if v2 ever needs it, and lifted out entirely if the UI is ever rewritten. The
suite against the original spreadsheet is the regression baseline for the whole project;
keeping it runnable with nothing installed is worth the discipline.

### Vitest as the single runner

The existing tests move from `node:test` to Vitest by changing one import line and
keeping `node:assert/strict` assertions, so the churn is trivial and we get watch
mode, coverage, and one command that also covers component tests.

### Playwright, specifically for the offline claim

The central promise is that it works offline and keeps data on the device, and that is
now asserted rather than hoped: `e2e/offline.spec.ts` starts a preview server, waits for a
stable precache, **kills the origin**, and then loads every route and enters data.

Playwright's own network controls cannot test this. `context.setOffline(true)` and
`context.route(..., abort)` both intercept in front of the service worker, so a response
the worker would have served is indistinguishable from no cache at all. Both produced
convincing false failures before the harness was changed to stop the server.

`@axe-core/playwright` and a Lighthouse budget would be natural additions here and are not
installed yet.

### Push: VAPID only, no library — v2, not built

Because the payload is empty by design (the service worker composes the text from
local IndexedDB), RFC 8291 encryption is unnecessary and only the VAPID ES256 JWT
remains. That is ECDSA P-256 signing plus a `fetch` — native Web Crypto in Workers,
no npm dependency. Consequence: do not collect the `p256dh` and `auth` subscription
keys at all, since they exist only to encrypt payloads.

The Worker needs no framework for two endpoints and a `scheduled` handler. Reach
for Hono only if it grows.

### D1 without an ORM — v2, not built

One table of subscriptions. Prepared statements are clearer than a query builder at
this size. Drizzle if it grows past a handful of tables.

### A hand-rolled catalogue instead of an i18n library

`src/lib/i18n/` is a typed object per language and nothing else: no library, no compiler,
no runtime dependency. `en-source.ts` defines the `Messages` interface, so every other
language is checked against it and a missing or misspelled key is a compile error rather
than a blank space found by a user.

English is the source **because it defines the type**, which is a build-time role rather
than an editorial one. French remains the launch language and the first audience: the
first users come from a French-speaking transplant centre.

There is deliberately no runtime fallback. A key enters the catalogue only once all four
languages have it, so a half-translated screen is visibly and consistently English rather
than a patchwork — and `npm run check` can never go green over a half-finished language.
Order, Setup and the content pages are still English; the app shell, Today, Stock, the
pharmacy order text and the calendar export are translated into all four.

Paraglide was the original choice and was not used. At this size the whole mechanism is
about forty lines, and it costs no build step.

### `wrangler.toml`, not Terraform — v2, not built

One zone, one Pages project, one Worker, one database. Terraform's Cloudflare
provider is reasonable but the setup is small enough that checked-in `wrangler.toml`
plus a documented bootstrap is honest rather than lazy. Revisit if a second
environment stops being a branch.

## Telemetry — decided

**Cloudflare Web Analytics.** Cookieless, no client-side identifier, no new data
processor since Cloudflare already hosts the site, and therefore no consent banner.
GA4 was considered and rejected; the reasoning is in `DECISIONS.md`.

Note what it is not: Web Analytics has **no custom event API**. It gives pageviews
per route, referrers, country, device class and Core Web Vitals. It does not give
`dose_logged` or `order_generated`. Two consequences:

- Acquisition channels should be **distinct paths** (`/cto`, `/martigny` redirecting
  into the app), not `?src=` query strings, since a path reliably shows up as its own
  pageview and an arbitrary query parameter may not.

  Not yet consistent with the rest of the project: `SPREADING.md` and the calendar export
  both use `?src=`, which was written before this constraint was understood. The `?src=`
  links are harmless and self-documenting for a human reading a calendar entry, but they
  should not be relied on for attribution. Either add the paths or stop expecting the
  numbers — recorded here rather than quietly left contradictory.

- SPA route tracking has to be enabled, or client-side navigations will not register.

If product-event counters become necessary, the first-party `POST /e` design is in
`TODO.md` → Deferred. Not before a decision depends on it.

The resulting position is worth protecting: the only things that ever leave the
device are a push subscription, if reminders are on, and a cookieless pageview
beacon. No health data, no identifier, no account.

Community statistics — publishing aggregate figures on medication burden — is
**deferred**, and reframed as an anonymous survey rather than background collection.
The constraints that would apply are recorded in `TODO.md` → Deferred, including
small-cell suppression and the requirement to self-host the form rather than embed a
Google Form, which would reintroduce exactly the third-party leak GA4 was rejected
for.

## Repository layout

Single package, no workspaces — two deployables do not justify the machinery.

```
graftful/
  src/
    lib/
      domain/        zero-dependency logic, with its own tests alongside
      db/            Dexie schema and reactive stores
      i18n/          typed catalogue, one file per language
    routes/          SvelteKit: prerendered content + app routes
    service-worker.ts
  e2e/               Playwright, including the offline suite
  scripts/           icon and lockup generation
  static/            icon sources, generated rasters, launch images, _headers
  private/           real regimen for import, gitignored
```

No `worker/` and no `test/` directory: v1 has no server, and unit tests live beside the
code they cover.

## Budgets and gates

Enforced by `.github/workflows/ci.yml` on every push to `main` and every pull request,
and failing the build if broken:

- `npm run lint` (Prettier), `npm run check` (`svelte-check`), `npm test` (Vitest) and
  `npx playwright test` all green, including the spreadsheet regression suite and the
  offline suite.
- `static/lockup.svg` regenerates identically from `scripts/wordmark.json`, so the
  committed logo cannot drift from its source. The icon rasters are deliberately not
  checked this way: the social card and launch images contain text rendered by the host's
  font stack, so their bytes differ legitimately between macOS and Linux.
- `src/lib/headers.test.ts` fails if a route has no cache rule.
- `transfer.roundtrip.test.ts` stops compiling if a model field is added without being
  handled in both directions of the backup.

Intended but **not** currently measured, so not claimed as gates:

- App shell under 150 KB gzipped. The precache is around 440 KB including icons; the shell
  itself has not been measured separately.
- Lighthouse: PWA installable, accessibility ≥ 95.
- No new runtime dependency without a line in `DECISIONS.md`. This one is a habit, not a
  check — `dexie` is still the only runtime dependency.

## Explicitly not used

- **No third-party analytics SDK or tag manager** — pending the decision above. The
  objection is not the vendor but the third-party request from a domain whose name
  is itself a health disclosure.
- **No CDN-hosted fonts.** System font stack, or self-hosted. A font request to a
  third party is a request that leaks who is using a transplant medication app.
- **No error-reporting SaaS** unless it can be configured to send no user content.
  A stack trace from this app can contain drug names.
- **No Firebase**, which is what using SNS for web push would have required.
- **No auth provider.** There is no account.
