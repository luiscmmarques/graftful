# Hosting: Cloudflare vs AWS

Public list prices and documented free tiers, checked August 2026. Verify before relying on the figures; the conclusion is robust, the third decimal place is not.

**This compares the v2 architecture, not what runs today.** v1 has no server at all: no Worker, no cron, no D1, no push. Its entire hosting cost is a Pages project on the free tier plus the domain. The Workers and D1 rows below exist because push reminders are the next major piece of work and the platform choice had to be made before building it — not because anything is currently billed for them.

Assumptions: bundle ~1.5 MB, two reminders per user per day, ~10 metric events per user per month, production plus preview.

## The design change that flattens the comparison

Two decisions remove almost all the recurring cost on either platform.

**No payload means no encryption.** RFC 8030 permits a push with no body. Since the service worker composes the notification from local IndexedDB, there is no payload — so RFC 8291 AES128GCM encryption is unnecessary and only the VAPID ES256 JWT remains. That is native Web Crypto on both runtimes, with no npm dependency at all.

**No write per send.** Due-ness is derived from the stored reminder times and timezone against the cron tick, so the sweep never writes a "last sent" row. The tier is read-only in steady state. This was the dominant DynamoDB cost in the earlier AWS estimate, and it is the only hard free-tier ceiling on Cloudflare.

## Cloudflare

| Item | Free tier | Usage at 10 000 users | Cost |
| --- | --- | --- | --- |
| Pages — static hosting | unlimited requests and bandwidth | ~30 GB/mo | $0.00 |
| Pages — preview deploys | per-branch, included | 1 branch | $0.00 |
| Workers — requests | 100 000/day | ~300/day | $0.00 |
| Workers — Cron Triggers | included | 288/day (5-min sweep) | $0.00 |
| D1 — rows read | 5 M/day | ~20 000/day | $0.00 |
| D1 — rows written | 100 000/day | ~50/day (subscribe only) | $0.00 |
| D1 — storage | 5 GB | ~10 MB | $0.00 |
| **Total** |  |  | **$0.00** |

Headroom is large. The binding limit would be Workers requests at 100 000/day, and the sweep plus registrations uses a fraction of a percent of it. Note that when a D1 daily limit _is_ hit the API returns errors — reminders would stop, not degrade — so the read-only design matters for reliability, not just cost. Workers Paid at $5/month removes the ceilings if it ever comes to that.

## AWS

| Item                 | Usage at 10 000 users                         | Cost    |
| -------------------- | --------------------------------------------- | ------- |
| Route 53 hosted zone | 1 zone                                        | $0.50   |
| CloudFront           | ~30 GB/mo, inside the 1 TB always-free tier   | $0.00   |
| S3 storage           | ~3 MB across two buckets                      | ~$0.00  |
| Lambda               | 8 640 sweeps/mo, ~20 000 GB-s of 400 000 free | $0.00   |
| DynamoDB             | read-only in steady state                     | ~$0.05  |
| SSM Parameter Store  | VAPID key, standard tier                      | $0.00   |
| CloudWatch Logs      | 14-day retention                              | ~$0.50  |
| **Total**            |                                               | **~$1** |

Down from my earlier ~$4 estimate, because the per-send DynamoDB write is gone.

## Domain

`.app` renewal is roughly $15–20/year either way, about $1.50/month amortised. Cloudflare Registrar sells at wholesale cost and is usually the cheapest, but it requires the domain to use Cloudflare DNS — which is free, and fine even if the app is hosted on AWS.

## Where each genuinely wins

**Cloudflare**

- Far smaller operational surface: Pages + one Worker + D1, against S3 + CloudFront + OAC + ACM-in-us-east-1 + Lambda + Function URL + DynamoDB + EventBridge + Parameter Store + Route 53.
- Preview deployments are built in, per branch, with a custom domain attachable. On AWS this is a second bucket, a second distribution and invalidation logic.
- A `_headers` file for per-file Cache-Control, versus cache policies or a CloudFront Function. This is the single fiddliest part of shipping a PWA and Cloudflare makes it a four-line file.
- Apex domains work natively via CNAME flattening.
- Bandwidth is unmetered, so there is no egress cliff at any scale, ever.
- Durable Object Alarms are available on the free plan and would give exact per-user scheduling instead of a 5-minute sweep, if precision ever matters.

**AWS**

- **Swiss data residency.** `eu-central-2` is Zurich; Cloudflare's free plan offers a Western Europe location hint for D1 but no Switzerland option, and Data Localization Suite is enterprise-only.
- **GitHub OIDC federation**, so no long-lived deploy credential exists. Cloudflare needs a scoped API token stored in GitHub secrets.
- **Existing expertise.** For an app one person must keep running for years, the maintainer being fluent in the platform is a real operational property.
- More mature IaC (CDK/Terraform) than `wrangler.toml` plus some Terraform.

## Correcting the residency argument

I previously treated Swiss residency as decisive. On inspection it is weaker than I made it sound. What leaves the device is a push endpoint URL, a reminder time, and a timezone — no drug names, no doses, no identity, no account. Calling that health data that must remain in Switzerland is a stretch; a reminder time is a faint signal at most. Cloudflare being US-headquartered is the more substantive point, though under the revised FADP the EU sits on the Swiss adequacy list.

The stronger and more honest privacy claim is "almost nothing leaves your phone", and that holds on either platform.

## Recommendation

**Cloudflare**, on operational surface rather than cost — the $1/month difference is irrelevant, but roughly a third the number of moving parts is not, for a project maintained by one person in evenings. The bodyless-push simplification also lands more cleanly on Workers, where Web Crypto is native and no Node shim is involved.

The real counterargument is expertise: if wrangler and D1 mean two evenings of learning while CDK is muscle memory, that cost is paid once but the fluency pays back for years. That is a judgement call about the maintainer, not the architecture, and it belongs to whoever is on call at 07:30 when the reminders do not fire.
