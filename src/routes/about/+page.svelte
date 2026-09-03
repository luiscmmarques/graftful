<script lang="ts">
	// Prerendered, unlike the app itself. Someone deciding whether to trust this —
	// or a clinician being shown it in a consultation — should be able to read what
	// it is before any JavaScript runs.
	//
	// The prerendered copy is English, because there is no request to read a language
	// from at build time. It is replaced on hydration by whatever the reader's browser
	// or their choice in Setup asks for.
	import { t } from '$lib/i18n';
	import { REPO_URL } from '$lib/contact';
</script>

<svelte:head>
	<title>{$t.about.title}</title>
	<meta name="description" content={$t.about.metaDescription} />
</svelte:head>

<h2>{$t.about.title}</h2>

<div class="card">
	<p>
		{$t.about.intro}
	</p>
	<p class="muted">
		{$t.about.introNote}
	</p>
</div>

<div class="card">
	<h3>{$t.about.purposeTitle}</h3>
	<blockquote>
		{$t.about.purposeStatement}
	</blockquote>
</div>

<div class="card">
	<h3>{$t.about.notTitle}</h3>
	<p class="muted">
		{$t.about.notIntro}
	</p>
	<ul>
		<li><strong>{$t.about.notDoseLead}</strong> {$t.about.notDoseBody}</li>
		<li>
			<strong>{$t.about.notCombinationLead}</strong>
			{$t.about.notCombinationBody}
		</li>
		<li>
			<strong>{$t.about.notMissedDoseLead}</strong>
			{$t.about.notMissedDoseBody}
		</li>
		<li><strong>{$t.about.notInteractions}</strong></li>
		<li>
			<strong>{$t.about.notLabResultLead}</strong>
			{$t.about.notLabResultBody}
		</li>
		<li>
			<strong>{$t.about.notDatabaseLead}</strong>
			{$t.about.notDatabaseBody}
		</li>
	</ul>
	<p class="muted">
		{$t.about.arithmeticNote}
	</p>
</div>

<div class="card">
	<h3>{$t.about.nameTitle}</h3>
	<p>
		{$t.about.nameGraft}
	</p>
	<p>
		{$t.about.nameFul}
	</p>
	<p class="muted">
		{$t.about.nameNotOrganSpecific}
	</p>
</div>

<div class="card">
	<h3>{$t.about.markTitle}</h3>
	<figure class="mark-figure">
		<!-- The lockup itself, so the thing being explained is on the page next to the words. -->
		<img src="/lockup.svg" alt={$t.about.markAlt} />
	</figure>
	<p>
		{$t.about.markStrokes}
	</p>
	<p>
		<strong>{$t.about.markJoinLead}</strong>
		{$t.about.markJoinBody}
	</p>
	<p class="muted">
		{$t.about.markHand}
	</p>
</div>

<div class="card">
	<h3>{$t.about.originTitle}</h3>
	<p>
		{$t.about.origin1}
	</p>
	<p>
		{$t.about.origin2}
	</p>
	<p>
		{$t.about.origin3}
	</p>
	<p class="muted">
		{$t.about.originNote}
	</p>
</div>

<div class="card">
	<h3>{$t.about.madeByTitle}</h3>
	<p class="muted">
		{$t.about.madeByBefore} <a href="https://kiro.dev" rel="noopener">Kiro</a>{$t.about.madeByAfter}
	</p>
	<p class="muted">
		{$t.about.madeByNote}
	</p>
</div>

<div class="card">
	<h3>{$t.about.licenceTitle}</h3>
	<p class="muted">
		{$t.about.licenceBefore} <a href={REPO_URL}>{$t.about.licenceLink}</a>{$t.about.licenceAfter}
	</p>
	<p class="muted">{$t.about.licenceName}</p>
	<p class="muted version">
		<!--
			Shown so a bug report can name a version. Asset filenames already carry content
			hashes, which is what makes caching safe; this answers the different question of
			which build somebody is actually looking at.
		-->
		{$t.about.version(__APP_VERSION__)}
	</p>
</div>

<style>
	.version {
		font-variant-numeric: tabular-nums;
		margin-bottom: 0;
	}

	/*
	 * The mark shown at a size where the join is actually readable. Height in rem so it grows
	 * with the reader's text size, and width auto so the asset's own proportions decide the
	 * rest — the lockup's spacing is fixed inside the file and nothing here should override it.
	 */
	.mark-figure {
		margin: 0 0 1rem;
	}

	.mark-figure img {
		display: block;
		height: 2.75rem;
		width: auto;
	}

	blockquote {
		margin: 0;
		padding-left: 0.875rem;
		border-left: 3px solid var(--accent);
		font-size: 1rem;
	}

	ul {
		margin: 0.5rem 0 0.75rem;
		padding-left: 1.125rem;
	}

	li {
		margin-bottom: 0.375rem;
	}

	p {
		margin: 0 0 0.625rem;
	}
</style>
