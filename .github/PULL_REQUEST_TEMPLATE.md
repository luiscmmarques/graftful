# What

<!-- One or two sentences on what changed and why. -->

# Checklist

- [ ] `npm run check && npm test && npm run build` all pass, and `npm run lint` is clean after `npm run format`
- [ ] No personal data is committed — the pre-commit hook scans staged content (`git config core.hooksPath .githooks` to enable it) and `src/lib/personal-data.test.ts` scans the tree in CI
- [ ] The docs still tell the truth after this change: README.md, TODO.md, STACK.md, DECISIONS.md and AGENTS.md were reread for anything this change made stale — counts, language lists, shipped features, "not yet built" claims
- [ ] If a field on a type in `src/lib/domain/types.ts` changed: the backup round-trip checklist in AGENTS.md was followed
- [ ] Nothing crosses the regulatory boundary in AGENTS.md — no dose derivation, no clinical interpretation
