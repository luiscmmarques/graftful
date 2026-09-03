<script lang="ts">
	// The point of this page is the DevTools paragraph. Everything else is a promise;
	// that one is a test the reader can run.
	import { EMAIL, generalMailUrl } from '$lib/contact';
	import { t } from '$lib/i18n';
</script>

<svelte:head>
	<title>{$t.privacy.title} · Graftful</title>
	<meta name="description" content={$t.privacy.metaDescription} />
</svelte:head>

<h2>{$t.privacy.title}</h2>

<div class="card">
	<p><strong>{$t.privacy.headline}</strong></p>
	<p class="muted">
		{$t.privacy.headlineBody}
	</p>
</div>

<div class="card">
	<h3>{$t.privacy.checkTitle}</h3>
	<p class="muted">
		{$t.privacy.checkBody}
	</p>
</div>

<div class="card">
	<h3>{$t.privacy.collectedTitle}</h3>
	<p class="muted">
		{$t.privacy.collected}
	</p>
	<p class="muted">
		{$t.privacy.collectedBlockable}
	</p>
</div>

<div class="card">
	<h3>{$t.privacy.practiceTitle}</h3>
	<ul>
		<li>
			<strong>{$t.privacy.clearingLead}</strong>
			{$t.privacy.clearingBody}
		</li>
		<li>
			<strong>{$t.privacy.devicesLead}</strong>
			{$t.privacy.devicesBody}
		</li>
		<li>
			<strong>{$t.privacy.unlockLead}</strong>
			{$t.privacy.unlockBody}
		</li>
		<li>
			<strong>{$t.privacy.noBackupLead}</strong>
			{$t.privacy.noBackupBody}
		</li>
	</ul>
</div>

<div class="card">
	<h3>{$t.privacy.deletingTitle}</h3>
	<p class="muted">
		{$t.privacy.deletingBody}
	</p>
	<p class="muted">
		{$t.privacy.deletingNoCopy}
		{$t.privacy.deletingContact}
		<!-- The full stop stays in the markup: it is the same character in every language. -->
		<a href={generalMailUrl}>{EMAIL.general}</a>.
	</p>
</div>

<style>
	ul {
		margin: 0.5rem 0 0;
		padding-left: 1.125rem;
	}

	li {
		margin-bottom: 0.5rem;
	}

	p {
		margin: 0 0 0.625rem;
	}
</style>
