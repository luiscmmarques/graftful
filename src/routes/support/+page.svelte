<script lang="ts">
	/*
	 * Formerly a tips page. Reframed deliberately.
	 *
	 * The audience is people managing a lifelong condition, often alongside reduced income
	 * and real medical costs. Asking them for money — next to a medication reminder — is
	 * both distasteful and beside the point: hosting this costs almost nothing, and what
	 * the project actually lacks is people who know it exists.
	 *
	 * So the money links stay, quietly, at the bottom, and the page is about telling
	 * someone else. Replace the placeholders when the accounts exist — see TODO.md.
	 */
	import {
		bugFormUrl,
		bugMailUrl,
		EMAIL,
		generalMailUrl,
		ideaFormUrl,
		ideaMailUrl,
		localeFilesUrl,
		securityMailUrl
	} from '$lib/contact';
	import { t } from '$lib/i18n';

	const TWINT_QR = '/twint-qr.png';
	const PAYPAL_URL = 'https://paypal.me/';
	const moneyConfigured = false;
</script>

<svelte:head>
	<title>{$t.support.title} · Graftful</title>
	<meta name="description" content={$t.support.metaDescription} />
</svelte:head>

<h2>{$t.support.title}</h2>

<div class="card">
	<p>
		{$t.support.free1}
	</p>
	<p class="muted">
		{$t.support.free2}
	</p>
</div>

<div class="card">
	<h3>{$t.support.tellTitle}</h3>
	<ul>
		<li>
			<strong>{$t.support.recipientLead}</strong>
			{$t.support.recipientBody}
		</li>
		<li>
			<strong>{$t.support.coordinatorLead}</strong>
			{$t.support.coordinatorBody}
		</li>
		<li>
			<strong>{$t.support.pharmacistLead}</strong>
			{$t.support.pharmacistBody}
		</li>
		<li>
			<strong>{$t.support.associationLead}</strong>
			{$t.support.associationBody}
		</li>
	</ul>
	<p class="muted">
		{$t.support.tellNote}
	</p>
</div>

<div class="card">
	<h3>{$t.support.wrongTitle}</h3>
	<ul>
		<li>{$t.support.wrong1}</li>
		<li>{$t.support.wrong2}</li>
		<li>{$t.support.wrong3}</li>
	</ul>
	<p>
		<a href={bugFormUrl}>{$t.support.bugLink}</a>
		{$t.support.wrongOrEmail} <a href={bugMailUrl}>{EMAIL.bugs}</a>.
	</p>
	<p class="muted">
		{$t.support.wrongNote(__APP_VERSION__)}
	</p>
</div>

<div class="card">
	<h3>{$t.support.ideasTitle}</h3>
	<p>
		{$t.support.ideasBefore}
		<a href={ideaFormUrl}>{$t.support.ideaLink}</a>
		{$t.support.ideasOrEmail} <a href={ideaMailUrl}>{EMAIL.ideas}</a>.
	</p>
	<p class="muted">
		{$t.support.contactBefore} <a href={generalMailUrl}>{EMAIL.general}</a>{$t.support.contactAfter}
		<a href={securityMailUrl}>{EMAIL.security}</a>
		{$t.support.securityAfter}
	</p>
</div>

<div class="card">
	<h3>{$t.support.translationTitle}</h3>
	<p class="muted">
		{$t.support.translationState}
	</p>
	<p>
		{$t.support.translationBefore}
		<a href={bugMailUrl}>{$t.support.translationBugLink}</a>{$t.support.translationMiddle}
		<a href={localeFilesUrl}>{$t.support.translationFilesLink}</a>
		{$t.support.translationAfter}
		<code>src/lib/i18n</code>.
	</p>
	<p class="muted">
		{$t.support.translationWhy}
	</p>
</div>

{#if moneyConfigured}
	<div class="card">
		<h3>{$t.support.moneyTitle}</h3>
		<p class="muted">{$t.support.moneyNote}</p>
		<div class="row">
			<img src={TWINT_QR} alt={$t.support.twintAlt} width="180" height="180" />
			<a href={PAYPAL_URL} rel="noopener noreferrer" target="_blank">PayPal</a>
		</div>
	</div>
{/if}

<style>
	ul {
		margin: 0.5rem 0 0.75rem;
		padding-left: 1.125rem;
	}

	li {
		margin-bottom: 0.5rem;
	}

	p {
		margin: 0 0 0.625rem;
	}

	a {
		color: var(--accent);
	}

	img {
		max-width: 100%;
		height: auto;
	}
</style>
