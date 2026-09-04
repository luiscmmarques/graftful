# Running costs

Public list prices and documented free tiers, checked August 2026. Verify before relying on them.

**v1 costs nothing to run.** There is no server at all — no Worker, no cron, no D1, no push — so hosting is a Pages project on the free tier. The only recurring cost is the domain: `.app` renews at roughly $15–20/year, about $1.50/month amortised.

Cloudflare was chosen for operational surface rather than price. The alternatives considered are not recorded here; the decision is made and the app is live on it.

## v2, when push exists

The figures below are for the reminder tier that does not exist yet, at 10 000 users. They are here because the platform had to be chosen before building it.

| Item                    | Free tier   | Usage at 10 000 users | Cost      |
| ----------------------- | ----------- | --------------------- | --------- |
| Pages — static hosting  | unlimited   | ~30 GB/mo             | $0.00     |
| Workers — requests      | 100 000/day | ~300/day              | $0.00     |
| Workers — Cron Triggers | included    | 288/day (5-min sweep) | $0.00     |
| D1 — rows read          | 5 M/day     | ~20 000/day           | $0.00     |
| D1 — rows written       | 100 000/day | ~50/day               | $0.00     |
| D1 — storage            | 5 GB        | ~10 MB                | $0.00     |
| **Total**               |             |                       | **$0.00** |

Two design decisions are what keep it there, and both are recorded in `TODO.md` §3:

- **No payload means no encryption.** A bodyless push needs only the VAPID JWT, which is native Web Crypto — so no `web-push` dependency on any runtime.
- **No write per send.** Due-ness is derived from the stored reminder times and timezone against the cron tick, so the sweep never writes a "last sent" row and the tier is read-only in steady state.

That second one matters for reliability rather than cost, which is the part worth remembering: when a D1 daily limit is hit the API returns **errors**, so reminders would stop rather than degrade. Workers Paid at $5/month removes the ceilings if it ever comes to that.
