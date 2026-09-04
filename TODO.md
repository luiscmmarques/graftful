# Graftful — TODO

Medication and procurement tracking for transplant recipients. Local-first, no account, free, optionally tip-supported.

Status key: `[x]` done · `[ ]` open · `[?]` needs a decision before work starts

---

## 0. Decisions

Resolved — see `STACK.md` for the full stack and the reasoning.

- [x] **Framework: Svelte 5 + SvelteKit with `adapter-static`.** Prerendered content pages (About, Roadmap, Privacy, Support) plus an SPA fallback for the app routes. No SSR; Pages serves static files only.
- [x] **Persistence: IndexedDB via Dexie**, for versioned migrations and `liveQuery`. Not localStorage.
- [x] **Hosting: Cloudflare** — Pages for the site, a standalone Worker for the push API and cron, D1 for subscriptions.
- [x] **Domain: `graftful.app`**, served at the apex, because a service worker can only control paths at or below its own URL. `.app` is HSTS-preloaded, so HTTPS is mandatory and there is no http fallback.
- [x] **Push: Web Push with VAPID only.** The payload is empty by design, so no RFC 8291 encryption and no npm dependency — plain Web Crypto. No web API can schedule locally; see §3 for why, and for the `.ics` fallback.
- [x] **Name cleared** against the App Store and Play listings.
- [x] **Licence: AGPL-3.0.** Forks must stay open. Pair it with the name as a trademark so nobody can ship _as Graftful_ — unregistered rights arise from use in Switzerland; registration with the IPI is optional and costs a few hundred francs for ten years.
- [x] **Reminders: `.ics` calendar export in v1, Web Push in v2.** No web API can schedule locally (see §3), and `.ics` means v1 ships with working reminders and no backend at all.
- [x] **Adherence logging: v2, alongside push.** Correct instinct — Web Push notifications support action buttons, so "Taken / Not yet" belongs on the notification itself. Asking someone to open the app to confirm a dose they already took is the interaction people abandon first.
- [x] **Launch languages: English and French**, with German and Portuguese shipped for everything that leaves the app. French is the launch language and first audience; English is the _type_ source in `src/lib/i18n/en-source.ts`, which is a build-time role rather than an editorial one — see `STACK.md`.
- [x] **Tips: TWINT QR plus a PayPal link, in v1.** Plain links and a static QR image — never PayPal's embedded button, which loads their JavaScript and would break the "no third-party requests" property.
- [x] **Intended-use statement approved** (see `DECISIONS.md`). Unblocks the Swissmedic enquiry, which unblocks the CTO conversation — longest lead time of anything remaining, so send it first.

## 0a. v1 scope

**v1 has no server, and no telemetry either.** A static bundle on Pages, and nothing else. No Worker, no D1, no VAPID, no `api.graftful.app`, no analytics beacon.

Two consequences worth keeping:

- The privacy note becomes trivially strong: the app makes **no outbound request at all**. No analytics, no beacon, no third-party script — so once the service worker holds the files, nothing goes anywhere.
- The pipeline is a single Pages deploy. No Worker to version alongside it.

| In v1                                  | Deferred to v2            |
| -------------------------------------- | ------------------------- |
| Therapies, dose versions, compositions | Web Push reminders        |
| Stock ledger, refill, recount          | Push subscription API, D1 |
| Joint replenishment + order list       | Product-event counters    |
| `.ics` reminder export                 |                           |
| Days-since-transplant counter          |                           |
| Export / import JSON                   |                           |
| Content pages, privacy, terms          |                           |

AGPL note: the app already ships its code to the browser, so satisfying the source offer is a link to the repository from the About page. Minified output is object code, so that link is the Corresponding Source obligation — cheap to comply with, worth doing deliberately rather than by accident.

- [ ] Confirm whether Workers Analytics Engine is available on the current plan. Only relevant if product-event counters are ever added (see Deferred).

## 0b. Build status

Working and testable: `npm run dev`. 144 unit tests, 16 app and 3 offline end-to-end tests, 0 type errors, offline precache generated and verified with the origin killed.

- [x] SvelteKit + Svelte 5 + Vite, `adapter-static`, every route prerendered
- [x] Domain layer at `src/lib/domain`, still dependency-free
- [x] Tests migrated to Vitest — 130 in total
- [x] Dexie schema v1, `liveQuery` store, export/import JSON
- [x] Seed loader for the example regimen
- [x] Today, Stock, Order, Setup screens
- [x] `.ics` export with stale-schedule detection
- [x] Service worker, manifest, and a drawn mark with generated icons, launch images and lockups (see `static/icons/README.md` and `DESIGN.md`)
- [x] Content pages (`/about`, `/privacy`, `/support`) prerendered as plain HTML
- [x] ~~Cloudflare Web Analytics, off unless `PUBLIC_CF_BEACON_TOKEN` is set~~ — **removed.** The token was never set, so it never collected anything; the beacon, the env plumbing and the two Cloudflare origins in the CSP are all gone. See `DECISIONS.md`.
- [x] Transplant milestones surfaced in the header
- [x] bfcache eligibility, with a reactive date store and an enforcing test
- [x] `AGENTS.md` recording the constraints an agent must not break
- [x] Example regimen anonymised — invented product names, real numbers
- [x] Roadmap page at `/roadmap`
- [x] i18n system: typed catalogue, browser detection, Setup override, 4 languages
- [x] Order text and calendar export in English, French, German, Portuguese

#### Why the default horizon is 30 and the fixture is 60

One month, matching how most people collect. Under-ordering is correctable on the next trip; over-ordering ties up money and fills a cupboard with boxes that can expire. Editable in Setup, which is where anyone whose centre works to a different rhythm should change it.

The example regimen keeps 60, which is what the real orders behind `SHEET_JOURS` were placed with. At 60 the planner asks for 2 boxes of two products where the real order asked for 1, and about 50 reproduces it exactly. That discrepancy is a question about the original spreadsheet rather than about the default, so the fixture stays as it is and the tests keep testing rather than agreeing with themselves.

### Language: what is and is not done

**Done, and complete in all four languages — the migration finished on 3 September 2026:**

- The mechanism: typed catalogue (`src/lib/i18n/`), browser detection in preference order, explicit override in Setup, `<html lang>` kept in step. English defines the type, so a missing key in any language is a compile error, never a blank space.
- **Everything that leaves the app.** The pharmacy order text and the `.ics` calendar export — summaries, descriptions, alarm text, the anniversary event, and the `[Graftful]` prefix line. These matter most: a pharmacist and a calendar are the two audiences outside the device.
- The app shell, all six screens (Today, Stock, Order, Setup, plus the error page), and the content pages: About, Privacy, Roadmap, Support. 367 keys per language.

**Deliberately left in English, with the reason recorded in a comment at each site:**

- Ledger notes persisted to the database (`'Counted by hand'`, …) — data, not UI, and translating them would put mixed-language rows in one person's medication history.
- The two errors thrown by `src/lib/db/index.ts` — translating them means giving the data layer error codes, a change below the screen rather than in it.
- The import warnings from `src/lib/domain/transfer.ts` — the domain layer imports nothing.
- The static Open Graph tags in `src/app.html` — static HTML cannot import a module.

Deliberately no runtime fallback: a key enters the catalogue only once all four languages exist. An untranslated screen is therefore visibly, consistently English rather than a patchwork, and `npm run check` can never go green over a half-finished language.

- [x] Translate the Order screen (small, and part of the daily loop — do this first)
- [x] Translate Setup
- [x] Translate the content pages
- [ ] Have the German reviewed by a native speaker before launch
- [x] **Replace the placeholder icons** — done; `mark.svg` was a PNG in disguise, so the pipeline was rebuilt around `npm run icons` (see `DESIGN.md`)
- [ ] Real TWINT QR and PayPal link. `/support` hides the whole card until then — `moneyConfigured = false` in `src/routes/support/+page.svelte`. Turning it on means: add `static/twint-qr.png`, set `PAYPAL_URL` to a real `paypal.me` handle, flip the flag. Before doing it, settle what it publishes about me, because both methods identify their recipient: a personal TWINT QR encodes a mobile number, and a `paypal.me` link shows the account holder's legal name. That is a deliberate disclosure on a page about a health condition, and it is the same question already settled firmly for the example regimen, only pointing at contact details instead of medication. A business TWINT account or a dedicated handle would avoid it. Also worth checking whether voluntary tips to a private individual carry any Swiss obligation to publish an address, since the answer changes what the page must contain rather than what it may.
- [x] ~~Cloudflare beacon token, once the domain and account exist~~ — not needed; analytics removed entirely
- [x] **`targetHorizonDays` defaults to 30** (see the note below)
- [ ] Epsilonapril appeared on the real order despite 600 days of recorded cover — either the spreadsheet quantity is wrong or it is topped up out of habit
- [x] Playwright, including the offline test — 16 app tests and 3 offline tests that stop the origin rather than emulating it
- [x] GitHub Actions: format, types, unit, build and end-to-end on every push and pull request (`.github/workflows/ci.yml`)
- [ ] Deployment itself is left to Cloudflare Pages' own git build, so there is one way to ship rather than two. Revisit only if a deploy needs a step Pages cannot do.

### Bug: service worker crashed on evaluation

`precacheAndRoute(self.__WB_MANIFEST)` threw in dev, because the manifest is only substituted in a real build. The throw happened at module scope, so registration failed entirely and _none_ of the handlers were installed — including the push handler v2 depends on. Now guarded with `Array.isArray`, and the dev service worker is explicitly disabled: a worker caching a dev server is a reliable way to lose an hour. Offline behaviour is tested against `npm run preview`.

Also switched the navigation fallback to `createHandlerBoundToURL('/index.html')` rather than a bare `caches.match`, so the precache revision is respected and a stale shell is not served after an update.

- [x] Order text in the real format, validated against a sent order
- [x] Order text uses one neutral unit noun per language, not translated dose forms
- [x] `Product.form` optional — display only, nothing derived from it
- [x] Product management: edit, retire, restore, and delete when unreferenced
- [x] Therapy management: edit, stop, resume, and delete when never in force
- [x] **Dose changes** — close the old version, open a new one, keep the history
- [x] Asymmetric doses: the dose editor edits each time separately
- [x] By-hand top-ups for products with no daily rate
- [x] Box size correctable from Stock and from Setup
- [x] **Derived depletion** — stock now falls with time (see below)

### Bug: stock never depleted

The ledger only moved when an event was written, so `mustOrder` could never fire from the calendar advancing — the app would have silently never told anyone to reorder. `stockOnHand` remains a pure ledger of observations; `projectedOnHand` derives depletion between them from the schedule, integrated piecewise so a dose change part-way through is not averaged over. A recount is what corrects drift.

Found by asking why the seeded regimen never triggered an order in 400 simulated days. Nine regression tests now cover it.

Related: `DoseVersion.activeTo` is **exclusive**. Setting it to the last day a dose was taken rather than the next version's `activeFrom` leaves a one-day hole that consumes nothing. Now documented on the type.

## 1. Domain layer — procurement engine

- [x] Types: therapy → dose version → composition → product
- [x] Time-bounded dose versions, so a dose change creates history
- [x] Multi-product compositions (14 mg = 3 × 4 mg + 1 × 2 mg)
- [x] Fractional units for half tablets (15 mg from a 30 mg tablet)
- [x] Stock as an append-only ledger: `refill` / `recount` / `adjustment`
- [x] Burn rate summed across every composition using a product
- [x] Days of cover, `null` when nothing consumes the product
- [x] Must-order floor per product (`minDays`)
- [x] Joint replenishment: one trigger tops every product up to a shared horizon
- [x] Whole-package rounding, with a per-product order cap
- [x] Open orders suppress the alert
- [x] Ordering does not change stock; receiving does
- [x] Partial fulfilment leaves the remainder outstanding
- [x] Projected next pharmacy run
- [x] Dose consistency cross-check (declared total vs composed total)
- [x] Regression suite against the original spreadsheet's hand-kept Jours column
- [ ] Intake log (adherence), separate from stock decrement
- [ ] Scheduled-consumption decrement, with periodic recount prompts
- [x] Pharmacy order text: clipboard primary, `mailto:` secondary — both present on the Order screen; the checkbox was simply never ticked
- [ ] Export / import as JSON (data-loss insurance — see §6)
- [ ] Lot / expiry tracking (deferred; the ledger already allows adding a column)

## 2. Anniversary

- [x] Days since transplant
- [x] Calendar breakdown (years / months / days)
- [x] Next yearly anniversary, with 29 February clamping
- [x] Round day-count milestones (100, 500, 1000, 2000, …)
- [ ] Home-screen counter
- [ ] **Anniversary via the `.ics` export in v1** — a yearly recurring event with a `VALARM`, so the graft's birthday works with no backend. The push version lands with everything else in v2.
- [x] **Let the user choose whether milestones are shown at all** — `showMilestones` in settings, with a toggle in Setup. Opt-out rather than opt-in, so absent means shown and nobody's header changes on upgrade. Only the milestone line is affected: the day count below it is a fact rather than a countdown, and hiding that is a separate question worth asking a real user before guessing. Read from `settingsStore` rather than the domain `Settings` type, which keeps a display preference out of the regression baseline. It is a `Preferences` field, so it goes through the backup round trip — `FULL_PREFERENCES` sets it to `false` on purpose, because `true` could not tell "preserved" from "dropped and defaulted".

## 3. PWA and offline

### Icons and app assets

Design **one** square SVG at 512×512, then generate everything from it. Do not hand-export eight files.

Required set:

| File | Size | Notes |
| --- | --- | --- |
| `icon-192.png` | 192×192 | manifest, `purpose: "any"` — Android install minimum |
| `icon-512.png` | 512×512 | manifest, `purpose: "any"` — splash and large contexts |
| `icon-192-maskable.png` | 192×192 | `purpose: "maskable"` |
| `icon-512-maskable.png` | 512×512 | `purpose: "maskable"` |
| `apple-touch-icon.png` | 180×180 | **opaque background, no alpha** — iOS ignores transparency and fills it black |
| `favicon.svg` | vector | modern browsers |
| `favicon.ico` | 16/32/48 | fallback |

Two gotchas that catch everyone:

- **Maskable icons need a safe zone.** The OS may crop to a circle, so all critical artwork must sit inside a centred circle of 80% diameter — 410 px on a 512 canvas, i.e. roughly 10% padding each side. Ship separate `any` and `maskable` files; a maskable icon reused as `any` looks absurdly over-padded.
- **iOS ignores the manifest icons** for the home screen and uses `apple-touch-icon` — which must be opaque, or it renders on black.

- [ ] Generate with `@vite-pwa/assets-generator`, which is the native fit for the chosen PWA plugin: one source SVG, one command, correct manifest entries. Alternatives: `npx pwa-asset-generator` (also does iOS splash screens), realfavicongenerator.net (web UI, handles the iOS alpha issue), and maskable.app/editor for previewing the safe zone before committing.
- [ ] Draw the mark in Figma (free tier) or Inkscape. For something this small, Inkscape plus one afternoon is enough.
- [ ] Design constraint: legible at 48 px, inside a circular crop, in one colour. One shape, thick strokes, high contrast, no text, no fine detail.
- [ ] Suggestion: "graft" is a horticultural term, so two stems joining with a bud reads as the name, is organ-agnostic, is not clinical, and survives being shrunk into a circle. Avoid a kidney silhouette — we deliberately went organ-agnostic.
- [ ] Optional: iOS `apple-touch-startup-image` splash screens per device size to avoid a white flash on launch. Tedious by hand; `pwa-asset-generator` does it.

- [ ] Web app manifest: name, icons, theme, `display: standalone`
- [ ] Service worker: precache the app shell, cache-first for static assets
- [ ] Full offline operation — every read and write hits local storage only
- [ ] Install prompt for Android / desktop
- [ ] iOS add-to-home-screen instructions with screenshots (Share menu is not discoverable, and push on iOS **requires** installation, 16.4+)
- [x] `navigator.storage.persist()` so the browser does not evict the data
- [x] Storage-pressure warning if persistence is refused

#### Durable storage, and why the request waits

By default IndexedDB is best-effort: a device short of space lets the browser evict whole origins, silently, with nothing said afterwards. Here that is not a cache miss but the loss of a medication history. `src/lib/persistence.ts` asks for persistent storage instead, and exposes the answer as `granted` / `refused` / `unsupported` / `unknown`.

The request is deliberately not made on an empty first visit. Chromium decides silently from installation and engagement signals, so timing is irrelevant there — but **Firefox shows a permission prompt**, and putting it to somebody who has just scanned a QR code and typed nothing asks them to protect data that does not exist. A refusal is remembered, so the one chance to ask would have been spent on nothing. `watchStoredData()` therefore observes the `regimen` store the layout already subscribes to and fires once products or therapies appear, whichever way they arrived. `persisted()` is read first on every visit and never prompts, so an already-persistent origin is recognised without asking again.

Only a refusal reaches the UI: Setup's backup section then says plainly that permanent storage has not been guaranteed and that exporting a backup is the protection — directly above the export button. A granted origin shows nothing, and so does a browser with no Storage API, where the notice would describe a risk with no action attached.

### Reminders (the hard part)

**No web API can schedule a local notification, and none is coming.** The options were investigated:

- **Notification Triggers** (`TimestampTrigger` on `showNotification`) was exactly this: schedule locally, no server, works offline. Chrome origin trial only, never shipped to stable, abandoned. This is the API that should have existed.
- **Periodic Background Sync** exists in Chromium on Android, but the browser decides when to run it from engagement and battery heuristics, with a practical floor around 12 hours. It cannot fire at 07:30. Chromium-only, and unsuitable for anything time-critical by design.
- **`setTimeout` in a service worker** does not survive; workers are terminated within seconds of going idle.
- **Web Alarms API** was proposed and abandoned in 2013.
- **No web API can read or write the OS clock or alarm app.** `chrome.alarms` is an extension API, unreachable from a page.

So the realistic set is: Web Push with a small server tier, a calendar export, a native wrapper, or telling people to use their phone's own alarm.

- [ ] **`.ics` calendar export — build this regardless of push.** Generate recurring events with `VALARM` reminders for each dose slot; the user imports once and the OS calendar fires local alerts forever, offline, on every platform including iOS, with no server and no notification permission. Limitations: not dynamic (a dose change means re-importing), no "taken" interaction, and it puts entries in the user's calendar. But it is the only option that needs nothing from us after export, and it is a genuine safety net for the users least likely to grant notification permission — which is much of the target cohort.
- [ ] Because `.ics` exists, push can be deferred past v1 without leaving users with no reminder at all
- [ ] **Stale-calendar detection.** The export is a snapshot, so any change to a schedule or dose silently invalidates it — and a calendar quietly reminding someone of last month's dose is worse than no reminder. Track the schedule version at export time and prompt clearly to re-export whenever it changes.
- [ ] PRN therapies are excluded from the export — there is no schedule to encode
- [ ] Native wrapper (Capacitor / TWA) would give exact offline local notifications, but costs app store review, developer accounts, and the "just open a URL" install simplicity. Not now; noted as the escape hatch if push proves too unreliable in practice.

Web Push, when built:

**A content-free push needs no payload encryption.** RFC 8030 permits a push message with no body: the `push` event fires with `event.data === null`. Since the service worker composes the text from local IndexedDB anyway, there is no payload — which removes RFC 8291 AES128GCM encryption entirely. All that is left is a VAPID ES256 JWT (RFC 8292) and a POST with an empty body. That is plain Web Crypto: no `web-push` library, no npm dependency, on any runtime.

**Not SNS.** It reaches web push destinations only with FCM as the transport, which puts a Firebase project and Google in the delivery path for no benefit.

- [ ] Client subscribes with `pushManager.subscribe()`, passing `userVisibleOnly` and the VAPID `applicationServerKey`, then posts the subscription to the API
- [ ] Store: endpoint, reminder times, IANA timezone. The `p256dh` and `auth` keys are only needed if a payload is ever added — do not collect them yet.
- [ ] **Derive due-ness, never write per send.** The sweep selects subscriptions whose local time falls in the current bucket, computed from the stored times and timezone. No "last sent" write. That keeps the whole tier read-only in steady state, which removes the only hard free-tier ceiling — and matters for reliability rather than cost, since a D1 daily limit returns errors and reminders would stop rather than degrade.
- [ ] Sweep every 5 minutes (Workers Cron Trigger)
- [ ] VAPID private key in the Workers secret store
- [ ] Always display a notification on wake (browsers tolerate only a small budget of silent pushes before showing their own generic message)
- [ ] On `404`/`410` from a push endpoint, delete the subscription — expired subscriptions otherwise accumulate forever and inflate the sweep
- [ ] Reminder types: dose due · stock low, naming the products to collect · transplant anniversary
- [ ] Graceful degradation: if push is unavailable, say so plainly and suggest the OS alarm app as backup rather than failing silently
- [ ] Log retention capped (14 days) — the one line item that grows unnoticed

## 4. Telemetry — none

**Decided: no client-side telemetry at all.** GA4 was rejected, Cloudflare Web Analytics was chosen instead, its plumbing shipped behind `PUBLIC_CF_BEACON_TOKEN`, the token was never set — and rather than finish it, the beacon was removed. Both decisions and the accepted cost are in `DECISIONS.md`.

Removed with it: `src/lib/Analytics.svelte`, the `__CF_BEACON_TOKEN__` define and its `loadEnv` plumbing in `vite.config.ts`, the declaration in `src/app.d.ts`, `.env`, and — the part that actually matters — `https://static.cloudflareinsights.com` from `script-src` and `https://cloudflareinsights.com` from `connect-src`. The generated policy is now `'self'` and nothing else, which `e2e/app.spec.ts` already asserts by failing on any non-local request.

- [x] ~~Enable Web Analytics on the zone and add the beacon~~
- [x] ~~Verify SPA route tracking is on, or route changes will not register~~
- [ ] **Use distinct paths, not query strings, for acquisition channels.** Still worth doing, and now the _only_ way to attribute anything: `/cto` and `/martigny` redirecting into the app are real document requests, so Cloudflare's edge HTTP traffic counts them. `?src=` is not broken out as its own dimension.
- [x] ~~Confirm what the beacon collects and describe it plainly in the privacy note~~ — the privacy page now says nothing is collected, in all four languages

### What this deliberately does not measure

Everything except arrival. Edge HTTP traffic sees the first document request and nothing after it: the service worker answers later navigations from cache, and moving between screens is client-side routing. So there is no way to know whether someone who landed on the app ever reached the Stock screen, let alone recorded a dose.

Accepted, because no decision is currently waiting on that answer and the honesty of the privacy claim is worth more than the curiosity. If the product questions do become pressing there are two routes, in increasing cost: set the beacon token again in the Pages dashboard, which is one field and restores pageviews per route; or add a first-party `POST /e` counter on the Worker (see Deferred). Not before there is a decision it would change.

### The resulting privacy position

In v1, **nothing leaves the device — at all.** Not health data, not an identifier, not a pageview. From v2 the only thing that ever will is a push subscription, if reminders are switched on. That is a short, true, and unusually strong privacy note, and it is now testable rather than merely asserted: `e2e/app.spec.ts` fails if a single request reaches a non-local host. Worth protecting when future features are proposed.

## 5. Pages

- [ ] **Home / Today** — what to take at each slot, per product
- [x] **Stock** — days remaining, refill, recount
- [x] **Order** — low list, generate, mark ordered, mark received
- [x] **Setup** — therapies, dose versions, compositions, products
- [x] **About** — what it is, who made it, why, and what it deliberately will not do
- [x] **The personal account** — shipped as part of `/about` rather than a separate page, and the forward-looking half became `/roadmap`. Written by a recipient; this is the credibility of the whole project, not marketing copy.
- [ ] **Privacy note** — local-only storage, what the push server sees, what the metrics count. Revised Swiss FADP in force since Sept 2023; health data is sensitive, so this must be explicit and readable.
- [ ] **Intended use / disclaimer** — reminders and self-logging, no medical advice. Same wording as the Swissmedic enquiry (§8).
- [ ] **Support / tip** — TWINT QR (dominant in Switzerland) plus a PayPal link for anyone outside it. Static QR image and a plain hyperlink only: PayPal's embedded donate button loads their JavaScript, which would break the "no third-party requests" property the privacy note depends on. No ads, ever.
- [ ] **FAQ** — including "what happens if I clear my browser data"
- [ ] **Contact**

## 6. Trust and licence

### Licence — open decision

There is no moat in this code. It is a few hundred lines of inventory arithmetic; anyone could rebuild it in a weekend. The defensible assets are the lived experience behind it, the CTO relationship, the domain, and the name. So closed source protects very little, while costing two things that matter:

1. **Continuity.** People will depend on this daily for medication they cannot miss. If maintenance stops, open source lets someone continue it; closed source strands them. For a health tool that is an ethical consideration, not just a licensing one.
2. **Auditability**, though less than it appears — see the DevTools point below.

What open source costs: under a permissive licence someone could ship an ad-supported fork. Under AGPL they could not close it. Neither could use the name.

Options:

- **AGPL-3.0 + trademark on "Graftful"** — forks must stay open, and nobody may ship _as Graftful_. Gets essentially everything closed source would, minus a protection that is not needed. **Recommended.**
- **Source-available** — source published, rights reserved. Auditability without permitting forks. A reasonable middle if the continuity argument does not land.
- **BUSL-style delayed open** — proprietary now, converts to Apache-2.0 after a fixed period. Preserves optionality.
- **Proprietary, free to use** — simplest, and fine if the continuity risk is accepted explicitly rather than by default.

### Trust, whichever licence is chosen

- [ ] **Make the privacy claim independently verifiable.** Because everything runs client-side, anyone can open DevTools, watch the Network tab, and confirm that logging a dose produces no outbound request. Say so on the privacy page and explain how to check. A claim someone can falsify in thirty seconds is worth more to a non-technical user than a repository they will never read — which is why this matters more than the licence for trust purposes.
- [ ] Publish the exact list of outbound requests the app can ever make: in v1, none at all; from v2, the push subscription if reminders are enabled. Nothing else. Then hold to it.
- [ ] Terms of use: free to use, no warranty, not medical advice, may be discontinued, no guarantee of data retention on the device
- [ ] No account, no sign-up, no email required
- [ ] Say plainly on the landing page that data stays on the device
- [ ] Export / import so the user can prove they own their data — and recover it. This is also the mitigation for maintainer risk: with an export, a user is never trapped, whatever happens to the project.

#### Share the backup to the OS, rather than integrating a cloud provider

- [ ] **Offer the backup through the Web Share API** — `navigator.share({ files: [backup] })` hands the file to the OS share sheet, so the user can put it in Drive, iCloud, Files, or anything else installed. Deliberately **not** a Google Drive integration: browser-only OAuth issues a one-hour access token and no refresh token, so it could never back up unattended anyway, and it would cost a Google Cloud project, brand verification, `accounts.google.com` in the CSP, and the rewriting of a privacy claim that is now stronger than it was — v1 makes no outbound request at all. The share sheet is the OS, not a third party: no network request leaves the page, so `e2e/app.spec.ts` stays green and the privacy position is untouched. The promise is explicitly _a way out_, not a guaranteed backup — the app cannot know where the file went, and the copy should not imply it does.

  Four things to get right, in the order they will cost time:

  - **Call `share()` under the user gesture.** Safari is strict about transient activation and has historically thrown `NotAllowedError` after an `await`. `doExport` currently awaits `exportJson()`, which reads Dexie. Build the payload synchronously instead — `buildExport` is pure and `$regimen` is already in memory via `liveQuery` — so nothing is awaited between the click and the call.
  - **Gate on `navigator.canShare({ files })`, not on `navigator.share`.** It returns false when the platform will not accept the type, and `application/json` through the iOS share sheet is the part to verify on a real device. Keep `downloadFile` as the fallback so Firefox and desktop are unaffected and the feature is purely additive.
  - **Date the filename** — `graftful-backup-YYYY-MM-DD.json`. A downloads folder dedupes with `(1)`; a share target will not, so a fixed name leaves the user unable to tell which copy in Drive is current.
  - **Reuse the empty-export refusal.** The share path must go through the same guard as `doExport`, or it reintroduces the bug already recorded above: a file with no products is indistinguishable from a real backup and destroys the data it was meant to save.

  Testing note, in the same category as the Playwright/service-worker limitation in §3: no harness can drive a share sheet. Stub `navigator.canShare` and `navigator.share` via `addInitScript` and assert the app calls it with the right filename and MIME type, and that the button is absent when `canShare` is false. The honest test is narrower than the feature, and that is worth stating rather than faking.

- [ ] **Tell the user when the backup no longer matches the regimen.** A `lastBackupFingerprint` in settings, compared against a fingerprint of the current regimen, with a plain notice in Setup's backup card when they diverge. Same mechanism as `lastIcsFingerprint` and the stale-calendar detection in §3 — reuse that shape rather than inventing a second one.

  A fingerprint, **not** a "last backed up" timestamp. A timestamp says "three weeks ago" even when nothing has changed, so it is either wrong or ignored; a fingerprint goes quiet on its own and the notice it produces is specifically true — what you have now differs from what you saved.

  **Hash the structural data only: products, therapies, dose versions. Not stock events, not order lines.** Those change weekly, they are cheap to recount, and including them would leave the notice permanently on — which is the failure already recorded for order alerts, where nagging about something already handled teaches people to ignore the app. The narrowing is not a policy scattered through the UI; it is simply what goes into the hash.

  Three consequences:

  - `lastBackupFingerprint` is a new `Preferences` field, so the checklist in AGENTS.md applies: both directions of `transfer.ts`, validation, the `Record<keyof X, true>` map, and a real value in `FULL_STATE`. It **should** persist — the fingerprint in a backup file describes the state that file contains, so carrying it across means a fresh restore does not immediately demand another backup. Same reasoning `lastIcsFingerprint` already follows.
  - The notice belongs in Setup, beside the persistence-refused message. **Not on Today**, for the reason already recorded for the survey invitation: that screen is the safety-critical path.
  - `share()` resolves on hand-off, so success is not observable. Cancelling usually surfaces as `AbortError` — catch that and leave the fingerprint alone, which is better than the `.ics` flow, where the fingerprint is written after triggering a download that is equally unverifiable. Either way say so in a comment, because the bad outcome is the app claiming a backup the user cancelled.

- [ ] Visible version number and changelog
- [ ] Disclaimer reachable from every page, not buried
- [ ] No third-party trackers, no ad networks, no CDN-hosted fonts
- [ ] If the repo ends up private: GitHub Actions is capped at 2 000 minutes/month rather than unlimited. Ample here, but a real consequence.

## 7. Internationalisation

**Launch: French first.** Valais and Vaud are francophone and the first users come from a French-speaking transplant centre. English defines the `Messages` type so a missing key is a compile error; that is a build-time role and not a demotion of French.

Four catalogues exist and are complete for the app shell, Today, Stock, the pharmacy order text and the calendar export — the last two matter most, being the only things that leave the device.

- [x] French (launch language)
- [x] English (defines the catalogue type)
- [x] German — Zurich, Bern, Basel, St. Gallen centres
- [x] Portuguese (Portugal)
- [x] i18n built in rather than retrofitted
- [x] Translate the Order screen (small, part of the daily loop — do this first)
- [x] Translate Setup (~48 strings, mostly explanatory prose)
- [x] Translate the content pages: About, Privacy, Roadmap, Support
- [ ] Have the German reviewed by a native speaker before launch
- [ ] Italian later (Ticino), once the four above are complete everywhere

## 8. Regulatory

- [ ] Write the one-paragraph intended-use statement
- [ ] Send a qualification enquiry to Swissmedic (`anfragen@swissmedic.ch`) — a written "not a device" reply is what a hospital will want to see
- [ ] Read the eHealth Suisse _Guide for app developers, manufacturers and distributors_ (April 2022)
- [ ] Keep `DECISIONS.md` current — rejected features and why
- [ ] Check every new feature request against the intended-use statement

## 9. Distribution

- [ ] Approach the CTO transplant coordinators (not reception) — they own the adherence conversation and can vouch for a flyer
- [ ] Flyer: QR to a French landing page, URL in readable text underneath, add-to-home-screen instructions
- [ ] Distinct `?src=` per location
- [ ] Local GP in Martigny — a warmer channel than a poster
- [ ] Ask the coordinators about a Swiss transplant recipients' association
- [ ] Swisstransplant as a later amplifier (their focus is donation, not post-transplant adherence)

## 10. Environments and infrastructure

Two environments, same shape, so a deploy to preview is a genuine rehearsal.

|        | Production     | Preview                       |
| ------ | -------------- | ----------------------------- |
| Host   | `graftful.app` | `<branch>.graftful.pages.dev` |
| Robots | indexable      | must be verified, see below   |

No custom preview domain. `preview.graftful.app` was planned and then dropped: Cloudflare gives every branch a `pages.dev` alias automatically, which is enough for testing and removes a DNS record, a certificate and an Access policy from the setup. Fewer moving parts on the path that only ever serves me.

Platform-independent:

- [x] Register `graftful.app` — **Infomaniak** (Swiss registrar; keeps registration independent of whoever hosts, and costs a little more than at-cost registrars). Registered 31 August 2026.
- [x] **Unknown paths answered 200, and nobody chose that.** Fixed. `adapter-static` had no fallback, so Cloudflare Pages served `index.html` for anything it could not match: `/nope`, `/.env`, `/.git/config` and `/wp-login.php` all returned **200** with the Today page. Two costs. A scanner probing for `/.env` reads 200 as confirmation the file is there, and every probe counted as a successful page view in Cloudflare's traffic analytics, so the figures described attention the app was not getting — which is how this was noticed. The fix is `adapter({ fallback: '404.html' })`. The filename is the mechanism: Pages serves a file with that name using a 404 status, whereas naming the fallback after the index would overwrite the prerendered root with a contentless shell. A `+error.svelte` was added at the same time, because without one the fallback rendered SvelteKit's built-in error page: unstyled, untitled and offering no way back, which looks like a broken app rather than a broken link. Offline behaviour is deliberately unchanged — the service worker still answers unmatched navigations with the cached `/`, since someone offline who mistypes a URL wants their doses rather than an error. Guarded by two tests in `src/lib/headers.test.ts`: the fallback document must have a cache rule, and every document must be served `no-transform`. Both were proved to fail when their protection is removed. The first version of the fallback guard read its filename with a regex loose enough to match the comment naming `index.html` as the wrong choice, so it checked the wrong document and passed — the same self-matching trap `markup.test.ts` already carries a note about.

- [ ] Accepted limitation: **404 responses still carry Cloudflare's injected script**, so a mistyped URL logs one CSP violation in the console. The status code, the page and the analytics figures are all correct; only that console line remains. It cannot be fixed from `_headers`, and this was tested rather than reasoned about. The obvious fix is to move `no-transform` onto the `/*` rule, since rules match the incoming request path and an unmatched path cannot be listed — a request for `/nope` is answered with 404.html but matches `/nope`, so the `/404.html` rule never fires and only `/*` reaches it. That was deployed and measured: the 404 response came back `Cache-Control: no-store`, still Brotli-compressed and still carrying the injected script. Cloudflare replaces the cache headers on the 404 responses it generates, so the directive never arrives no matter which rule sets it. The attempt also cost something worth recording. Because Cloudflare joins repeated header values with commas instead of overriding, every rule setting its own Cache-Control needed `! Cache-Control` first, or hashed assets would have inherited `no-transform` and lost compression. The detach worked for the hashed assets and kept Brotli, so the mechanism is sound — it simply protected against a cost that buys nothing here. Reverted. What remains would need a Pages Function to serve unmatched paths and set its own headers, which means adding server-side code to a project whose premise is that there is no server, for one console line on a page users rarely reach. Revisit only if Cloudflare allows JavaScript Detections to be disabled, which removes the problem instead of routing around it.

- [ ] **The service worker is served `max-age=14400` on the live domain**, not the `no-cache` that `_headers` asks for. Confirmed not to be caused by our configuration: the file is byte-identical to the version that shipped at launch and the header persists, `_headers` demonstrably reaches that response (the `/*` security headers all arrive), and `cf-cache-status` reported `MISS`. Files with no rule at all get Cloudflare Pages' own default of `public, max-age=14400, must-revalidate`, so something above `_headers` is setting a four-hour browser TTL for JavaScript. Most likely **Caching → Configuration → Browser Cache TTL** on the zone, which should be `Respect Existing Headers`. Practical impact is small, which is why this is recorded rather than urgent: the app registers without `updateViaCache`, so it defaults to `imports` and browsers bypass the HTTP cache when checking the worker script for updates. The stale-worker fear in the `_headers` comment predates that default. Worth fixing anyway, because relying on a browser default to cancel out a server misconfiguration is not a property to depend on. Re-verified 3 September 2026 against the live origin: only `/service-worker.js` is affected — every document and even `manifest.webmanifest` arrive with the Cache-Control that `_headers` asks for, so the override is specific to JavaScript responses. The remaining step is the dashboard: **Caching → Configuration → Browser Cache TTL → `Respect Existing Headers`** on the `graftful.app` zone, then confirm with `curl -sI https://graftful.app/service-worker.js | grep -i cache-control` and expect `no-cache` rather than `max-age=14400`.

- [ ] Keep preview out of search engines, so a half-finished health app never surfaces in results. `robots.txt` cannot do this: preview serves the same build as production and therefore the same permissive file. Check what Pages actually sends on a branch alias before assuming anything, by requesting it and looking for an `X-Robots-Tag` header. If there is none, the options are a Pages access policy on preview deployments, or accepting that the URL is unlisted and unlinked — which is weaker than it sounds, because certificate transparency logs are public and routinely crawled.

- [ ] Infrastructure as code, not console clicks
- [ ] Separate credentials per environment, no cross-environment write access. Currently moot rather than solved: the Git integration deploys without any credential held by this project, so there is no token to scope. It becomes real the moment a Worker or D1 exists.

### GitHub repository

The global git config in this environment is `luiscmm@amazon.ch`. Committing a personal health project under a work address publishes that address permanently in history and muddies whose project this is — the AGPL copyright holder is a private individual, not an employer. Set a per-repo identity before the first commit, not a global one:

```
git config user.name "Luis Marques"
git config user.email "<personal address>"
```

Worth checking Amazon's internal policy on personal open-source work before publishing too, since that is a separate question from the licence.

- [x] Set the per-repo commit identity above — `Luis Marques <marques.luis88@gmail.com>`, repo-scoped, global config untouched.
- [x] Create `graftful` on GitHub as **public**, and decline GitHub's offer to add a README, `.gitignore` or licence — all three already exist and its versions would conflict. Live at `github.com/luiscmmarques/graftful`, AGPL-3.0 detected by GitHub.
- [x] Verify `private/` is absent from the first push. `git check-ignore -v` confirms the rule locally, but check the file list on GitHub once too: history cannot be rewritten after forks or archives exist. Confirmed: `git ls-files private/` is empty, 135 tracked files total.
- [x] Enable Issues — `SPREADING.md` assumes somewhere to send feedback. Enabled, with structured bug and idea forms under `.github/ISSUE_TEMPLATE/`.
- [x] ~~Add repository secrets for the Pages deploy: `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID`.~~ Not needed. Pages builds from the Git integration, so Cloudflare pulls the repository itself and nothing in GitHub holds a Cloudflare credential. One less secret to rotate or leak.

### If Cloudflare

Registration stays at Infomaniak; Cloudflare becomes authoritative for DNS by nameserver delegation. Universal SSL and CNAME flattening both work exactly the same that way — they need Cloudflare to run the zone, not to have sold the domain.

- [x] **Disable DNSSEC at Infomaniak _before_ changing nameservers.** This is the one step that can take the domain down completely rather than degrade it. The registry holds a DS record pointing at Infomaniak's signing keys; once Cloudflare answers for the zone those keys no longer match, every validating resolver returns SERVFAIL, and the domain is unreachable — not slow, unreachable. It also caches, so the fix is not instant. Order: disable DNSSEC → wait for it to clear → change nameservers → zone active on Cloudflare → optionally re-enable DNSSEC using Cloudflare's DS record.
- [x] Add the site in Cloudflare, let the scan import existing records, then point Infomaniak's nameservers at the two Cloudflare ones. Propagation is usually quick but allow up to 24h; Cloudflare emails when the zone goes active.
- [x] **Check what the import actually copied** — see the record inventory below. Verified by `dig`: MX, SPF, DMARC and all four SRV records survived; DNSSEC confirmed off at the registry by RDAP (`delegationSigned: false`, no DS record).
- [x] Cloudflare Pages project, apex domain (CNAME flattening handles the apex). Live 31 August 2026. Build command `npm run build`, output directory `build`, Node from `.nvmrc`, no environment variables required.
- [x] **TLS.** Pages issues a free Universal SSL certificate automatically when the custom domain is added — nothing to configure, auto-renewed. Two settings to confirm on the zone afterwards: - SSL/TLS mode **Full (strict)**. "Flexible" causes redirect loops. - **Always Use HTTPS** and **Automatic HTTPS Rewrites** on. Redundant on `.app`, which is HSTS-preloaded at the TLD, but correct for any domain added later.
- [x] **Expect a gap before the certificate is live.** Usually a few minutes, sometimes longer on first issuance. On `.app` this looks like total failure rather than a warning: the TLD is HSTS-preloaded, so the browser refuses to try http at all and there is no click-through. Do not conclude the deploy is broken — check the custom domain shows "Active" in the Pages dashboard first.
- [x] Confirm `static/_headers` is applied (it ships in `build/`). It carries the CSP, framing and referrer policy, and keeps the document off `Cache-Control: no-store` so the page stays bfcache-eligible.
- [x] `_headers` for Cache-Control. No `_redirects` file: there is no SPA fallback to configure, and the build log confirms Cloudflare parsed all 13 header rules. Note the rules only match the paths they name, which is why unknown paths get Cloudflare's defaults — see the 404 item above.
- [x] ~~Preview: map `preview.graftful.app` to a branch.~~ Dropped. The automatic `<branch>.graftful.pages.dev` alias is enough for testing, and skipping the custom domain avoids a DNS record, a certificate and an Access policy.
- [ ] One Worker for the push API and the cron sweep
- [ ] D1 for subscriptions, `--location weur`
- [ ] Decide whether preview deployments need an access policy at all now that they live on `pages.dev` rather than a domain of ours. Depends on what the robots check above finds.

#### WHOIS privacy: already in place, nothing to buy

Checked by RDAP at registration. The only entity published is the registrar, Key-Systems LLC — Infomaniak resells through them — and the only contact is their mandatory abuse address, `abuse@key-systems.net`. No registrant, admin or technical contact is published, and no personal name or address appears anywhere in the response.

That is the post-GDPR default for gTLDs under ICANN's Registration Data Policy, not a paid add-on, so there is no privacy product to buy here. Note also that Cloudflare Registrar's free WHOIS privacy is irrelevant to this setup: WHOIS is published by the sponsoring registrar, and delegating DNS does not move the registration. Cloudflare is not in that path at all.

What stays public regardless: registrar, registration and expiry dates, status codes, nameservers and DNSSEC material. Redaction is also not anonymity — the registrar holds the real details and must disclose them to legitimate requesters.

Status at registration also showed `client transfer prohibited`, the standard 60-day ICANN lock after a new registration. It blocks moving the _registration_ to another registrar until 30 October 2026. It does **not** affect changing nameservers, so the Cloudflare delegation is unaffected.

#### DNS records to carry across

Infomaniak provisions the domain with 14 records, all mail-related, so there is real state to lose in the delegation. Mail hosting stays at Infomaniak either way — only the records move.

Confirmed present at registration, 31 August 2026:

| Record                                         | Type | Target                |
| ---------------------------------------------- | ---- | --------------------- |
| `_dmarc`                                       | TXT  | `v=DMARC1; p=reject;` |
| `_imap`, `_imaps`, `_pop3`, `_pop3s` (`._tcp`) | SRV  | `mail.infomaniak.com` |
| `_submission`, `_submissions` (`._tcp`)        | SRV  | `mail.infomaniak.com` |

Not yet inventoried — below the fold in the Infomaniak zone view, and the three that actually carry mail:

- [x] `MX` — `5 mta-gw.infomaniak.ch`, survived the delegation.
- [x] `TXT` SPF — `v=spf1 include:spf.infomaniak.ch -all`, survived.
- [ ] `TXT` DKIM — **none found.** Queried `default`, `infomaniak`, `k1`, `mail` and `dkim` selectors after the delegation; nothing answered. Most likely it does not exist yet because no mailbox has been created, rather than having been lost in the import. When Infomaniak issues one it must be published in **Cloudflare**, which is now authoritative for the zone — adding it at Infomaniak will appear to work and do nothing.

Cloudflare's scan reliably imports `MX` and `TXT`. It is **less reliable with `SRV`**, so check those six by hand. Losing them costs mail client autoconfiguration, not mail delivery — annoying rather than fatal.

`p=reject` raises the stakes on the other two. If SPF or DKIM do not survive, mail from the domain is rejected outright rather than spam-filed, and since the DMARC record carries no `rua=` address nothing reports the failure. Worth adding one before relying on the domain for feedback (see `SPREADING.md`).

- [ ] Add `rua=mailto:hi@graftful.app` to the DMARC record. With `p=reject` and no reporting address, a broken SPF or DKIM means mail is refused and nothing tells you — the failure mode is silence, which is the worst kind for an address printed on a flyer.

## 11. CI/CD and the development lifecycle

What exists today: GitHub Actions runs the full gate on every push and pull request, and Cloudflare Pages deploys `main` through its Git integration. Those are two independent systems, and that is the important thing to understand about the current setup.

**Production is not gated by tests.** A push to `main` is deployed by Cloudflare whether the Actions run passes, fails, or is still running. The original plan in this section chose Actions over the Git integration for exactly this reason, and then the Git integration was used anyway because it needs no credentials. The gap is not theoretical: the Content-Security-Policy that stopped the app booting was deployed to the live domain, and what caught it was opening the site in a browser, not the pipeline.

Closing it does not require moving deploys into Actions. Protecting `main` so that changes arrive through pull requests puts the gate before the merge instead of before the deploy, which reaches the same outcome with less machinery.

### Branch protection and flow

- [ ] Protect `main`: require a pull request before merging, and require the CI checks to pass. Settings are under **Settings → Branches → Add branch ruleset** for `main`.
- [ ] Enable **Do not allow bypassing the above settings** — otherwise the rules apply to everyone except the repository owner, which on a single-maintainer project means they apply to nobody.
- [ ] Require the specific check by name rather than "any check", so a renamed or deleted job cannot silently satisfy the requirement.
- [ ] Work on branches named `feature/<short-name>` or `fix/<short-name>`, open a pull request, let Cloudflare build the preview and Actions run the gate, and merge only when both are green.
- [ ] Decide the merge strategy, because it interacts with the single-commit convention. Squash merge keeps one commit per change on `main` and is the closest continuation of the current history; merge commits would make `main` a record of branches rather than of changes. Amending a published commit stops being appropriate once anything is merged, since `main` will no longer be safe to force-push.
- [ ] Add a post-deploy smoke check that would have caught the CSP breakage: load the live site in a headless browser, assert no console errors and that a click does something. A status code is not evidence the app runs, which is the whole lesson of that incident.

- [ ] **`CONTRIBUTING.md`, but only after the flow above actually works.** A contributing guide that describes a pull-request flow while `main` still takes direct pushes documents an aspiration, and the first outside contributor discovers the difference. Write it once branch protection is on and one change has genuinely gone through a branch, a preview build and a green gate — then the document is a description rather than a promise.

  What it needs to cover, most of which already exists in scattered form: the four commands that must pass before anything is claimed to work (`check`, `test`, `build`, plus `format`), the branch naming and merge strategy settled above, the `(feat)` / `(fix)` commit prefix this history already uses, and a pointer to `AGENTS.md` — which is written for agents but is the shortest statement of the constraints a human contributor must not break either.

  Two things a contributor cannot be expected to infer, and which belong at the top rather than buried: the medical-device boundary in `DECISIONS.md` is not negotiable feature by feature, so a pull request that derives a dose or interprets a lab value will be declined on principle rather than on quality; and a change to any type in `src/lib/domain/types.ts` drags the backup round-trip checklist with it, or a restore silently loses the field.

### Already in place

- [x] `test` job on every push and PR: `npm test` — the domain suite is the regression baseline against the original spreadsheet and must stay green
- [x] `build` job: type-check, bundle, assert the service worker and manifest are present in the output. Also builds with no `.env` file, which is how a clean clone and Cloudflare both build it — a missing variable used to fail the build and report a missing service worker, pointing nowhere near the cause.
- [x] End-to-end suite in CI, all specs, no name filter. Filtering by name once hid a failing spec that only CI ran.
- [x] Version stamped into the build and shown in the UI, so a user reporting a problem can say what they are running. Visible on `/about` and carried in the issue and mail links.
- [x] ~~PR → deploy to `preview.graftful.app`, comment the URL on the PR.~~ Superseded: Cloudflare builds every branch at `<branch>.graftful.pages.dev` automatically.
- [x] ~~A Cloudflare API token scoped to Pages + Workers edit on one zone only, stored in GitHub secrets and rotated.~~ Not needed while the Git integration does the deploying: there is no Cloudflare credential anywhere in this repository or its Actions.

### Still open

- [ ] Tag on `main` → production behind a manual approval gate. Only reachable by moving deploys into Actions, which reintroduces the API token above. Worth it only if the branch protection above proves insufficient.
- [ ] Deploy the Worker and Pages together, Worker first — a site expecting an endpoint that is not live yet is worse than the reverse. Applies from v2.
- [x] Dependabot — `.github/dependabot.yml`, monthly and grouped. Grouped on purpose: one runtime dependency and a pile of build tooling means a weekly stream of individual pull requests becomes noise, and an ignored bot is worse than no bot because it looks like coverage. Security updates still arrive on their own.
- [ ] `npm audit` in CI. `npm ci` reports 4 low-severity advisories in the build log that nothing fails on. Worth deciding the threshold before adding it, or the gate goes red on something nobody intends to fix.
- [x] Add `Strict-Transport-Security` to `_headers` — `max-age=31536000; includeSubDomains`, no `preload`. Redundant on `.app`, which is HSTS-preloaded at the top level, but it costs one line and stops the header being silently absent if the app is ever served from a domain without that guarantee. `preload` was left off deliberately: the TLD already covers it, and asking to join the preload list is a commitment that buys nothing here.

## 11a. Performance

Measured against the live site on 1 September 2026, not estimated. The headline is that performance is currently fine, and this section exists so that stays true rather than because something is wrong.

| Measure                   | Value                            |
| ------------------------- | -------------------------------- |
| First contentful paint    | 384 ms                           |
| DOM content loaded        | 380 ms                           |
| Requests on first load    | 19                               |
| Transferred on first load | 87.9 KiB                         |
| Decoded on first load     | 224.9 KiB                        |
| Service worker precache   | 54 entries, 466 KiB uncompressed |

Where the bytes are:

- **Dexie is the largest single dependency**: 106.4 KiB decoded, 35.8 KiB transferred, which is 41% of everything the first page pulls down. It is also load-bearing — `liveQuery` drives the reactive stores in four places, and replacing it means rewriting how every screen observes the database. Not worth doing for 36 KiB on an app people open a few times a day, and a refactor of the data layer is exactly the kind of change that loses someone's dose history. Recorded so the number is known, not as work to schedule.
- **Each prerendered shell was 13.4 KiB on the day this was measured, and 86% of that is the `<head>`.** Only about 1 KiB is server-rendered content. There is no inline CSS at all; styles ship as a separate 4.5 KiB file. The app shells are 11.2 KiB in the current build, after the launch-image trim below.
- **16 `apple-touch-startup-image` links are 3,705 bytes of every shell** — 32% of the app shells, and 32.6 KiB across all nine. They exist so an installed iOS app shows a splash image instead of a white screen while launching. It was 24 links and 5,553 bytes until the iPhone landscape tags were removed; see the trim below.

That last one was the only real lever, and it is larger than it looks because of a decision recorded in `DECISIONS.md`: HTML is served `no-transform` to stop Cloudflare injecting a script, which also disables compression. These links are near-identical strings that gzip to a fraction of their size — the eight that were removed cost 1,848 bytes of every shell uncompressed and would have gzipped to 83, so with compression on the whole trim would have been invisible and not worth doing. The two decisions interact, and neither is visible from the other.

- [x] **Trim the iOS launch images — done, and the lever was orientation rather than device size.** An iPhone launches a home-screen web app in portrait whatever way it is held, so the eight iPhone landscape media queries could never match at launch: dead weight in every shell for images iOS would never draw. iPads do rotate at launch and keep both orientations. Every device size stays, iPhone X and SE included — the audience skews older and those are phones in use, so nothing was dropped for being old. 24 links → 16 (4 iPads × 2 orientations, 8 iPhones × 1). Measured from the built output, not estimated: `build/index.html` 13,343 → 11,495 bytes (−13.9%), all nine shells together 144,568 → 127,936 bytes (−16.2 KiB), and the splash block itself 5,553 → 3,705 bytes per shell. The block figures are the exact ones to quote — a shell's total moves by a byte or two between builds because SvelteKit embeds a per-build id and a CSP hash in it — so the saving is precisely 1,848 bytes per shell and 16,632 across the nine. The eight orphaned PNGs were deleted by hand — the generator writes and never removes — taking 220,047 bytes (214.9 KiB) out of `static/`, which is repository and deploy weight rather than page weight since launch images are not precached. The precache is unchanged at 53 entries, confirmed by reading the built worker: it contains no `icons/splash/` entry at all, so the deletion could not have moved it. A white flash on iPhone launch was never at stake, which is why this did not need a phone in hand after all.
- [ ] Re-measure after any change, and record the numbers here rather than describing them. Every figure above came from `performance.getEntriesByType` against production and from the built output, and each one contradicted a guess I had made first.
- [ ] Revisit `no-transform` if Cloudflare ever allows JavaScript Detections to be disabled on this plan. It would restore compression for HTML at no cost to anything else.
- [ ] Set a budget that fails CI, since `STACK.md` describes budgets that nothing measures. A first-load transfer ceiling is the one worth enforcing, because it is what a user on a hospital connection actually waits for.

## 12. Deferred

Not in scope. Kept here so the constraints do not have to be rediscovered.

### Product-event counters

A first-party `POST /e` on the Worker writing to D1, for `dose_logged`, `order_generated`, `reminder_enabled`. Same origin so blockers do not touch it, and queueable in IndexedDB offline then flushed. No persistent identifier, so no consent banner; retention via a coarse days-since-install bucket (`0`, `1-7`, `8-30`, `31-90`, `90+`). Add only when a specific decision depends on it.

### Community statistics

Monthly published figures on medication burden. **Reframed as an anonymous survey** rather than background collection: the user actively chooses to answer, consent is inherent in the act, no code path in the app ever touches health data, and you can ask better questions than you could infer from stored data.

Constraints that still apply, whatever the mechanism:

- Buckets, never raw values — organ as a category, years as `0-1`/`1-5`/`5-10`/ `10-20`/`20+`, pills as `1-5`/`6-10`/`11-15`/`16+`
- Suppress any published figure derived from fewer than ~20 respondents. Switzerland performs a few hundred transplants a year, so organ + year + pill count can identify one person.
- Every publication states the selection bias: these are Graftful users, not transplant recipients in general
- **Self-host the form.** A Google Form or Typeform embedded on `graftful.app` reintroduces exactly the third-party health inference that GA4 was rejected for.
- Anonymised aggregate data is generally outside the Human Research Act, which is what avoids needing CER-VD ethics approval. Confirm alongside the Swissmedic enquiry if this is ever built.
- Target medication burden, which no registry publishes. Swisstransplant already covers transplant demographics from complete data and would do it better than a self-selected sample.

Invitation placement, when the time comes: **never on the Today screen**, which is the safety-critical path. A dismissible one-time card on a secondary screen after some weeks of use — an app that promises no ads should not open with a banner.

### Other

- Lot and expiry tracking on stock events (the ledger already allows the column)
- SQLite WASM + OPFS, if SQL over the local data is ever wanted
- Durable Object Alarms for exact per-user reminder scheduling, replacing the 5-minute cron sweep

### Bug: the date was frozen at page load

Every screen did `const today = todayIso()` at component setup. The back/forward cache restores a page's entire JavaScript heap without re-running anything, so a page opened at 23:55 and returned to at 00:05 kept believing it was yesterday — wrong doses shown as due, stock urgency understated, order triggers evaluated against a stale date. Backgrounding an app overnight on a phone is the normal way people use one, so this was not an edge case.

Fixed with a `today` store in `src/lib/lifecycle.ts`, refreshed from three directions: a timer to the next local midnight for a page left open, `pageshow` for a bfcache restore, and `visibilitychange` for returning to a backgrounded tab. A frozen page runs no timers, so the timer alone was never sufficient.

The stores also refetch on restore. A frozen page processes no BroadcastChannel messages, so a Dexie `liveQuery` can miss a write made in another tab while it was away; re-subscribing re-runs the query.

bfcache is opt-_out_, not opt-in. `src/lib/lifecycle.test.ts` fails the build if anything registers `unload` or `beforeunload`, and `static/_headers` keeps the document off `Cache-Control: no-store`. Both disqualify the page silently, with nothing logged anywhere.

### The lockup is one asset, and the wordmark is outlined

The header first paired an inline SVG with a text node. That is fine for a header and wrong for a design system: the gap between mark and name depends on the reader's font metrics, and the name renders in whatever font they happen to have — so the header, a link preview and a printed handout would each look slightly different.

`static/lockup.svg` now holds both, with the spacing fixed in the file. The header uses it, the social card is composed from it, the launch images are composed from it, and `lockup-inverse-624.png` exists for print. One asset, one set of proportions.

The name is **outlined into paths** rather than set as `<text>`, which is what makes the file self-contained: no font is downloaded, none is shipped, and it renders the same anywhere an SVG opens. Outlines came from Lato Bold (SIL OFL 1.1), produced once into `scripts/wordmark.json`; neither the font nor `opentype.js` is a dependency.

Three things cost time and are worth writing down:

- `opentype.js` silently ignores its `letterSpacing` option and stacks every glyph at x=0. The bounding box still comes back plausible, so it looks like a rendering problem.
- Its `toPathData()` emitted a `NaN` coordinate in one control point of the `r`. A single non-finite number invalidates the entire path and browsers drop it without any error. `build-lockup.mjs` serialises the commands itself and rejects non-finite values, so a bad number is named rather than shipped.
- The mark's bounding box starts at (218, 157) in the shared coordinate space, not the origin. Offsetting only `y` when placing it left the mark 165 units right of where it belonged, printed over the G — and it looked like a font problem, not an arithmetic one.

The header's fallback follows what MDN documents for vector graphics: the SVG in `srcset`, a raster in `src`, `alt` carrying the name. The launch images, the social card and the print lockup are excluded from the service worker precache; the header's lockup is not, because the app renders it.

### The mark, and a broken icon pipeline

`mark.svg` was not an SVG. It was a 192 px PNG with an `.svg` name, byte-identical to `icon-192.png` — so the 512 px icons had been upscaled from 192, and the regeneration steps documented in `static/icons/README.md` would have produced garbage from garbage.

The cause is worth remembering: those steps piped the sources through `sharp-cli` with the output directory set to the source directory. `sharp-cli` names its output after the input, so it overwrites the source with its own result. This was reproduced by accident while drawing the candidates — one of them turned into a PNG mid-session in exactly the same way.

Replaced with three real vector sources and `scripts/generate-icons.mjs` (`npm run icons`), which renders through the Chromium Playwright already installs and only ever writes derived filenames, so it cannot overwrite its own input.

The mark is two stems rising into one with a swelling at the union — `graft` as the horticultural word it was first, which says the name, works for any organ and avoids clinical imagery. Four candidates were rendered at 192, 96, 48 and 32 px and circle-cropped before choosing, because small sizes are what decide it: the straight-armed version read as a plain letter Y, a bound-graft version turned to mush by 32 px, and a lighter-stroke version lost the union entirely.

Also fixed on the way: the `maskable` icons were copies of the `any` icons, which either clips the artwork or leaves it over-padded. They now have their own source, scaled inside the 80% safe circle. The favicon is now the SVG with the PNG as fallback, and `og-image.png` is generated from the same mark rather than being a leftover.

Build output dropped from 452 KiB to 411 KiB, because the placeholders were upscaled rasters.

Still missing: iOS splash screens, so there is a white flash when launching from the home screen.

### The example regimen no longer describes a real one

The invented brand names were doing less work than they appeared to. Removed before the first commit, because git history is permanent once anyone forks or archives the repository:

- **Dose version ids were abbreviated real drug names with the real dose attached**, and one therapy id was a drug class. Not repeated here, for the same reason they were removed.
- **Therapy names carried the classes**: `(anti-rejection)` twice, `(blood pressure)` twice, `(steroid)`, `(calcium + vitamin D)`, `(pain relief)`. Together those spell out the whole treatment regardless of what the products are called.
- **Categories were real clinical classes** in French: `Anti-Rejet`, `Anti-hypertenseur`, `Corticoïdes`, `Calcium`, `Anti-douleur`. Setup even _prefilled_ `Anti-Rejet` as the default category for a new therapy.
- **`activeIngredient: 'Betacor mofetil'`** kept a real drug suffix, and `'Gammaphen Retard'` a real slow-release designation.
- **Product ids encoded the strengths** (`beta-500`, `epsilon-20`, …), so renaming strengths alone would have left them behind.
- **A comment quoted the consultation notes verbatim**, in French.
- The strengths themselves, which with the categories were enough for a clinician to identify each molecule.
- `README.md`, `DECISIONS.md`, `AGENTS.md` and this file restated the real doses in prose.

What made this cheap: days-of-cover depends on units per dose and stock counts, **not** on strength or category, and `category` is display-only. So the strengths and labels could all change while `SHEET_JOURS` stayed byte-identical — verified: the same 50/50/null/75/50/50/ 200/600/90/null/null, and `pillsPerDay` still 12.5.

Residual, stated plainly: pill counts and box sizes are still real, because they _are_ the regression. A weak hint, not a blueprint. Removing it would mean giving up the externally verified expectations that caught two of the three worst bugs in this project.

### Gap: four routes had no cache rule at all

Raised while thinking about deployment, and it was a real hole. The build emits eight HTML documents; `static/_headers` named four. `/stock`, `/order`, `/setup` and `/roadmap` had no directive, and neither did **`/` itself** — Cloudflare matches on the request path, and a request for `/` does not match a rule written for `/index.html`.

Why that matters more than ordinary staleness: every route is prerendered as its own shell, and each shell references asset filenames containing a content hash. A cached shell after a deploy does not show old content, it asks for files that no longer exist and the app fails to start. It would have hit returning visitors only — the people least likely to report it and most likely to be depending on the app.

The list is now complete and, more usefully, `src/lib/headers.test.ts` derives the routes from the filesystem and fails by name if one has no `no-cache` rule. It also asserts hashed assets stay `immutable` for a year, that the service worker revalidates, and that `no-store` never appears — that last one caught itself immediately, because the file explains in prose why not to use `no-store` and a naive string search found the warning.

What did **not** need adding: bundle versioning for cache-busting. Vite already emits content hashes in asset filenames, which is the correct mechanism — a changed file gets a new URL, so there is nothing to invalidate. Cloudflare Pages also invalidates its own edge on each deployment. The exposure was only ever the HTML entry points, which is what the headers cover.

A version _is_ now shown on the About page — `__APP_VERSION__`, a date plus the short commit, injected in `vite.config.ts`. That is for a different purpose: so a bug report can name a build. Without it, "I updated and it still misbehaves" cannot be answered.

### Bug: recounting to zero silently did nothing

Reported from real use: recounting a product to 0 had no effect, with no error and nothing in the console. It was not a validation problem — `stockUnits` already allows zero, and the handler carried a comment saying so.

Both `stockOnHand` and `projectedOnHand` sorted by `occurredOn`, which is a **date with no time**. Events sharing a day therefore kept whatever order they arrived in, and since ids are `crypto.randomUUID()` that order is arbitrary. So a recount entered today competed with an entry already made today and lost about half the time — the seed's counts are dated today, which is exactly the collision. Nothing to see: the number simply did not move.

`recordedAt` is now on `StockEvent` — an ISO instant for when an observation was _entered_, as opposed to `occurredOn`, the day it _applies to_. One comparator, `byLedgerOrder`, sorts by `occurredOn`, then `recordedAt`, then `id`, so the ordering is deterministic and the last thing you counted wins. Seed events sit at the start of their day so anything entered later beats them, and `recountStock` and `receiveOrder` take an optional `recordedAt` defaulting to now.

Two things worth noting. Adding the field made `transfer.roundtrip.test.ts` **stop compiling** until it was handled in both directions of the backup — the guard written a few hours earlier doing exactly its job on a real change. And the unit test that caught the ordering was written before the fix and watched to fail first, because a test that has never failed is not evidence of anything.

Recounting to zero is what you do when you have run out, which is the moment the app most needs to be believed, so there is an end-to-end test as well as a unit one.

### Bug: a delete that did not delete, and a restore that could empty the database

Three faults in the data-safety path, all found by one flaky end-to-end test that was worth chasing rather than retrying:

1. **`clearAll()` was fire-and-forget.** The handler was `confirm(...) && clearAll()` — never awaited, no error surfaced, no confirmation shown. Navigating straight after clicking could tear the transaction down with data still in place. On the one screen whose promise is that the data is yours and destroyable, that is the worst thing to get wrong. Now awaited, reported, and confirmed in the UI.

2. **`replaceAll` was not atomic.** It ran `clearAll()` to completion and _then_ opened a second transaction to write. Anything interrupting the gap left the clear applied and the write not, so restoring a backup could empty the database: old data gone, new data never arrived. Clear and write now share one transaction, so an interruption rolls back.

3. **An empty export was downloadable.** A file with no products is indistinguishable from a real backup by name and size, and restoring it replaces everything with nothing. The export is now refused with a message instead.

The third was invisible until the operations were logged in order: `replaceAll products: 11` → `clearAll` → `replaceAll products: 0`. The import had restored nothing, from a file that had captured an empty database. Every earlier theory — timing, test isolation, store reactivity — was wrong, and two ad-hoc scripts had already produced false passes by not navigating between steps.

### Rule: a data model change means checking the backup

Written up in AGENTS.md ("Changing the data model") and at the top of `src/lib/domain/types.ts`, but enforced rather than trusted to memory:

- `Record<keyof X, true>` maps in `transfer.roundtrip.test.ts` mean **adding a field to a model type stops that file compiling** until the field is listed.
- Listing it makes the round-trip assertion check it survives, naming the field if it does not.
- A second test asserts the fixture populates every field, since an optional field left `undefined` cannot distinguish "preserved" from "silently dropped".

Both were verified by deliberately breaking them: removing `note` from `parseImport` fails with "StockEvent.note did not survive a backup", and adding `expiresOn` to `StockEvent` fails type-checking with "Property 'expiresOn' is missing".

### Bug: backups did not restore preferences

Export wrote every preference; restore rebuilt settings from `DEFAULT_SETTINGS` and copied across only `targetHorizonDays` and `transplantDate`. So importing a backup silently discarded the usual dose times, the language override, the collection note and the `.ics` fingerprint — from a file that contained all four, with nothing reported.

Import also trusted the file completely: a hand-edited or truncated backup went straight into the database, where an invalid time yields a calendar no client can parse and a missing box size divides by zero.

Both fixed in `src/lib/domain/transfer.ts`, which is pure and tested — `buildExport` and `parseImport`, with Dexie reduced to persistence. Restore now validates every record, drops what it cannot use, cascades that to anything referencing a dropped product so the ledger stays consistent, and returns a list of warnings that Setup displays.

A related UI bug surfaced while testing: Setup and Order loaded their text fields once, so after a restore they showed defaults over a database holding the real values — and the obvious response to that is to retype them. Those fields now resync when the _persisted_ value changes, compared against the last synced value so typing is never clobbered.

Worth noting how this was found: an ad-hoc browser script said the round trip worked. It was wrong — it never navigated between deleting and importing, so the field still held the old value coincidentally. The e2e test, which does navigate, caught it.

### Input validation

`src/lib/domain/validate.ts`, with tests. In the domain rather than scattered through components, because these values feed arithmetic that decides when somebody is told to reorder medication, and a bad one does not fail loudly — it produces a plausible-looking wrong answer:

- a box size of zero divides by zero and asks for an infinite number of boxes
- `25:00` or `abc` as a time sorts unpredictably and emits a `DTSTART` no calendar can parse, so reminders silently never fire
- `2026-02-29` is accepted by any reasonable pattern and then behaves as 1 March, shifting an anniversary or the start of a dose
- a horizon of zero means no order is ever suggested

Every function returns a normalised value or `null`, never a coerced fallback: quietly substituting a default is how a typo becomes a wrong number on screen. Errors are shown next to the field and name what failed, rather than dropping the bad entry and keeping the rest — which would leave someone believing they had set a reminder they had not.

Maxima are sanity limits for slipped decimal points and pasted phone numbers, not clinical judgements about plausible doses. That is not this app's call to make.

### Bug: the calendar assumed Switzerland

`DTSTART;TZID=Europe/Zurich` was hardcoded, so every exported reminder fired at the wrong hour for anyone outside that zone — and looked entirely correct in the app that generated it. Now an explicit `timeZone` option, which the Setup page fills from `Intl.DateTimeFormat().resolvedOptions().timeZone`.

Anchored to a zone rather than emitted as a floating time on purpose. A floating time follows the wall clock when travelling, which silently stretches or compresses the gap between doses; an anchored one keeps the interval the user set. What _should_ happen on a long-haul flight is a prescriber's call, not this app's — hence the travel item on the roadmap rather than a guess in the exporter.

### Dose times were one person's schedule

07:30 and 19:30 were written into four places in the UI. Twelve hours apart is common for twice-daily immunosuppressants, but the clock times are agreed between a patient and their centre and are nobody else's default. Times were always editable per dose version; the _defaults_ assumed a single routine.

Now `Settings.defaultDoseTimes`, editable under "Your usual times", used only to prefill new therapies and new slots. The fallback when unset is a single time rather than a pair, because assuming twice-daily is the same class of mistake as assuming the hours.

Graftful still never proposes an interval — it only echoes back times the user entered.

### Blog (v2)

First post: a step-by-step guide to using the app. Needs somewhere to put it — most likely prerendered markdown routes in this same project rather than a separate platform, since the site is already static and there is no appetite for another dependency.

Also gives coordinators something to link to that is not a login page.

### Consultation tracker (v2)

Next consultation as a date and time, with a countdown beside the day-since-transplant counter and a `VALARM` in the same `.ics` export as the doses.

The design point is that check-ups never stop — still roughly every three months more than ten years post-transplant. So this is permanent UI, not part of onboarding, and it should not be modelled as a short post-operative phase.

It also has a consequence for procurement worth building deliberately: `targetHorizonDays` is currently a number the user has to invent. Once the next consultation date is known, the natural horizon is "enough to last until then", and the setting can default to that instead. That is the same joint-replenishment maths with a better-chosen target.

Boundary check: storing a date is a diary entry and stays clear of MedDO/ODim. The app must not suggest when a consultation should be, nor infer anything from the interval between them.

### Closed: offline works, and the last failure was the test

**Status: working.** `e2e/offline.spec.ts` passes 3/3 — precached on first visit, every route loads with the origin killed, and data can be entered and survives a reload with the origin still gone.

The final round of "offline is broken" was a harness defect, not a product one. Two fixes, neither in the service worker:

- **The tests shared one server.** The test that kills the origin left every later test starting against a dead port, so failures cascaded and looked like missing cache.
- **Readiness was measured at the wrong instant.** The check killed the server the moment `navigator.serviceWorker.controller` first became non-null, which can precede the worker being ready to serve a navigation. It now requires the same activated controller and the same cache size on two observations 250 ms apart.

Evidence the worker itself was always healthy, captured before changing anything: five seconds of polling showed one worker, `active: 'activated'`, controller set, 52 precache entries, no churn. With the origin then killed outright, `fetch('/')` and `fetch('/stock')` both returned cached HTML and `page.goto('/stock')` completed and rendered.

Fixed earlier in the same investigation, all real:

- **The app shell was never precached.** `adapter-static` writes its SPA fallback after the client build, so the PWA plugin never globbed it. Every route is now prerendered as its own shell (`src/routes/+layout.ts`), which are real build artefacts and do get precached.
- **`createHandlerBoundToURL('/index.html')` threw** `non-precached-url` at module scope, taking the entire worker down with it — including the push handler. Now points at `/` and is wrapped.
- **Two registrations were competing.** SvelteKit auto-registers `src/service-worker.ts` at a versioned URL while the app registered the same worker at its plain URL. Disabled via `serviceWorker: { register: false }` — which must go in `vite.config.ts`, because SvelteKit ignores `svelte.config.js` entirely once any option is passed to the plugin there. This is what unblocked precaching.
- **`injectRegister: 'auto'` registered nothing.** It emits `registerSW.js` and expects to inject a tag into the built HTML, which never reaches SvelteKit's prerendered output. Registration is now explicit in `src/lib/registerServiceWorker.ts`.
- **`registerType: 'prompt'` with no prompt UI.** A replacement worker would install and wait forever while the old one served asset URLs that no longer exist after a deploy. Now `autoUpdate` with `clientsClaim`.
- **Bare `self.skipWaiting()` at module scope** removed; it races precaching.

The lesson worth keeping: this feature was claimed working without a test, then claimed broken on a faulty test. Both errors came from the same absence — a check that could tell the difference. `workerStart: 0` was read as proof of no interception when it was equally consistent with measuring too early.

**Testing note:** Playwright cannot test this with `context.setOffline(true)` or `context.route(..., abort)`. Both intercept in front of the service worker, so a response the worker would have served is indistinguishable from no cache at all. Both produced convincing false failures. The harness stops the server instead.
