/**
 * Where the app lives, and how calendar events identify themselves.
 *
 * These are deliberately two constants rather than one, because they change under
 * different circumstances — and conflating them would break calendars quietly.
 */

/**
 * Public origin, used in links the app hands out.
 *
 * Safe to change. Update `src/app.html` at the same time — the canonical link and the
 * Open Graph tags live in static HTML that cannot import this file.
 */
export const APP_ORIGIN = 'https://graftful.app';

/**
 * Namespace for iCalendar UIDs. **Do not change this, even if the domain changes.**
 *
 * A UID identifies an event for the life of that event. It is only required to be globally
 * unique — the domain part is a namespace and never has to resolve. Change it and every
 * calendar client stops recognising the events it already has: instead of updating them on
 * the next import, it creates a second set. Someone who re-exported after a rename would
 * end up with two reminders for every dose, which is precisely the failure this app exists
 * to prevent.
 */
export const UID_NAMESPACE = 'graftful.app';
