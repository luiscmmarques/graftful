/** @type {import("prettier").Config} */
const config = {
	useTabs: true,
	singleQuote: true,
	trailingComma: 'none',
	printWidth: 100,
	// Markdown prose flows as one line per paragraph; editors soft-wrap. The default
	// ('preserve') kept hand-made hard wraps forever, and re-wrapping by hand is what
	// made inline code spans split across lines — Prettier's output for that is
	// unstable, so `lint` could fail straight after `format`.
	proseWrap: 'never',
	plugins: ['prettier-plugin-svelte'],
	overrides: [{ files: '*.svelte', options: { parser: 'svelte' } }]
};

export default config;
