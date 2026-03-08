# Elon Tweet Widget Update Rule

## Widget Location
`src/components/CountdownWidget.tsx` - Third panel in the countdown widget row

## Update Criteria
The Elon tweet widget should be updated whenever Elon Musk (@elonmusk) posts a tweet or reply that mentions:
- "robotaxi" or "Robotaxi"
- "FSD" or "Full Self-Driving"
- "unsupervised" or "driverless"
- "autonomous" driving
- "cybercab" or "Cybercab"
- Safety monitor removal
- Any specific city robotaxi launches (Austin, SF, Phoenix, etc.)

## Update Process

### 1. Find the Tweet
Search X/Twitter for Elon's latest robotaxi-related tweet:
- Check @elonmusk timeline
- Search: `from:elonmusk robotaxi OR FSD OR "full self-driving" OR cybercab`

### 2. Get the Tweet URL
The URL format is: `https://x.com/elonmusk/status/[STATUS_ID]`

Example: `https://x.com/elonmusk/status/2000302654837371181`

### 3. Update the Component
Edit `src/components/CountdownWidget.tsx`:

```tsx
{/* Latest Elon Tweet */}
<div className="bg-neutral-950 border border-neutral-800 rounded-xl p-4">
  <div className="flex items-center gap-2 mb-2">
    <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
    </svg>
    <span className="text-[10px] text-neutral-500 uppercase">Elon Musk</span>
    <span className="text-[8px] text-neutral-600 ml-auto">[DATE]</span>  <!-- UPDATE THIS -->
  </div>
  <div className="text-[11px] text-white leading-relaxed">
    [TWEET TEXT HERE]  <!-- UPDATE THIS -->
  </div>
  <a
    href="[TWEET URL HERE]"  <!-- UPDATE THIS -->
    target="_blank"
    rel="noopener noreferrer"
    className="text-[9px] text-blue-400 hover:underline mt-2 block"
  >
    View on X →
  </a>
</div>
```

### 4. Fields to Update
1. **Date**: Update the date span (e.g., "Dec 14", "Jan 5")
2. **Tweet text**: Keep it short, truncate if needed
3. **URL**: Full tweet URL including status ID

## Current Tweet (as of Dec 15, 2025)
- **Text**: "Testing is underway with no occupants in the car"
- **Date**: Dec 14
- **URL**: https://x.com/elonmusk/status/2000302654837371181
- **Context**: Response to @cb_doge video of driverless robotaxi in Austin

## Character Limits
- Tweet text display: ~60 characters recommended for clean display
- If longer, truncate with "..."

## Verification
Always verify the tweet URL works before deploying:
1. Click the link to confirm it loads
2. Confirm it's from @elonmusk (not a reply from someone else)
3. Confirm it's robotaxi/FSD related

## Changelog
| Date | Tweet | Status ID |
|------|-------|-----------|
| 2025-12-14 | "Testing is underway with no occupants in the car" | 2000302654837371181 |
