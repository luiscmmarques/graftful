<script lang="ts">
	/*
	 * Public roadmap.
	 *
	 * Written for users rather than as a task list — TODO.md is the task list. Two things
	 * it deliberately does: names what will never be built and why, so nobody waits for a
	 * feature that is not coming; and avoids dates, because this is maintained by one
	 * person around a full-time job and a promised date would be a lie.
	 */
	import { bugFormUrl, EMAIL, ideaFormUrl, ideaMailUrl } from '$lib/contact';
</script>

<svelte:head>
	<title>Roadmap · Graftful</title>
	<meta name="description" content="What is being worked on next, and what will never be built." />
</svelte:head>

<h2>Roadmap</h2>

<div class="card">
	<p class="muted">
		No dates. This is built by one person in evenings, and a date would be a guess dressed up as a
		promise. The order below is roughly the order of work.
	</p>
</div>

<div class="card">
	<h3>Working now</h3>
	<ul class="done">
		<li>Your schedule, with multi-pill doses, half tablets and as-needed medication</li>
		<li>Days of cover per product, from what you actually count into the box</li>
		<li>Reorder alerts, and a pharmacy order you can copy or email</li>
		<li>Dose changes that keep your history rather than overwriting it</li>
		<li>Calendar reminders you export once and import into your phone</li>
		<li>Backup and restore as a file you hold</li>
		<li>Works offline, with nothing about your health leaving the device</li>
	</ul>
</div>

<div class="card">
	<h3>Next: proper reminders</h3>
	<p>
		The calendar export works and needs no server, but it has one real flaw: change a dose and the
		calendar is silently wrong until you export it again.
	</p>
	<p class="muted">
		Push notifications fix that, and add the thing a calendar cannot: a <strong>Taken</strong> button
		on the notification itself, so recording a dose does not require opening the app. That is also the
		only honest way to track adherence: asking someone to open an app to confirm they took a pill mostly
		measures who remembers to open apps.
	</p>
	<p class="muted">
		It will be built so the server learns nothing. The notification carries no content: the server
		knows only <em>when</em> to ping your device, and the words are assembled on the phone from data that
		never left it.
	</p>
</div>

<div class="card">
	<h3>Next: your consultations</h3>
	<p>
		A date and a time for your next check-up, with a countdown next to the day counter you already
		see, and a reminder in the same calendar export as your doses.
	</p>
	<p class="muted">
		Why this deserves to be a proper feature rather than a note in a corner: check-ups do not stop.
		Mine are still roughly every three months, more than ten years on. Software written for
		transplant recipients tends to assume an intense first year and then nothing, which is not how
		any of this works. The appointments, the blood tests and the pills all carry on indefinitely.
	</p>
	<p class="muted">
		It should also change how ordering works. What you really want is enough medication to last
		until the next consultation, not an arbitrary sixty days. Once Graftful knows that date it can
		use it as the horizon, instead of a number you had to invent.
	</p>
	<p class="muted">
		Recording a date is a diary entry, so this stays well clear of the line described below.
		Graftful will not suggest when a consultation ought to be, nor read anything into how far apart
		yours are.
	</p>
</div>

<div class="card">
	<h3>Then: a blog</h3>
	<p>
		Somewhere to write things down properly. The first post is already decided:
		<strong>a step-by-step guide to using Graftful</strong>: setting up your products, entering a
		dose made of several pills, counting your stock, and getting your first pharmacy order out.
	</p>
	<p class="muted">
		The app tries to explain itself, but some of this is genuinely fiddly the first time, and
		screenshots do in one glance what a paragraph of help text does badly. It would also give
		transplant coordinators something to point at that is not a login page.
	</p>
	<p class="muted">
		Likely posts after that: what the arithmetic actually is and why the app never chooses a dose;
		how the reminders work without a server; and what ten years of taking the same pills twice a day
		teaches you about the parts that are easy to get wrong.
	</p>
</div>

<div class="card">
	<h3>Then</h3>
	<ul>
		<li>
			<strong>Missed doses.</strong> Recording that one was missed, and when it was due. Not what to do
			about it. See below.
		</li>
		<li>
			<strong>The rest of the app in your language.</strong> English, French, German and Portuguese already
			cover the daily screens, the pharmacy order and the calendar file. The Order and Setup screens,
			and pages like this one, are still English. Translations are welcome and go further than money.
		</li>
		<li>
			<strong>Expiry dates and batch numbers.</strong> Useful when a box has been in a cupboard for a
			year, and when there is a recall.
		</li>
		<li>
			<strong>Somewhere for your results.</strong> A place to write down a blood result and keep it, as
			a diary, with no interpretation attached to it.
		</li>
		<li>
			<strong>Travel.</strong> Working out how much to carry for a trip, and what a time-zone change does
			to a twelve-hour dosing interval.
		</li>
	</ul>
</div>

<div class="card">
	<h3>Being considered</h3>
	<ul>
		<li>
			<strong>An anonymous survey.</strong> Whether people find this useful, and what it is missing. A
			survey you choose to answer, not statistics collected quietly in the background, which would contradict
			everything on the privacy page.
		</li>
		<li>
			<strong>Sharing with a carer.</strong> Genuinely difficult without a server that holds your data,
			which is the one thing this app does not do. No good answer yet.
		</li>
	</ul>
</div>

<div class="card">
	<h3>Never</h3>
	<p class="muted">
		These are not on a waiting list. They are the line between a tracking tool and a regulated
		medical device, and they are also decisions that belong to your prescriber.
	</p>
	<ul>
		<li>Working out a dose from a blood level, your weight, or any test result</li>
		<li>Deciding which pills make up a dose you were given</li>
		<li>Telling you what to do about a missed dose</li>
		<li>Interaction warnings</li>
		<li>Judging a lab result: no thresholds, no trend arrows, no red numbers</li>
	</ul>
	<p class="muted">
		<a href="/about">More on why</a>, including the exact wording of what this app is for.
	</p>
</div>

<div class="card">
	<h3>Something missing?</h3>
	<p class="muted">
		The most useful thing you can send me is the thing that annoyed you, or the case your regimen
		has that this app handles badly. Nobody's regimen is typical, and mine is only one of them.
	</p>
	<p>
		<a href={ideaFormUrl}>Suggest it on GitHub</a>
		or email <a href={ideaMailUrl}>{EMAIL.ideas}</a>. If something is broken rather than missing,
		<a href={bugFormUrl}>report a bug</a> instead.
	</p>
	<p class="muted">
		GitHub issues are public, so please leave out medicine names, doses, transplant dates and
		anything else from your own regimen; email if it cannot be described without them. There are
		other ways to help on <a href="/support">the support page</a>, including fixing a translation.
	</p>
</div>

<style>
	ul {
		margin: 0.5rem 0 0.75rem;
		padding-left: 1.125rem;
	}

	li {
		margin-bottom: 0.375rem;
	}

	.done li::marker {
		color: var(--accent);
	}

	p {
		margin: 0 0 0.625rem;
	}

	a {
		color: var(--accent);
	}
</style>
