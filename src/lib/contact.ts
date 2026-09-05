/**
 * Single source of truth for the site's published contact channels.
 *
 * Only verified, live channels belong here — /contact, the Organization JSON-LD
 * and llms.txt all read from it, so an unverified handle published here becomes
 * three wrong claims. CONTACT_EMAIL is null until a real inbox is confirmed;
 * the page and the schema both render correctly without it.
 */
export const CONTACT_EMAIL: string | null = null;

export const REPO_URL = 'https://github.com/ericvienna/shadowmode';
export const REPO_ISSUES_URL = `${REPO_URL}/issues`;
