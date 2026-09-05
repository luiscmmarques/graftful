/*
 * Prerendered, overriding the SPA default in the root layout.
 *
 * These pages hold no personal data and are the ones a stranger reads first — from a
 * QR code on a flyer, or over a clinician's shoulder. They should render as plain
 * HTML with no JavaScript and no round trip.
 */
export const ssr = true;
export const prerender = true;
