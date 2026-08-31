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

	const TWINT_QR = '/twint-qr.png';
	const PAYPAL_URL = 'https://paypal.me/';
	const moneyConfigured = false;
</script>

<svelte:head>
	<title>Support Graftful</title>
	<meta
		name="description"
		content="Graftful is free. The most useful thing you can do is tell someone who needs it."
	/>
</svelte:head>

<h2>Support this</h2>

<div class="card">
	<p>
		Graftful is free and will stay free. There is no paid tier, nothing is locked, and no feature
		depends on money changing hands.
	</p>
	<p class="muted">
		It also costs almost nothing to run: a domain, and hosting that is free at this size. What it
		genuinely lacks is people knowing it exists. If you have found it useful, telling one other
		person is worth more than a donation.
	</p>
</div>

<div class="card">
	<h3>Tell someone who needs it</h3>
	<ul>
		<li>
			<strong>Another recipient.</strong> Anyone in their first months after a transplant, drowning in
			boxes. That is the moment this helps most, and the moment nobody has the energy to go looking for
			a tool.
		</li>
		<li>
			<strong>Your transplant coordinator.</strong> They are the people who actually have the adherence
			conversation, and they are usually glad of something concrete to point at. Not the reception desk.
		</li>
		<li>
			<strong>Your GP or pharmacist.</strong> Your pharmacist in particular sees the consequences of bad
			reorder timing every week.
		</li>
		<li>
			<strong>A patient association or online group.</strong> One post reaches more people than I ever
			will alone.
		</li>
	</ul>
	<p class="muted">
		Nothing to sign up for and nothing to install. Sharing the address is enough. It works in a
		browser first, and installs to the home screen if wanted.
	</p>
</div>

<div class="card">
	<h3>Tell me what is wrong with it</h3>
	<ul>
		<li>
			The thing that confused you, or that you had to work around. Confusion is a defect, not a user
			error.
		</li>
		<li>
			The case your regimen has that Graftful handles badly. No two regimens are the same, and mine
			is only one of them.
		</li>
		<li>Anything that felt clinically wrong. That matters more than any other kind of report.</li>
	</ul>
	<p>
		<a href={bugFormUrl}>Report a bug on GitHub</a>
		or email <a href={bugMailUrl}>hi+bugs@graftful.app</a>.
	</p>
	<p class="muted">
		Both already carry the version you are running ({__APP_VERSION__}), so there is nothing to look
		up. GitHub issues are public: please do not include medicine names, doses, transplant dates,
		screenshots of your regimen or an exported backup. Use email if the problem cannot be described
		without personal health information. Graftful cannot advise on a missed dose or any medication
		decision; contact your transplant team for that.
	</p>
</div>

<div class="card">
	<h3>Ideas and other contact</h3>
	<p>
		For an idea or product feedback, use the
		<a href={ideaFormUrl}>idea form on GitHub</a>
		or email <a href={ideaMailUrl}>{EMAIL.ideas}</a>.
	</p>
	<p class="muted">
		For general questions, partnerships or media: <a href={generalMailUrl}>{EMAIL.general}</a>.
		Email to the +bugs and +ideas addresses reaches the same mailbox and is sorted there; it is not
		copied automatically into a public GitHub issue. Security reports go to
		<a href={securityMailUrl}>{EMAIL.security}</a> instead, so a vulnerability is not made public before
		it is fixed.
	</p>
</div>

<div class="card">
	<h3>Fix a translation</h3>
	<p class="muted">
		The app shell, Today, Stock, the pharmacy order and the calendar file are available in English,
		French, German and Portuguese. Order, Setup and pages like this one are still English. The
		German has not been read by a native speaker yet.
	</p>
	<p>
		If a word reads wrong, awkward or too formal in your language, that is worth reporting. Send it
		as a <a href={bugMailUrl}>bug</a>, which needs no GitHub account, or if you are comfortable with
		code, edit the catalogue directly:
		<a href={localeFilesUrl}>one file per language</a> in
		<code>src/lib/i18n</code>.
	</p>
	<p class="muted">
		A wrong word in a medication app is not cosmetic. Someone deciding whether to trust this with
		their prescription reads the tone before they read the features, and a translation reaches an
		entire country that cannot currently use the whole app. It goes considerably further than money
		does.
	</p>
</div>

{#if moneyConfigured}
	<div class="card">
		<h3>If you would still rather send something</h3>
		<p class="muted">Genuinely optional. Managing a transplant is expensive enough.</p>
		<div class="row">
			<img src={TWINT_QR} alt="TWINT QR code" width="180" height="180" />
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
