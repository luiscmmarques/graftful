# Deploying Graftful

Static output on Cloudflare Pages, deployed from GitHub. Merges to `main` go live; every other branch gets a preview URL. This file is the runbook and the reasoning.

## The flow

```
branch push   ->  Cloudflare Pages preview   <branch>.graftful.pages.dev
pull request  ->  GitHub Actions verify  +  Pages preview link commented on the PR
merge to main ->  GitHub Actions verify  ->  Cloudflare Pages production   graftful.app
```

Note what is deliberately absent from the first line: **a branch push runs no CI.** `ci.yml` triggers on `pull_request` and on pushes to `main` only, so the checks run once per pull request rather than twice. The alternative — `push: branches: ['**']` — gives feedback before a PR exists at the cost of every PR running the whole gate twice, once for the branch push and once for the PR. Open the PR early and the difference disappears.

Previews are native Cloudflare Pages behaviour, not something built here: with the Git integration every push to a non-production branch deploys to `<branch>.<project>.pages.dev`, and every PR gets its preview link as a comment. Production deploys only from `main`.

## The flow, day to day

`main` is protected and never pushed to directly. All work rides a branch named for what it is and merges through a pull request once CI is green:

```sh
git switch -c fix/stale-days-remaining     # or feature/push-reminders
# ... work, commit freely ...
git push -u origin fix/stale-days-remaining
# open the PR; Cloudflare Pages comments a preview URL on it
# CI (verify) must pass; then Squash and merge
git switch main && git pull --ff-only
git branch -d fix/stale-days-remaining
git push origin --delete fix/stale-days-remaining
```

- `feature/<name>` for new behaviour, `fix/<name>` for repairs. Nothing else.
- **Squash and merge**, always: `main` stays a clean line of releases, one commit per change, and the branch's work-in-progress commits stay on the branch.
- Delete the branch after merging, locally and on the remote.
- Commit subjects carry a bracketed area — `(feat)`, `(fix)`, `(perf)`, `(sec)`, `(seo)`, `(ci)` — so `git log --oneline` reads as a changelog. This differs from the sibling projects on purpose; it costs nothing and answers "what kind of change was that" without opening anything.
- History is public. Never amend or force-push `main`; corrections are new commits on a `fix/` branch.

No required reviews: one maintainer would deadlock on themselves. The gate is the CI run, force pushes and branch deletion are blocked, and the rule binds admins too.

### Two traps in this flow

**Squash merges make SHA-based merge checks lie.** After a squash, the commit on `main` is a new object, so the branch's SHA never appears in `main`'s history. `git log origin/<branch> ^origin/main` lists the branch commit as unmerged and `git branch -d` warns, both of which look like unmerged work and are not. Confirm by content — the PR shows as merged, or the file on `main` carries the change — rather than by revision.

**Do not require the `headers` check.** `.github/workflows/headers.yml` runs on a schedule and on manual dispatch, never on a pull request. Added as a required status check it would leave every PR waiting forever for a check that cannot report. The required check is `verify`, and optionally `Cloudflare Pages` if a failed preview build should block a merge.

### The pre-commit hook takes over `core.hooksPath`

`npm install` runs `git config core.hooksPath .githooks`, which is what makes the personal-data scan automatic rather than a step every clone has to remember. Git supports exactly one hooks directory, and a repository-local setting wins over a global or system-wide one — so on a machine that configures `core.hooksPath` centrally, this repository's hook replaces that one **for this repository only** rather than running alongside it.

That is worth knowing on a managed machine, where the central hooks may be a corporate secret-scanning control. Nothing here can chain to them automatically without knowing what they are: if both are wanted, `.githooks/pre-commit` has to invoke the other directory's `pre-commit` explicitly before running the scan, and the same applies to `pre-push`. Recorded rather than solved, because the right answer depends on the machine.

## Branch protection

`main` requires the `verify` job in `.github/workflows/ci.yml`. The job id **is** the status check name GitHub offers, which is why it is `verify` here and in the sibling projects: one rule reads the same everywhere. Renaming that job orphans the rule — a required check is stored as a plain string, so GitHub then waits on a check that no longer reports and every PR blocks until the rule is edited by hand.

```sh
gh api -X PUT repos/{owner}/graftful/branches/main/protection \
  -f 'required_status_checks[strict]=true' \
  -f 'required_status_checks[contexts][]=verify' \
  -F 'enforce_admins=true' \
  -F 'allow_force_pushes=false' -F 'allow_deletions=false' \
  -F 'required_pull_request_reviews=null' -F 'restrictions=null'
```

A check only appears in the dashboard's dropdown once GitHub has seen it report. Because a branch push runs no CI here, `verify` becomes selectable only after the first pull request runs it — open the PR, let it run, then save the rule.

## Cloudflare Pages project

| Field                  | Value                            |
| ---------------------- | -------------------------------- |
| Production branch      | `main`                           |
| Build command          | `npm run build`                  |
| Build output directory | `build`                          |
| Environment variable   | `NODE_VERSION` matching `.nvmrc` |

`.nvmrc` is the single source of the runtime version, so CI and Pages cannot disagree about it.

**Caching → Browser Cache TTL: Respect Existing Headers.** This one is load-bearing and invisible from the repository. `static/_headers` is the whole caching design: `no-cache` on documents so a deploy takes effect immediately, `immutable` on hashed assets so nothing is refetched. A fixed TTL here overrides both directions — documents get held for hours while each one references content-hashed filenames that stop existing after the next deploy, which breaks the app for returning visitors, and hashed assets lose the year-long lifetime that keeps deploys cheap. `scripts/check-live-headers.mjs` asserts both halves against the live domain.

**Do not enable Cloudflare Web Analytics.** Its beacon is blocked by the generated CSP by design, the privacy page promises no analytics, and `e2e/app.spec.ts` fails if any request reaches a third party. Edge request counts in the dashboard cost nothing and betray nobody. The reasoning is in `DECISIONS.md`.

Bot Fight Mode is tolerable because `_headers` sets `no-transform` on every document, which is the documented way to keep JavaScript Detections from injecting a script the CSP then blocks on every page load.

### A dashboard setting that currently overrides the repository

The **"Add security headers" managed transform** is enabled on the zone, and it overwrites two values from `static/_headers` however that file is written: production answers `X-Frame-Options: SAMEORIGIN` rather than the `DENY` the file asks for, and `Referrer-Policy: same-origin` rather than `strict-origin-when-cross-origin`. Neither is dangerous — `frame-ancestors 'none'` is what actually blocks framing and takes precedence in current browsers, and `same-origin` is the stricter referrer of the two — but the repository asserted one thing while the live domain did another, and no test over the repository could have noticed. Turn the transform off and the file's values take effect with no code change.

This is why `.github/workflows/headers.yml` exists: it checks the response rather than the file, weekly and on demand, and is the only thing that can see a dashboard change made months from now.

## DNS

| Setting | State | Why |
| --- | --- | --- |
| SPF (TXT) | `v=spf1 include:spf.infomaniak.ch -all` — **done** | Mail is Infomaniak-hosted; `-all` means nobody else can forge mail from the domain. |
| DMARC (TXT) | `v=DMARC1; p=reject; rua=...` — **done** | Rejects anything SPF and DKIM cannot vouch for. |
| DKIM | Delegated: `_domainkey` NS → Infomaniak — **done** | Selectors resolve at Infomaniak's nameservers rather than being copied here. |
| DNSSEC | **Outstanding** | Signed answers; forged-response cache poisoning dies there. The `_domainkey` delegation becomes an insecure delegation, which resolvers treat as insecure rather than bogus, so mail keeps working. |
| CAA | **Outstanding** | See the warning below before adding it. |
| `www` | **Outstanding** — no record at all | People type it, and HSTS `includeSubDomains` means a browser that has seen the apex forces HTTPS on `www` and gets a hard DNS failure. Add `www` as a proxied CNAME to the apex plus a 301 redirect rule, so one host stays canonical. |
| Proxy status | Proxied for the site; `DNS only` for MX and SRV | The mail records must resolve to Infomaniak directly. `autoconfig` and `autodiscover` are proxied and work — they 301 to Infomaniak and return the expected XML — so leave them alone. |

**CAA needs care, because getting it wrong takes the site down at renewal.** The live certificate is issued by **Google Trust Services** (`pki.goog`), not Let's Encrypt, and Cloudflare's documentation is explicit that a CAA record does not influence which CA Cloudflare chooses. The issuer list quoted in most guides — `comodoca.com`, `digicert.com`, `letsencrypt.org` — is stale and omits the CA actually in use, so copying it invites a silent renewal failure. Cloudflare also manages CAA implicitly while no CAA record exists; adding one takes that responsibility on. If adding it, add a superset through Cloudflare's DNS app so it appends its own issuers, allow both `issue` and `issuewild` for the same set even though certificates are currently per-hostname rather than wildcard, and confirm a renewal succeeds well before the current certificate expires.

## What already ships in the repo

- `static/_headers`: immutable caching for hashed assets, `no-cache` and `no-transform` documents, a `Permissions-Policy` refusing every capability the app never uses, and `Cross-Origin-Opener-Policy`. Guarded by `src/lib/headers.test.ts`.
- The Content-Security-Policy is generated in `vite.config.ts`, not written by hand, so its hashes describe the bundle that actually shipped. `connect-src` is `'self'` and nothing else can be reached.
- `.github/workflows/ci.yml`: prettier, svelte-check, unit tests, build, Playwright including the offline suite, and a check that the committed lockup matches its source. This is the merge gate.
- `.github/workflows/headers.yml`: the weekly check against the live domain.
- `.githooks/pre-commit`: the personal-data scan, installed by `npm install`.

## Releases

"Merge to main = release" is the whole ceremony. Pages keeps every deployment immutable, so rollback is one click on a previous deployment — which is the reason no tagging scheme is needed. If tagged GitHub Releases become worth having, cut them from `main` after the fact; nothing in the deploy path depends on tags.
