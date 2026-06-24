export type FxStatus = {
  id?: string;
  text?: string;
  url?: string;
  created_at?: string;
  likes?: number;
  retweets?: number;
  views?: number;
  reply_to?: { screen_name?: string };
  author?: { screen_name?: string; name?: string };
  media?: { type?: string }[];
};

const GARBAGE_PATTERNS =
  /rss reader not yet whitelist|verifying your browser|nitter|enable javascript|access denied|rate limit/i;

export function decodeHtml(text: string): string {
  return text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'");
}

export function isValidTweetText(text: string, url?: string): boolean {
  if (!text || text.length < 3) return false;
  if (GARBAGE_PATTERNS.test(text)) return false;
  if (url && (url.endsWith('/rss') || url.includes('rss.xcancel'))) return false;
  return true;
}

export async function fetchFxStatuses(path: string): Promise<FxStatus[]> {
  try {
    const res = await fetch(`https://api.fxtwitter.com${path}`, {
      headers: { 'User-Agent': 'ShadowMode/2.0 (+https://shadowmode.us)' },
      signal: AbortSignal.timeout(12000),
      next: { revalidate: 0 },
    });
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data?.results) ? data.results : [];
  } catch {
    return [];
  }
}

export async function searchFxTwitter(query: string, limit = 20): Promise<FxStatus[]> {
  const encoded = encodeURIComponent(query);
  const results = await fetchFxStatuses(`/2/search?q=${encoded}`);
  return results.slice(0, limit);
}

export async function fetchProfileStatuses(handle: string, limit = 15): Promise<FxStatus[]> {
  const results = await fetchFxStatuses(`/2/profile/${handle}/statuses`);
  return results
    .filter((hit) => {
      const author = hit.author?.screen_name?.toLowerCase();
      return !author || author === handle.toLowerCase();
    })
    .slice(0, limit);
}

export function statusToId(status: FxStatus, handle: string): string {
  if (status.id) return String(status.id);
  const match = status.url?.match(/status\/(\d+)/);
  return match?.[1] ?? `${handle}-${status.created_at ?? Date.now()}`;
}