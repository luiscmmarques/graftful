/**
 * Where to send things, in one place.
 *
 * These addresses and links appear on more than one page, and a stale one is worse than a
 * missing one: someone writes a careful report about their medication and it goes nowhere.
 * Keeping them here means renaming the repository or changing a mailbox is a single edit.
 *
 * All four addresses reach the same mailbox and are sorted by the `+` suffix. Nothing is
 * forwarded automatically into a public issue: incoming mail can contain medicine names,
 * screenshots or a whole exported regimen, so anything that becomes an issue is anonymised
 * by hand first.
 */

export const REPO_URL = 'https://github.com/luiscmmarques/graftful';

export const EMAIL = {
	/** General, partnerships, media. */
	general: 'hi@graftful.app',
	/** Feature requests and product feedback. */
	ideas: 'hi+ideas@graftful.app',
	/** Defects and help. */
	bugs: 'hi+bugs@graftful.app',
	/** Vulnerabilities, kept private until fixed. */
	security: 'hi+security@graftful.app'
} as const;

/**
 * The version travels with a report.
 *
 * Asking someone to find a build identifier and copy it correctly is asking for the field to
 * be blank or wrong, and "it does the wrong thing" cannot be answered without knowing which
 * build did it. GitHub issue forms accept field values as query parameters, so the link fills
 * it in; the email carries it in the subject for the same reason.
 */
export const bugFormUrl = `${REPO_URL}/issues/new?template=bug.yml&version=${encodeURIComponent(
	__APP_VERSION__
)}`;

export const ideaFormUrl = `${REPO_URL}/issues/new?template=idea.yml`;

export const bugMailUrl = `mailto:${EMAIL.bugs}?subject=${encodeURIComponent(
	`Bug in Graftful ${__APP_VERSION__}`
)}`;

export const ideaMailUrl = `mailto:${EMAIL.ideas}`;
export const generalMailUrl = `mailto:${EMAIL.general}`;
export const securityMailUrl = `mailto:${EMAIL.security}`;

/**
 * The language catalogues, for anyone who would rather fix a word than describe it.
 *
 * Pointed at the directory rather than a single file so a reader picks their own language,
 * and because English defines the type: changing it without the others is a compile error.
 */
export const localeFilesUrl = `${REPO_URL}/tree/main/src/lib/i18n`;
