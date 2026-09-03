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
	import { t } from '$lib/i18n';
</script>

<svelte:head>
	<title>{$t.roadmap.title} · Graftful</title>
	<meta name="description" content={$t.roadmap.metaDescription} />
</svelte:head>

<h2>{$t.roadmap.title}</h2>

<div class="card">
	<p class="muted">
		{$t.roadmap.noDates}
	</p>
</div>

<div class="card">
	<h3>{$t.roadmap.workingTitle}</h3>
	<ul class="done">
		{#each $t.roadmap.working as item (item)}
			<li>{item}</li>
		{/each}
	</ul>
</div>

<div class="card">
	<h3>{$t.roadmap.remindersTitle}</h3>
	<p>
		{$t.roadmap.reminders1}
	</p>
	<p class="muted">
		{$t.roadmap.reminders2}
	</p>
	<p class="muted">
		{$t.roadmap.reminders3}
	</p>
</div>

<div class="card">
	<h3>{$t.roadmap.consultationsTitle}</h3>
	<p>
		{$t.roadmap.consultations1}
	</p>
	<p class="muted">
		{$t.roadmap.consultations2}
	</p>
	<p class="muted">
		{$t.roadmap.consultations3}
	</p>
	<p class="muted">
		{$t.roadmap.consultations4}
	</p>
</div>

<div class="card">
	<h3>{$t.roadmap.blogTitle}</h3>
	<p>
		{$t.roadmap.blog1}
	</p>
	<p class="muted">
		{$t.roadmap.blog2}
	</p>
	<p class="muted">
		{$t.roadmap.blog3}
	</p>
</div>

<div class="card">
	<h3>{$t.roadmap.thenTitle}</h3>
	<ul>
		<li>
			<strong>{$t.roadmap.missedLead}</strong>
			{$t.roadmap.missedBody}
		</li>
		<li>
			<strong>{$t.roadmap.languagesLead}</strong>
			{$t.roadmap.languagesBody}
		</li>
		<li>
			<strong>{$t.roadmap.expiryLead}</strong>
			{$t.roadmap.expiryBody}
		</li>
		<li>
			<strong>{$t.roadmap.resultsLead}</strong>
			{$t.roadmap.resultsBody}
		</li>
		<li>
			<strong>{$t.roadmap.travelLead}</strong>
			{$t.roadmap.travelBody}
		</li>
	</ul>
</div>

<div class="card">
	<h3>{$t.roadmap.consideringTitle}</h3>
	<ul>
		<li>
			<strong>{$t.roadmap.surveyLead}</strong>
			{$t.roadmap.surveyBody}
		</li>
		<li>
			<strong>{$t.roadmap.carerLead}</strong>
			{$t.roadmap.carerBody}
		</li>
	</ul>
</div>

<div class="card">
	<h3>{$t.roadmap.neverTitle}</h3>
	<p class="muted">
		{$t.roadmap.neverIntro}
	</p>
	<ul>
		{#each $t.roadmap.never as item (item)}
			<li>{item}</li>
		{/each}
	</ul>
	<p class="muted">
		<a href="/about">{$t.roadmap.neverMoreLink}</a>{$t.roadmap.neverMoreAfter}
	</p>
</div>

<div class="card">
	<h3>{$t.roadmap.missingTitle}</h3>
	<p class="muted">
		{$t.roadmap.missing1}
	</p>
	<p>
		<a href={ideaFormUrl}>{$t.roadmap.suggestLink}</a>
		{$t.roadmap.missingOrEmail} <a href={ideaMailUrl}>{EMAIL.ideas}</a>.
		{$t.roadmap.missingBugBefore}
		<a href={bugFormUrl}>{$t.roadmap.bugLink}</a>
		{$t.roadmap.missingBugAfter}
	</p>
	<p class="muted">
		{$t.roadmap.missingPrivacyBefore}
		<a href="/support">{$t.roadmap.supportLink}</a>{$t.roadmap.missingPrivacyAfter}
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
