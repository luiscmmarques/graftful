<script lang="ts">
	// The point of this page is the DevTools paragraph. Everything else is a promise;
	// that one is a test the reader can run.
</script>

<svelte:head>
	<title>Privacy · Graftful</title>
	<meta name="description" content="What Graftful stores, where it stores it, and how to check." />
</svelte:head>

<h2>Privacy</h2>

<div class="card">
	<p><strong>Your medication data never leaves your device.</strong></p>
	<p class="muted">
		There is no account, no sign-in, and no server holding your regimen. Everything you enter
		(products, doses, stock counts, orders, your transplant date) is stored by your browser on the
		device you are using, and nowhere else.
	</p>
</div>

<div class="card">
	<h3>How to check, rather than take my word for it</h3>
	<p class="muted">
		Open your browser's developer tools, go to the Network tab, and then use the app: add a product,
		record a stock count, generate an order. Nothing will be sent. This is worth more than any
		privacy policy, because you are watching the actual behaviour rather than reading a claim about
		it.
	</p>
</div>

<div class="card">
	<h3>The one thing that is collected</h3>
	<p class="muted">
		Page views, through Cloudflare Web Analytics. It records that a page was opened, roughly which
		country from the request, and which page. It sets no cookies, does not fingerprint your browser,
		and cannot see anything you typed. I use it to know whether anyone is finding the app at all.
	</p>
	<p class="muted">
		It is a single script from Cloudflare. If you block it, the app works exactly the same.
	</p>
</div>

<div class="card">
	<h3>What this means in practice</h3>
	<ul>
		<li>
			<strong>Clearing your browser data will delete your regimen.</strong> This is the real risk of storing
			everything locally, and it is why the app has an export button. Use it.
		</li>
		<li>
			<strong>Your data does not follow you between devices.</strong> Phone and laptop hold separate copies.
			Export from one and import into the other.
		</li>
		<li>
			<strong>Anyone who can unlock your device can read it.</strong> There is no separate app passcode.
			Your device lock is the protection.
		</li>
		<li>
			<strong>Nothing is backed up for you.</strong> I cannot recover your data, because I never had it.
		</li>
	</ul>
</div>

<div class="card">
	<h3>Deleting everything</h3>
	<p class="muted">
		Setup has a button that erases all of it immediately. There is nothing to request, and no
		account to close.
	</p>
	<p class="muted">
		Because I hold no personal data, there is no copy to request and nothing for me to delete
		remotely. That is by design: the safest way to handle sensitive health data is not to receive
		it. Questions about this privacy model can go to
		<a href="mailto:hi@graftful.app">hi@graftful.app</a>.
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
