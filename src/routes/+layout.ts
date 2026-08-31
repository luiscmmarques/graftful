/*
 * Prerendered at build time, including the server render.
 *
 * `ssr = true` looks wrong for an app whose entire state lives in IndexedDB, and it is
 * not about rendering data. Prerendering happens at build time with no user involved,
 * so nothing personal is ever rendered anywhere: each route emits the shell it would
 * show before the local database has loaded — the same "Loading…" branch a real visit
 * starts from — plus its `<head>`.
 *
 * That head is the point. With `ssr = false` the prerendered output carried no title,
 * so every visit began with the fallback title from app.html and visibly swapped to the
 * route's own title on hydration. Anything reading the HTML without running it — a
 * crawler, or the link preview in WhatsApp, which is how this will spread through a
 * patient community — saw only the fallback.
 *
 * Prerendering per route also gives the service worker a real file to precache for each
 * path, so a direct hit on /stock offline resolves to that route's own shell rather than
 * being rewritten to the root.
 *
 * The stores are inert outside the browser (see src/lib/db/index.ts), so a server render
 * cannot touch IndexedDB even by accident.
 */
export const ssr = true;
export const prerender = true;
