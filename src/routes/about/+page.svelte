<script lang="ts">
	// Prerendered, unlike the app itself. Someone deciding whether to trust this —
	// or a clinician being shown it in a consultation — should be able to read what
	// it is before any JavaScript runs.
</script>

<svelte:head>
	<title>About Graftful</title>
	<meta
		name="description"
		content="What Graftful does, what it deliberately does not do, and who made it."
	/>
</svelte:head>

<h2>About Graftful</h2>

<div class="card">
	<p>
		Graftful helps people on long-term medication keep track of what to take, how much is left, and
		when to reorder. It was built for transplant recipients, who take the same drugs every day for
		the rest of their lives and for whom running out is not a minor inconvenience.
	</p>
	<p class="muted">
		It is free, has no account, no adverts, and works offline. Nothing about your health leaves your
		device.
	</p>
</div>

<div class="card">
	<h3>What it is for</h3>
	<blockquote>
		Graftful is a self-management tool for people taking long-term medication. It stores a
		medication schedule entered by the user, reminds them when a dose is due, tracks how many pills
		remain, and helps them prepare a pharmacy order. It does not provide medical advice, does not
		interpret clinical data, and does not determine or suggest any dose.
	</blockquote>
</div>

<div class="card">
	<h3>What it deliberately will not do</h3>
	<p class="muted">
		These are not missing features. They are the boundary that keeps this a tracking tool rather
		than something that ought to be regulated as a medical device. And, more simply, they are
		decisions that belong to your prescriber and not to an app.
	</p>
	<ul>
		<li><strong>Work out a dose</strong> from a blood level, your weight, or any test result.</li>
		<li>
			<strong>Work out which pills make up a dose.</strong> Told "14 mg", it will not decide that this
			means three 4 mg capsules and a 2 mg. You enter what you were prescribed. There are real clinical
			reasons a particular combination is chosen.
		</li>
		<li>
			<strong>Tell you what to do about a missed dose.</strong> It will show you that one was missed and
			when it was due. What to do next is a question for your transplant centre.
		</li>
		<li><strong>Warn about drug interactions.</strong></li>
		<li>
			<strong>Interpret a lab result.</strong> Recording a trough level is a diary entry and that is fine.
			Colouring it red, or calling it "out of range", is a judgement this app will not make.
		</li>
		<li>
			<strong>Come with a drug database.</strong> Every dose in Graftful was typed in by you, so it is
			never the source of a clinical number.
		</li>
	</ul>
	<p class="muted">
		It does do arithmetic on numbers you entered: how many days your stock will last, and how many
		boxes to ask the pharmacy for. If you record a total dose and the pills you list do not add up
		to it, Graftful will say the two disagree. It compares your own two numbers, and never decides
		which is right.
	</p>
</div>

<div class="card">
	<h3>Where the name comes from</h3>
	<p>
		A <strong>graft</strong> is the transplanted organ itself: the kidney, liver, heart or lung somebody
		gave you. The word is older than medicine: it comes from horticulture, where grafting means joining
		living tissue from one plant onto another so that the two grow as one. Which is exactly what a transplant
		is.
	</p>
	<p>
		<strong>-ful</strong> is the ordinary English suffix meaning full of. So Graftful is
		<em>full of graft</em>
		and it sits close enough to <em>grateful</em> to be no accident. If you have one of these, you know
		why.
	</p>
	<p class="muted">
		It is also deliberately not organ-specific. The first version was going to be named after
		kidneys, which would have been wrong: the daily arithmetic of immunosuppressants is the same
		whichever organ you were given.
	</p>
</div>

<div class="card">
	<h3>And the mark</h3>
	<figure class="mark-figure">
		<!-- The lockup itself, so the thing being explained is on the page next to the words. -->
		<img
			src="/lockup.svg"
			alt="The Graftful mark: a stem with new growth joining it from the side"
		/>
	</figure>
	<p>
		Two strokes: a stem that carries on, and new growth joining it from the side. It is a graft in
		the horticultural sense, the older one, which is why there is no syringe, no cross and no organ
		in it.
	</p>
	<p>
		<strong>The join is off to one side on purpose.</strong> A graft does not go where the original
		was. A transplanted kidney is placed at the front of the abdomen, while the two you were born
		with stay where they are, at the back. A symmetrical fork would say <em>replaced</em>. This says
		joined somewhere new, which is what actually happened.
	</p>
	<p class="muted">
		It also looks like a hand making a V, which I am happy to leave in. Making peace with the graft,
		and with the pills that come with it, is most of what living with one turns out to be.
	</p>
</div>

<div class="card">
	<h3>Where it came from</h3>
	<p>
		I am Luis. I had a kidney transplant at CHUV in Lausanne on 11 January 2016, and like everyone
		who leaves a transplant centre I left with a bag of boxes and no particular system for them.
	</p>
	<p>
		What I ended up building was a spreadsheet. It held each product, how many pills a day it came
		to, how many were left in the box, and the column that actually mattered: how many days that
		was. When any number got low, I emailed the pharmacy. I maintained it by hand for years, and it
		worked, but it only worked because I happen to enjoy spreadsheets. That seemed like a silly
		thing to require of somebody three weeks post-transplant.
	</p>
	<p>
		Graftful is that spreadsheet, rebuilt so nobody else has to invent it. The arithmetic in it is
		the arithmetic I was doing by hand, and the awkward parts of the example are in there because
		they were in mine: a dose made from three different pill strengths, a half tablet, a dose that
		tapers, and a strength that gets discontinued mid-treatment.
	</p>
	<p class="muted">
		The example regimen in the app uses invented medicine names. The numbers are real, the products
		are not: what any individual takes is nobody else's business, mine included. This is not a
		hospital product and is not affiliated with any transplant centre.
	</p>
</div>

<div class="card">
	<h3>Who made it</h3>
	<p class="muted">
		Made with care by Luis and <a href="https://kiro.dev" rel="noopener">Kiro</a>: a transplant
		recipient and an AI assistant, working from five years of a spreadsheet to build only the parts
		that turned out to matter.
	</p>
	<p class="muted">
		Every clinical boundary above was a deliberate decision rather than a missing feature, and the
		arithmetic is checked against real pharmacy orders rather than against itself.
	</p>
</div>

<div class="card">
	<h3>Source and licence</h3>
	<p class="muted">
		Graftful is <a href="https://github.com/luiscmmarques/graftful">open source on GitHub</a>
		under the AGPL-3.0. That matters for a practical reason rather than an ideological one: people depend
		on this daily for medication they cannot skip, and if I stop maintaining it nobody should be stranded.
		The licence also stops anyone taking it closed.
	</p>
	<p class="muted">The name is reserved, so a fork has to be called something else.</p>
	<p class="muted version">
		<!--
			Shown so a bug report can name a version. Asset filenames already carry content
			hashes, which is what makes caching safe; this answers the different question of
			which build somebody is actually looking at.
		-->
		Version {__APP_VERSION__}
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
