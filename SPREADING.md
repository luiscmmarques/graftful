# Spreading the word

How to get Graftful in front of the people it was built for, without it feeling like marketing. This is a free tool for a small group with a specific, permanent problem — the audience is narrow, and reaching it is about credibility rather than reach.

The one rule underneath everything: **never imply clinical authority.** Graftful is a tracking tool made by a patient. The moment it sounds like advice, a clinician is right to distrust it, and they will be right to.

## Who actually matters

In rough order of usefulness.

**Transplant coordinators.** The single highest-value contact. They own the adherence conversation, they see every recipient repeatedly, and they are usually glad of something concrete to hand over. They are also the people who will tell you honestly if something about the app is wrong. Go to them, not to reception, and not to the medical director first.

**Other recipients, especially recent ones.** The first months after a transplant are when this helps most and when nobody has the energy to search for a tool. A recipient who was in that position two years ago is far more persuasive than any description of the app.

**Pharmacists.** They live with the consequences of bad reorder timing, and they receive the orders Graftful generates. A pharmacist who has seen the generated email is a good advocate, because they can vouch that it is actually usable.

**GPs.** Especially in a small town, where your GP sees you regularly and knows your history. A GP who understands the tool can mention it to other transplant patients.

**Patient associations and online groups.** Wider reach, less trust. Worth doing after a handful of real users, so there is something to point at other than a claim.

## What to say

Lead with the problem, not the software. Everyone who has been through this recognises the problem instantly, and nobody recognises a feature list.

> I kept a spreadsheet for years to work out when to reorder my immunosuppressants, because nothing else did it properly. I rebuilt it as a free app. It has no account, no adverts, and nothing about your health leaves your phone.

Then stop. Let them ask.

Three points answer most of what follows:

- **Free, no account, no adverts.** Not a trial, not freemium.
- **Nothing leaves the device.** They can verify it themselves with the browser's network tab. That is on the privacy page for exactly this reason.
- **It does not give advice.** It will not calculate a dose, decide which pills make up one, or tell you what to do about a missed dose. Say this early to a clinician — it is the thing they are worried about, and volunteering it is far better than being asked.

## What not to do

- **Do not overstate the audience.** "I built this for myself and a few other people" is true and disarming. "A platform for transplant patients" is neither.
- **Do not ask for money in a clinical setting.** The support page is deliberately about telling someone rather than donating.
- **Do not print anything that looks like a hospital document.** No caduceus, no white coats, no logos you do not own. A flyer that looks official but is not will get you removed from the building, correctly.
- **Do not name real medicines in examples.** The app's own example uses invented names, and materials should too. A screenshot showing real drug names invites people to read it as a template.
- **Do not use a patient's data in a screenshot.** Load the example regimen instead.

## The flyer

A single sheet, one QR code, no gloss.

Content that works:

- What it does, in one sentence, in the patient's language
- Free · no account · works offline · nothing leaves your phone
- Does not give medical advice
- The QR code, large
- `graftful.app`
- One line saying who made it and that they are a recipient too
- `hi@graftful.app`, so a coordinator or pharmacist has somewhere to reply

Ask the coordinators before leaving anything anywhere. A flyer that appears without permission is a flyer that gets binned, and it burns the relationship.

Print in the local language. In Valais that means French; in a German-speaking canton, German.

## Where links come from

The app tags a few entry points so it is possible to tell what is working, without tracking anyone:

| Source              | Link                      |
| ------------------- | ------------------------- |
| Flyer / QR code     | `graftful.app/?src=flyer` |
| Calendar reminders  | `graftful.app/?src=ics`   |
| Coordinator handout | `graftful.app/?src=cto`   |
| Online groups       | `graftful.app/?src=forum` |

These are page views, nothing more — no cookies, no identifiers, no profile. The calendar one exists because a shared calendar entry is a genuinely likely way this spreads, and it would be useful to know that.

One caveat, recorded rather than glossed over: Cloudflare Web Analytics reports pageviews per **path**, and an arbitrary query string may not be broken out. `STACK.md` therefore prefers distinct paths (`/flyer`, `/cto`) over `?src=`. The `?src=` links above are still worth keeping — they are self-explanatory to a human reading a calendar entry a year later — but do not plan on them producing a clean count until the paths exist.

## Pace

Do not launch. Give it to two or three people who will tell you the truth, fix what they find, and only then widen. A medication tool that loses somebody's data, or shows the wrong dose, does real harm — and word travels faster in a patient community than in any market.
