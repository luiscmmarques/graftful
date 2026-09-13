# Decisions

Rejected features and the reasoning, so the answer is consistent when a user asks for one of them — and so a hospital can see the boundary is deliberate.

## Intended use

> Graftful is a self-management tool for people taking long-term medication. It stores a medication schedule entered by the user, reminds them when a dose is due, tracks how many pills remain, and helps them prepare a pharmacy order. It does not provide medical advice, does not interpret clinical data, and does not determine or suggest any dose.

Everything below follows from that paragraph. Under the MedDO/ODim — which transposed the EU MDR into Swiss law in May 2021 — software that calculates doses or interprets clinical data is a medical device (MDCG 2019-11), Class IIa under Rule 11. That means a notified body and a conformity assessment, which is incompatible with a free app maintained by one person.

## Rejected

**Deriving a dose from clinical data.** No taking a trough level, weight, or creatinine and producing a dose. This is the single clearest device boundary.

**Solving for the pill combination.** Given 14 mg and capsules of 4, 2 and 6 mg, the app could compute 3 × 5 + 1 × 3. It will not. The user enters the combination they were given. There are real clinical reasons a particular combination is chosen, and software choosing what someone swallows is the wrong side of the line.

**Advising on a missed dose.** The obvious feature, and the most likely accidental breach. The app logs it as missed, shows when it was due, and surfaces the transplant centre's contact details. It does not say what to do.

**Drug interaction warnings.** Squarely device territory.

**Interpreting lab values.** Recording a trough level is a diary entry and is fine. Colouring it green or red against a target range, drawing a trend arrow, or badging it "out of range" is interpretation. Raw numbers, no thresholds, no styling that implies a judgement.

**Shipping a drug database with default doses.** Every dose comes from the user, so the app is never the source of a clinical number.

**Generating a taper.** A taper typed in by the user is transcription, and the app following it is fine. Computing one is not.

## Accepted, and why they are not devices

**Days of cover, and order quantities.** Division on numbers the user entered. Inventory arithmetic, not clinical.

**Dose consistency cross-check.** If the user records 14 mg and the composition adds to 17, the app says the two do not match. That compares two user-entered numbers; it does not recommend a dose. It also catches the typo that would otherwise silently corrupt the stock forecast.

**Units-per-dose as the primary input.** The user enters pill counts and the app displays the resulting milligrams, rather than the reverse. Simpler, always physically achievable — a 7 mg dose from 4 mg capsules would be 1.75 capsules, and capsules do not split — and further from anything resembling dose derivation.

## Other decisions

**Licence: AGPL-3.0, with the name as a trademark.** There is no moat in the code — a few hundred lines of inventory arithmetic that anyone could rebuild in a weekend. The defensible assets are lived experience, the transplant-centre relationship, the domain and the name. Closed source would therefore protect very little while costing continuity: people depend on this daily for medication they cannot miss, and if maintenance stops they should not be stranded. AGPL prevents anyone closing a fork; the trademark prevents anyone shipping _as Graftful_.

Note that auditability was **not** the reason. Nobody reads source. What actually lets a non-technical user verify the privacy claim is opening DevTools and watching the Network tab stay silent while they log a dose — and that works under any licence. It is the stronger argument, and it should be on the privacy page.

**Reminders: `.ics` calendar export in v1, Web Push in v2.** No web API can schedule a local notification — Notification Triggers was exactly that and was abandoned after a Chrome origin trial; Periodic Background Sync cannot hit a specific time and is Chromium-only; service worker timers do not survive idle. A generated calendar file with `VALARM` entries fires local alerts forever, offline, on every platform including iOS, with no server and no notification permission. It is not dynamic — a dose change means re-importing — but it means v1 ships with working reminders and no backend, and it remains the fallback for users who never grant push permission.

**Stock is a ledger, not a number.** `refill` and `adjustment` are deltas, `recount` is absolute. When a forecast looks wrong you can see why, which an overwritten field never tells you. It also leaves room for lot and expiry tracking later without a migration.

**Decrement on schedule, not on confirmed intake.** If stock depended on tapping "taken", a forgotten tap would inflate stock and the reorder alert would fire _late_ — and running out is the failure that actually hurts. Erring the other way costs nothing. The intake log is kept separately, for adherence.

**Ordering and receiving are separate events.** Ordering does not change stock; it silences the alert. Without that, the app nags daily about something already requested, and the user learns to ignore notifications.

**A zero burn rate reads as `null`, not zero days.** A retired product holding residual stock is not urgent, and neither is an as-needed painkiller.

**Products are retired, never deleted.** Dropping from 20 mg to 14 mg stopped consumption of the 6 mg capsules but did not invalidate the box already in the cupboard. If the dose goes back up, the stock is still there and still known.

**Push payloads carry no health data.** The server knows only when to ping a subscription. The service worker composes the notification from local data.

**Google Analytics 4.** Rejected. Four reasons, all specific to this app. Loading `gtag.js` sends Google a request carrying the URL, referrer, IP and user agent — and from `graftful.app` alone that is a health inference about the device, made before any event fires, about people who came _because_ the app promised not to do that. It sets a persistent identifier and transfers to a US processor, so it needs a consent banner under the revised FADP, which is an adoption tax on an older cohort and yields worse data because many decline. It has no offline event queue and does not run in a service worker, so in an offline-first app it silently loses events from the most engaged users. And it is roughly 50 KB gzipped — a third of the bundle budget — to collect five integers.

**Cloudflare Web Analytics, and then no analytics at all.** It was the accepted alternative to GA4 — cookieless, no client identifier, no new data processor, no consent banner. The plumbing shipped behind an environment variable, the token was never set, so it never recorded a single pageview. Rather than finish it, the beacon was removed: the privacy note stops needing a caveat, and `script-src` and `connect-src` become `'self'` alone. A script that is never sent beats a script the browser is trusted to block.

One consequence to be aware of before anything is added back: the beacon's CSP allowances were removed along with the plumbing, so `script-src` and `connect-src` are now `'self'` and nothing else. Any third-party script means widening that policy again, which is the specific thing GA4 was rejected for — not the vendor, the request itself.

**Community statistics would be sensitive health data, and a separate matter entirely.** Organ type, years post-transplant and pill counts fall under FADP Art. 5. They would require explicit opt-in and would be submitted only as buckets with no identifier. Currently **deferred**, and framed as an anonymous survey the reader chooses to answer rather than anything read out of their regimen — the day a screen's stored data reaches a network request is the day the privacy note becomes untrue.

**Published figures would suppress cells under 20 contributors.** Switzerland performs a few hundred transplants a year, so organ plus transplant year plus pill count can identify one person. Small-cell suppression is what makes aggregate publication honest rather than a slow leak.

**No raw values leave the device, ever — only buckets.** This also keeps the project outside the Human Research Act, which generally excludes anonymised health data, and therefore clear of needing cantonal ethics approval.

**The Content-Security-Policy is generated, not written by hand.** It began as a literal string in `static/_headers`, which is the natural place to put a header. That policy shipped and broke the app on the live domain: SvelteKit's prerendered pages carry an inline bootstrap script, `script-src 'self'` blocks it, and the result is a site that renders its server-side HTML and then never boots. Nothing about it looks broken from the outside — the markup is right, the styling is right, `curl` returns 200, and Cloudflare's build log reports valid header rules. The policy now comes from `kit.csp` in `vite.config.ts`, so the hashes always describe the bundle that actually shipped. A fixed hash was never an option: the inline script embeds a per-build identifier and changes every build.

The reason this is a decision and not a fix is where the policy lives. `_headers` is read only by Cloudflare, so under `vite preview` there was no policy at all and no test could have caught the breakage. SvelteKit writes the generated policy into a `<meta>` tag, which browsers enforce wherever the file is served — so the real policy is now exercised by the end-to-end suite. Prefer the mechanism that can be tested locally over the one that is merely correct in production. `frame-ancestors` stays an HTTP header because browsers ignore it in a `<meta>` tag.

**HTML documents are served `no-transform`, accepting uncompressed HTML.** Cloudflare's Bot Fight Mode enables JavaScript Detections, which injects an inline script and a hidden iframe into every HTML response. Cloudflare's documentation states it "cannot be disabled" on that plan and is "not supported with nonce set via `<meta>` tags", which is precisely how this app's policy is delivered — so the injected script is blocked by the CSP and logs a violation on every page load. Turning Bot Fight Mode off does not stop the injection; that is a known and widely reported behaviour. The documented escape is `Cache-Control: no-transform`, which makes Cloudflare skip injection.

The cost is real and was measured: `no-transform` also disables compression for those responses, so the eight prerendered shells transfer as 130.6 KiB instead of 37.1 KiB — about 94 KiB more on first visit. It was accepted because the cost is one-off, arriving while the app is already downloading its assets and never again once the service worker holds them, whereas the alternative is a permanent console violation on every page load and a fingerprinting bootstrap shipped into every page of an app whose entire claim is that nothing leaves the device. Relying on the browser to block a script is a weaker position than the script never being sent. Note `no-transform` is not `no-store`: caching semantics and bfcache eligibility are unaffected.

**Four of the five message catalogues load on demand, and a first visit in French is briefly in English.** Static imports of all five put every language in one chunk with Dexie: 99 KB gzipped, 64% of the page, on the critical path of every route, and four fifths of it text that visitor would never read. Since every prerendered document says only "Loading…" — the regimen is in IndexedDB — that chunk gates the largest contentful paint everywhere, so it was the only lever available. Splitting it took a first load from 154 KB to 105 KB, the one critical chunk from 99 KB gzipped to 47 KB, and the largest contentful paint from 2.1 s to 1.8–2.0 s on every screen.

The accepted cost is the honest part. A French visitor's first load shows the English shell for about one extra round trip. That shell was already English, because the prerender runs with no browser and resolves to `en`, so this lengthens an existing wrong-language window rather than introducing one — and it happens once: the worker precaches all four catalogues, so every later visit resolves the import from cache with no delay and changing language still works with no network at all. English stays static because it defines the `Messages` type, it is the fallback for unsupported languages, and it is what the prerendered documents contain, so making it lazy would add a round trip for the one catalogue certain to be needed.

The rejected alternative was a post-build script that reads the Vite manifest and injects a `<link rel="modulepreload">` chosen by an inline script from `navigator.language`, removing even that one round trip. It was turned down for where the complexity lands: rewriting all ten prerendered documents after the build, plus an inline script the generated CSP would have to hash — more moving parts in the exact place where a mistake stops the app booting, for one round trip on one visit. What the split must never do is flash English mid-session; `src/lib/i18n/index.ts` holds the previous catalogue until the new one resolves.
