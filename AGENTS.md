# AGENTS.md

Graftful is a local-first PWA that helps transplant recipients manage lifelong immunosuppressant medication: dose schedules, pill stock, and pharmacy reordering. No account, no server holding health data, works offline.

Read `DECISIONS.md` before proposing a feature. It records what was rejected and why, so the answer stays consistent.

## Commands

```sh
npm install
npm run dev        # localhost:5173. Service worker is OFF in dev, on purpose.
npm test           # Vitest, 148 tests
npm run check      # svelte-check. Must be 0 errors AND 0 warnings.
npm run lint       # Prettier check
npm run format     # Prettier write
npm run build      # static output in build/
npm run preview    # serves the real build — the only way to test offline
```

Before claiming anything works: `npm run check && npm test && npm run build`. All three, every time. `check` catches things tests do not, and the build catches prerendering failures neither of the others sees. Run `npm run format` before finishing, and keep `npm run lint` clean.

Markdown prose is not hard-wrapped: `proseWrap: 'never'` in `prettier.config.js` keeps each paragraph on one line, so write it that way rather than inserting manual line breaks for `format` to undo. This also removed an old instability where an inline code span split across two lines made `lint` fail straight after `format`.

## Two standing checks on every change

**No personal data in a commit.** This repository has already leaked a personal mailbox, a work address and the maintainer's home town — each written in good faith as useful context, each scrubbed by hand later, and the ones that reached git history are permanent. `scripts/check-personal-data.mjs` scans for the known patterns; the pre-commit hook in `.githooks/` runs it against staged content (enable once per clone with `git config core.hooksPath .githooks`), and `src/lib/personal-data.test.ts` runs the same scan in `npm test`, so CI catches a bypassed hook. A false positive means refining the rule in the script, never skipping the check. The transplant story on the About page (hospital, date) is deliberately public and deliberately not guarded.

**Docs are revisited when behaviour changes.** A feature is not finished until the prose still tells the truth: reread README.md, TODO.md, STACK.md and DECISIONS.md — and this file — for anything the change made stale. The usual casualties are counts (tests, languages, screens), "not yet built" claims about something that now exists, and decision records whose premise the change just removed. Stale docs here have already caused real work: the language count, the pages checklist and the telemetry stance all drifted from reality and had to be reconciled in bulk.

## The boundary that must not be crossed

This is the single most important thing in the repository. Graftful records clinical data but never acts on it. Under the Swiss MedDO/ODim — which transposed the EU MDR in May 2021 — software that calculates doses or interprets clinical data is a Class IIa medical device (MDCG 2019-11, Rule 11). That requires a notified body and a conformity assessment, which ends the project.

**Never implement, and push back if asked to:**

- Deriving a dose from clinical data — a trough level, weight, creatinine.
- **Solving for a pill combination.** Given "14 mg" and capsules of 4, 2 and 6 mg, do not compute 3 × 5 + 1 × 3. The user enters what they were prescribed. This one looks harmless and is requested often.
- Advising what to do about a missed dose. Record it, show when it was due, surface the transplant centre's number. Nothing more.
- Drug interaction warnings.
- Interpreting a lab value: no thresholds, no trend arrows, no colouring a number red, no "out of range" badge. Raw numbers only.
- Shipping a drug database with default doses.
- Generating a taper. Transcribing one the user was given is fine.

What _is_ allowed: arithmetic on numbers the user entered. Days of cover, order quantities, and comparing a declared total against the composition the user typed (`checkDoseConsistency`) — which reports a disagreement between two of their own numbers and never decides which is right.

## Architecture

```
src/lib/domain/   pure logic. NO framework, NO browser APIs, NO npm dependencies.
src/lib/db/       Dexie schema and the reactive stores
src/lib/          lifecycle, utils, components
src/routes/       Today (/), Stock, Order, Setup + prerendered About/Privacy/Support
```

`src/lib/domain` imports nothing but itself. It is the regression baseline and must survive a UI rewrite. Keep it that way — if a domain function needs the current date, it takes it as an `asOf` argument.

## Changing anything visual

Read [`DESIGN.md`](DESIGN.md) first. It records what the mark means, the minimum sizes, the contrast floors and the two-colourway rule. In particular: the mark's coordinates are duplicated across three icon sources and the lockup builder, status is never signalled by colour alone, and the wordmark exists only inside the lockup files — never rebuild the lockup out of an image plus live text.

## Changing the domain

`APP_ORIGIN` in `src/lib/domain/app-info.ts`, **and** the static files that cannot import a module: the Open Graph tags and the JSON-LD block in `src/app.html`, `static/sitemap.xml`, and the Sitemap line in `static/robots.txt`. The per-page canonical needs no edit — it derives from `APP_ORIGIN` in the layout — and `src/lib/seo.test.ts` fails if the sitemap or robots.txt drift from the module.

Do **not** change `UID_NAMESPACE` in the same file, even though it currently reads `graftful.app`. It namespaces iCalendar UIDs, which only need to be unique and never have to resolve. Change it and every calendar client stops recognising the events it already holds: the next import adds a second set rather than updating the first, so anyone who re-exported would get two reminders for every dose.

## Changing the data model

**If you add, rename, remove or repurpose a field on any type in `src/lib/domain/types.ts`, you must check the backup round trip in the same change.**

The export file is the only copy of a regimen that exists outside one browser profile — clearing site data destroys the original — so a field that does not survive a restore is lost data, not a cosmetic gap. And it fails silently: the value exports correctly and disappears on the way back in. That is precisely what happened to the usual dose times, the language override and the collection note, all of which were written to the file and then thrown away by a restore that rebuilt settings from defaults.

The checklist:

1. Handle the field in **both** directions in `src/lib/domain/transfer.ts` — `buildExport` and `parseImport`.
2. Validate it in `parseImport`. A backup can be hand-edited or truncated, and an invalid time yields a calendar no client can parse while a missing box size divides by zero.
3. Add it to the matching `Record<keyof X, true>` map in `src/lib/domain/transfer.roundtrip.test.ts`, and give it a real value in `FULL_STATE`. An optional field left `undefined` in the fixture cannot distinguish "preserved" from "silently dropped".
4. If it genuinely should not be persisted, list it in `DELIBERATELY_DROPPED` with the reason. Never just leave it out.
5. Bump `EXPORT_VERSION` if the change makes older files unreadable. Restore refuses a file from a _newer_ version rather than half-reading it.

Two things enforce this, so you should find out immediately rather than from a user's lost backup. Adding a field to a model type makes `transfer.roundtrip.test.ts` fail to compile until it is listed. Forgetting it in `transfer.ts` fails the round-trip assertion by name.

The same applies to Dexie: a schema change needs a new `version()` block in `src/lib/db/index.ts`, never an edit to an existing one.

## Invariants

Breaking any of these is a bug even if tests pass.

**Units are the input; milligrams are derived.** Never the reverse. A 7 mg dose from 4 mg capsules would be 1.75 capsules, and capsules do not split. This is also the safer direction regulatorily.

**Stock is a ledger of observations.** `stockOnHand` sums recorded events and deliberately nothing else. `projectedOnHand` derives depletion between observations from the schedule — use that for anything user-facing. A `recount` sets an absolute value and discards what came before; `refill` and `adjustment` are deltas. Clamped at zero at every step, so running empty cannot swallow the next delivery.

**`DoseVersion.activeTo` is exclusive.** The interval is `[activeFrom, activeTo)`. When one dose replaces another, `activeTo` must equal the next `activeFrom`. Setting it to the last day a dose was taken leaves a one-day hole that schedules nothing and consumes nothing. Use `planDoseChange`, which enforces this.

**A zero burn rate means `daysRemaining === null`, not 0.** A retired product with residual stock is not urgent, and neither is an as-needed painkiller.

**Products are retired, not deleted** — unless nothing references them. Check with `productUsage`. Deleting a product that appears in a dose, a stock count or a past order leaves a medication history that no longer adds up. Same principle for therapies via `therapyUsage`.

**Ordering does not change stock; receiving does.** An open order suppresses the alert without touching the ledger.

**Joint replenishment.** One product crossing `minDays` triggers an order that tops _every_ product up to `targetHorizonDays`, rounded up to whole boxes. A by-hand addition on its own must not trigger the full run.

**`packageSize` is the box the pharmacy dispenses**, and users do not know it at setup — they learn it from the pharmacy, sometimes only when the box arrives. Treat it as correctable, never as authoritative.

## Traps that have already cost time

**Read the date from the `today` store, never `todayIso()` at component setup.** bfcache restores the JS heap verbatim, so a frozen constant stays stale forever. See `src/lib/lifecycle.ts`.

**Never add an `unload` or `beforeunload` listener.** It disqualifies the page from bfcache with no error anywhere. There is a test enforcing this. Never serve the document `Cache-Control: no-store` either — see `static/_headers`.

**Do not name a store `state`.** `$state` is a Svelte 5 rune and the store auto-subscription prefix collides with it. The regimen store is called `regimen`.

**Aliased imports cannot carry a `.ts` extension.** `$lib/domain/stock.ts` fails; `./stock.ts` works. `rewriteRelativeImportExtensions` only covers relative paths.

**The service worker must guard `self.__WB_MANIFEST`.** It is only substituted in a real build, and an unguarded `precacheAndRoute(undefined)` throws at module scope — which silently prevents _every_ handler from installing, including push.

**Tests use `node:assert/strict`, not `expect()`.** That keeps `src/lib/domain` free of test-framework imports. Do not add `expect.requireAssertions`; the scaffold set it once and broke the whole suite.

## The seed's numbers are real

The product names in `src/lib/domain/seed.ts` are invented. The numbers are not: they come from a real post-transplant regimen, taken from the spreadsheet this app replaces. That spreadsheet carried a hand-maintained days-of-cover column, which is why `SHEET_JOURS` is verified against years of actual use rather than against the code's own output.

Do not restore provenance details — hospital, dates, whose regimen it is — to this file or anywhere else public. The invented names hide very little on their own: strengths, counts and categories are enough for a clinician to infer the real drugs, so what keeps the seed non-attributable is the absence of anything tying it to a person.

For the same reason the therapy labels are French but deliberately **not** clinical: `Traitement de fond`, `Complément`, `Au besoin`. They replaced `Maintenance A/B/C`, which read as placeholders. Do not "improve" them into real classes — `Anti-Rejet` next to a real strength and a real pill count is enough to name the molecule, which is exactly what the anonymisation removed.

**Never adjust the seed's numbers to make a test pass.** If a figure disagrees, the code is probably wrong — that is how the missing-depletion bug was found. Two of the three most valuable bugs in this project were caught by the seed disagreeing.

The order text format in `order-text.ts` is likewise validated against a real email sent to a real pharmacy. Do not "improve" the line shape without a reason from a real order.

## Style

Prose comments explaining _why_, not _what_. The interesting comments in this codebase record a decision or a trap, not a restatement of the code.

UI copy is plain and unhurried. The audience is people managing a lifelong condition, many of them older; some are newly transplanted and frightened. No exclamation marks, no gamification, no streaks, no cheerfulness about medication. Tap targets never below `--tap` (2.75rem). Sizes in `rem` so OS text scaling works.

UI copy lives in `src/lib/i18n`, one typed catalogue per language, English defining the type. Five languages ship — English, French, German, Portuguese, Italian — and there is no runtime fallback, so a new key must be written in all five or `npm run check` fails. A handful of strings are deliberately left in English with the reason recorded at each site: ledger notes persisted to the database, the two errors thrown by `src/lib/db/index.ts`, the import warnings in `src/lib/domain/transfer.ts`, and the static Open Graph tags in `src/app.html`.
