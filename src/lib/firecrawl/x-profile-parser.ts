import type { RawTweet } from '@/types/x-intel';
import { getAccountCredibility } from '@/lib/x-intel/accounts';
import { classifySentiment, classifySignalTypes, extractCities } from '@/lib/x-intel/nlp';

const AV_KEYWORDS =
  /robotaxi|cybercab|fsd|full self-driving|driverless|autonomous|unsupervised|semi|megapack|energy storage|optimus/i;

interface ParsedPost {
  text: string;
  url: string;
  createdAt: string;
}

export function parseXProfileMarkdown(markdown: string, handle: string): ParsedPost[] {
  const posts: ParsedPost[] = [];
  const blocks = markdown.split(/### \d+\. Post/g).slice(1);

  for (const block of blocks) {
    const postedMatch = block.match(/Posted:\s*([^\n]+)/i);
    const urlMatch = block.match(/URL:\s*\[([^\]]+)\]\(([^)]+)\)/i) ?? block.match(/(https:\/\/x\.com\/\w+\/status\/\d+)/i);
    const quoteMatch = block.match(/>\s*([\s\S]*?)(?=\n\nLikes:|$)/);

    if (!quoteMatch) continue;
    const text = quoteMatch[1].replace(/^>\s?/gm, '').trim();
    const url = urlMatch ? (urlMatch[2] ?? urlMatch[1]).replace(/\\/g, '') : `https://x.com/${handle}`;
    const createdAt = postedMatch
      ? new Date(postedMatch[1].trim()).toISOString()
      : new Date().toISOString();

    if (text) posts.push({ text, url, createdAt });
  }

  return posts;
}

export function postsToRawTweets(posts: ParsedPost[], handle: string): RawTweet[] {
  const cleanHandle = handle.replace('@', '');
  return posts
    .filter((p) => p.text.length > 2)
    .map((p, i) => {
      const cities = extractCities(p.text);
      return {
        id: `${cleanHandle}-fc-${i}-${p.url.split('/').pop()}`,
        handle: cleanHandle,
        displayName: cleanHandle,
        text: p.text,
        url: p.url,
        createdAt: p.createdAt,
        isReply: /^@\w+/.test(p.text),
        replyToHandle: undefined,
        hasMedia: false,
        likes: 0,
        retweets: 0,
        views: undefined,
        cities: cities.map((c) => c.cityId),
        signalTypes: classifySignalTypes(p.text, cleanHandle),
        sentiment: classifySentiment(p.text),
        credibilityScore: getAccountCredibility(cleanHandle),
      };
    });
}

export function filterAvPosts(posts: ParsedPost[]): ParsedPost[] {
  return posts.filter((p) => AV_KEYWORDS.test(p.text));
}

export const X_INTEL_PROFILES = [
  { handle: 'elonmusk', url: 'https://x.com/elonmusk' },
  { handle: 'JonathanWStokes', url: 'https://x.com/JonathanWStokes' },
] as const;