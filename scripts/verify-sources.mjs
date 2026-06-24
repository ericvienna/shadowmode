#!/usr/bin/env node
/**
 * Pre-deploy source gate — every sourceUrl in seed data + RXT monitors must resolve.
 * Usage: FIRECRAWL_API_KEY=... node scripts/verify-sources.mjs
 * Exit 1 on any dead link → blocks vercel --prod when wired via npm run verify-sources
 */

import { readFileSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const SRC = join(ROOT, 'src/lib');

const RXT_URLS = [
  'https://robotaxitracker.com/unsupervised',
  'https://robotaxitracker.com/rides',
  'https://robotaxitracker.com/pricing',
  'https://robotaxitracker.com/texas-dmv',
  'https://robotaxitracker.com/?provider=tesla&area=austin',
];

function extractSourceUrls(content) {
  const urls = new Set();
  const re = /sourceUrl:\s*['"]([^'"]+)['"]/g;
  let m;
  while ((m = re.exec(content)) !== null) {
    urls.add(m[1]);
  }
  return urls;
}

function collectSeedUrls() {
  const files = ['energy-seed-data.ts', 'semi-seed-data.ts', 'ecosystem-seed-data.ts'];
  const urls = new Set(RXT_URLS);
  for (const f of files) {
    const path = join(SRC, f);
    try {
      const content = readFileSync(path, 'utf8');
      for (const u of extractSourceUrls(content)) urls.add(u);
    } catch {
      console.warn(`skip missing ${f}`);
    }
  }
  return [...urls];
}

async function verifyUrl(url, apiKey) {
  if (apiKey) {
    const res = await fetch('https://api.firecrawl.dev/v1/scrape', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url, formats: ['markdown'], onlyMainContent: true, waitFor: 1500 }),
      signal: AbortSignal.timeout(25_000),
    });
    if (!res.ok) {
      const body = await res.text().catch(() => '');
      return { ok: false, status: res.status, detail: body.slice(0, 120) };
    }
    const json = await res.json();
    const md = json?.data?.markdown ?? '';
    return { ok: Boolean(md.trim()), status: res.status, detail: md ? 'markdown ok' : 'empty' };
  }

  const res = await fetch(url, {
    method: 'HEAD',
    redirect: 'follow',
    signal: AbortSignal.timeout(12_000),
    headers: { 'User-Agent': 'ShadowmodeVerify/1.0 (+https://shadowmode.us)' },
  });
  return { ok: res.ok || res.status === 405, status: res.status, detail: 'head' };
}

async function main() {
  const apiKey = process.env.FIRECRAWL_API_KEY?.trim();
  const urls = collectSeedUrls();
  console.log(`\n🔍 verify-sources — checking ${urls.length} URLs${apiKey ? ' (Firecrawl)' : ' (HEAD fallback)'}\n`);

  const failures = [];
  let passed = 0;

  for (const url of urls) {
    process.stdout.write(`  ${url.slice(0, 70).padEnd(72)} `);
    try {
      const result = await verifyUrl(url, apiKey);
      if (result.ok) {
        console.log(`✓ ${result.status}`);
        passed++;
      } else {
        console.log(`✗ ${result.status} ${result.detail}`);
        failures.push({ url, ...result });
      }
    } catch (err) {
      console.log(`✗ ${err.message}`);
      failures.push({ url, ok: false, detail: err.message });
    }
  }

  console.log(`\n${passed}/${urls.length} passed`);
  if (failures.length) {
    console.error('\n❌ DEPLOY BLOCKED — dead or unreachable sources:\n');
    failures.forEach((f) => console.error(`  ${f.url}\n    ${f.detail}\n`));
    process.exit(1);
  }
  console.log('\n✅ All sources verified\n');
}

main();