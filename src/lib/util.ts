/**
 * The current calendar day in the user's local timezone, as YYYY-MM-DD.
 *
 * Deliberately local rather than UTC: "what do I take today" is a question about
 * the user's day, and using UTC would shift the answer either side of midnight.
 * The domain layer treats the string as a calendar date, so no offset survives.
 */
export function todayIso(): string {
	const now = new Date();
	const local = new Date(now.getTime() - now.getTimezoneOffset() * 60_000);
	return local.toISOString().slice(0, 10);
}

export function formatNumber(value: number): string {
	return Number.isInteger(value) ? String(value) : value.toFixed(1).replace(/\.0$/, '');
}

/** Rounds down — "50 days left" should not read as 51 because of a fraction. */
export function formatDays(value: number | null): string {
	return value === null ? '—' : String(Math.floor(value));
}

/**
 * Hand a generated file to the browser.
 *
 * Two details that are easy to get wrong and fail only on some platforms:
 *
 * - The anchor is attached to the document. A click on a detached anchor is ignored by
 *   some browsers, so the export silently does nothing.
 * - The object URL is revoked on a timer rather than immediately. Browsers may read the
 *   blob after `click()` returns, and revoking in the same tick cancels the download —
 *   again silently. A backup or calendar file that never arrives is worse than an error,
 *   because the user believes they have one.
 */
export function downloadFile(filename: string, content: string, mime: string): void {
	const blob = new Blob([content], { type: mime });
	const url = URL.createObjectURL(blob);
	const link = document.createElement('a');
	link.href = url;
	link.download = filename;
	link.rel = 'noopener';
	link.style.display = 'none';

	document.body.append(link);
	link.click();
	link.remove();

	setTimeout(() => URL.revokeObjectURL(url), 40_000);
}
