# RankedIn

> linkedin, but with the receipts. AI-powered career aura scoring for Ontario university students.

A hackathon project that analyzes a LinkedIn profile URL and generates an "aura score" — a ranked verdict with job matches, category breakdowns, roasts, and improvement suggestions. Built with Next.js 15, Tailwind CSS v4, shadcn/ui, and Framer Motion.

---

## Project Structure

```
rankedin/
├── app/
│   ├── layout.tsx                  # Root layout — Inter, Fraunces, JetBrains Mono fonts
│   ├── globals.css                 # Tailwind v4 + all design tokens (--ri-* color system)
│   ├── page.tsx                    # Landing page (Nav + Hero + LiveTicker + Ranks + HowItWorks)
│   ├── scan/page.tsx               # Scan entry page
│   ├── profile/[id]/page.tsx       # Profile result page — reads from localStorage
│   ├── leaderboard/page.tsx        # Leaderboard page
│   └── battle/page.tsx             # Head-to-head comparison page
│
├── components/
│   ├── nav.tsx                     # Sticky top nav with flame logo
│   ├── flame.tsx                   # Animated SVG flame — orange gradient, scales with aura
│   ├── theme-provider.tsx
│   ├── landing/
│   │   ├── hero-section.tsx
│   │   ├── live-ticker.tsx         # Scrolling ticker of recent scans
│   │   ├── ranks-section.tsx       # Rank tiers display
│   │   └── how-it-works-section.tsx
│   ├── scan/
│   │   └── scan-form.tsx           # Main scan form — LinkedIn URL + name + GitHub + university
│   ├── profile/
│   │   ├── profile-result.tsx      # Full profile card — score, breakdown, roasts, job matches
│   │   └── aura-counter.tsx        # Animated number counter for the aura score
│   ├── leaderboard/
│   │   └── leaderboard-view.tsx    # Leaderboard with tabs (this week / all time)
│   └── battle/
│       └── battle-view.tsx         # Side-by-side profile battle comparison
│
├── lib/
│   ├── demo-profile.ts             # ProfileData type + DEMO_PROFILE + getDemoProfileById()
│   ├── leaderboard-data.ts         # LeaderboardEntry type + LEADERBOARD array (20 entries)
│   ├── ranks.ts                    # RANK_TIERS array + getTierForAura(aura) helper
│   └── utils.ts                    # cn() from shadcn
│
└── components/ui/                  # shadcn/ui components (new-york style, Tailwind v4)
```

---

## Design System

All colors are defined as CSS variables in `app/globals.css` under the `--ri-*` namespace and exposed as Tailwind utilities via `@theme inline`.

| Token | Value | Usage |
|---|---|---|
| `ri-white` | `#FFFFFF` | Page background |
| `ri-off-white` | `#FAFAFA` | Card backgrounds |
| `ri-gray-100` | `#E5E5E5` | Borders |
| `ri-gray-400` | `#737373` | Secondary text, labels |
| `ri-black` | `#0A0A0A` | Primary text, buttons |

Fonts: **Inter** (sans, body), **Fraunces** (serif, headings/scores), **JetBrains Mono** (mono, numbers).

Flame colors: outer `#ea580c`, mid `#fb923c`, core `#fbbf24`, drop-shadow `rgba(234,88,12,0.55)`.

---

## Data Flow (Current — Demo Mode)

1. User fills `scan-form.tsx` → LinkedIn URL, display name, GitHub, university (Ontario list)
2. Fake loading steps play (1.2s each): fetching → analyzing → calculating → verdict
3. Data is saved to `localStorage` as `rankedin_last_scan`:
   ```json
   {
     "id": "demo-1234567890",
     "username": "extracted-from-url",
     "linkedinUrl": "https://linkedin.com/in/...",
     "github": "handle-or-null",
     "university": "University of Waterloo or null",
     "scannedAt": 1234567890
   }
   ```
4. User is redirected to `/profile/[id]`
5. `profile/[id]/page.tsx` reads `rankedin_last_scan` from localStorage and passes it to `ProfileResult`
6. `ProfileResult` renders using `DEMO_PROFILE` data from `lib/demo-profile.ts` — **not real AI data yet**

---

## What Still Needs to Be Built

### 1. Real AI Scoring (PRIORITY 1 — this is the whole product)

The scan currently shows fake demo data. You need to wire up a real AI call.

**Recommended approach: Groq (free, fast)**

Install:
```bash
pnpm add @ai-sdk/groq ai
```

Set environment variable:
```
GROQ_API_KEY=your_key_here
```

Create an API route at `app/api/score/route.ts`:

```typescript
import { generateObject } from 'ai'
import { createGroq } from '@ai-sdk/groq'
import { z } from 'zod'

const groq = createGroq({ apiKey: process.env.GROQ_API_KEY })

const ProfileSchema = z.object({
  aura: z.number().min(0).max(2500),
  tier: z.string(),
  breakdown: z.array(z.object({
    label: z.string(),
    value: z.number(),
    positive: z.boolean(),
  })),
  roasts: z.array(z.string()).length(3),
  jobMatches: z.array(z.object({
    title: z.string(),
    company: z.string(),
    match: z.number().min(0).max(100),
    reason: z.string(),
  })).length(4),
  improvements: z.array(z.object({
    area: z.string(),
    suggestion: z.string(),
    potentialGain: z.number(),
  })).length(5),
})

export async function POST(req: Request) {
  const { linkedinUrl, displayName, github, university } = await req.json()

  const { object } = await generateObject({
    model: groq('llama-3.3-70b-versatile'),
    schema: ProfileSchema,
    prompt: `You are RankedIn, a savage but fair AI career rater for Ontario university students.
    
    Analyze this LinkedIn profile: ${linkedinUrl}
    Display name: ${displayName || 'unknown'}
    GitHub: ${github || 'none'}
    University: ${university || 'unknown'}
    
    Since you cannot actually fetch the LinkedIn page, make intelligent inferences based on the URL slug, university, and any other signals.
    Generate a realistic aura score between 0-2500 based on what a typical student from this university might have.
    
    Aura tiers:
    - 0-199: Resume Silver
    - 200-499: Internship Bronze  
    - 500-999: Internship Gold
    - 1000-1499: New Grad Silver
    - 1500-1999: FAANG Contender
    - 2000+: FAANG Platinum
    
    Be specific, witty, and Gen-Z in the roasts. Job matches should be realistic for a student profile.`,
  })

  return Response.json(object)
}
```

Then update `scan-form.tsx` to call this API before redirecting, and store the result in localStorage alongside the scan data. Update `profile/[id]/page.tsx` to read the AI result from localStorage instead of using `DEMO_PROFILE`.

**Important:** LinkedIn does not allow scraping. The AI will score based on profile URL signals + user-provided info. This is intentional and fine for a hackathon demo.

---

### 2. Share Card / OG Image

Create a route at `app/og/[id]/route.tsx` using Next.js `ImageResponse` from `next/og`.

Install if needed:
```bash
pnpm add @vercel/og
```

The card should render: username, aura score, tier, university, and the flame. Use inline styles (no Tailwind in ImageResponse). Store the scan data in a real database (Supabase recommended) so the OG image can be fetched server-side by ID rather than relying on localStorage.

The share card URL format: `https://yourapp.com/og/demo-1234567890`

Add a "share my aura" button to `profile-result.tsx` that copies `window.location.href` (or constructs the OG URL) to clipboard and shows a toast.

---

### 3. University Leaderboard Filter

The leaderboard currently hardcodes "U of Guelph · CS" as the title and all entries have the same school.

Steps:
1. Update `lib/leaderboard-data.ts` — add a `university` field to each `LeaderboardEntry` and diversify entries across Ontario universities (see the full list in `scan-form.tsx`)
2. Update `components/leaderboard/leaderboard-view.tsx` — add a university selector dropdown (same style as the one in `scan-form.tsx`) that filters `LEADERBOARD` entries by `university`
3. Ideally, default the filter to the university stored in `localStorage` from the user's last scan (`rankedin_last_scan.university`)
4. Update the `<h1>` to display the selected university name dynamically instead of the hardcoded "U of Guelph · CS"

---

### 4. Database (Recommended for full feature set)

Connect Supabase for:
- Storing scan results so OG images work (no localStorage dependency)
- Real leaderboard with actual scanned users
- Persistent battle comparisons

Tables needed:
```sql
-- profiles
create table profiles (
  id text primary key,
  username text,
  display_name text,
  linkedin_url text,
  github text,
  university text,
  aura integer,
  tier text,
  breakdown jsonb,
  roasts jsonb,
  job_matches jsonb,
  improvements jsonb,
  scanned_at timestamptz default now()
);
```

---

### 5. Nice-to-Have Features

- **Roast severity toggle** — let users pick "savage / honest / kind" before scanning; pass it to the AI prompt
- **Confetti on score reveal** — install `canvas-confetti` or `party-js`, trigger when the profile result mounts
- **Battle with real profiles** — let two people each enter their LinkedIn URLs on `/battle` instead of hardcoded demo profiles
- **Scan history** — read `rankedin_last_scan` in the nav or profile page to show "your last scan was X days ago"
- **Mobile nav** — the current nav has no hamburger menu; it breaks on small screens. Add a `Sheet` from shadcn/ui for mobile

---

## Local Setup

```bash
# Install dependencies
pnpm install

# Start dev server
pnpm dev

# Open http://localhost:3000
```

Required environment variables (create `.env.local`):
```
GROQ_API_KEY=           # Get from console.groq.com — free tier is enough
NEXT_PUBLIC_APP_URL=http://localhost:3000  # Used for OG image URLs
```

Optional (if adding Supabase):
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

---

## Tech Stack

| | |
|---|---|
| Framework | Next.js 15 (App Router) |
| Styling | Tailwind CSS v4 |
| Components | shadcn/ui (new-york style) |
| Animations | Framer Motion |
| Fonts | Inter · Fraunces · JetBrains Mono (Google Fonts via next/font) |
| AI (planned) | Groq — llama-3.3-70b-versatile via AI SDK |
| DB (planned) | Supabase |
| Package manager | pnpm |

---

## Notes for the Next Developer

- Do **not** add purple/violet to the color system — the design is intentionally monochrome + orange flame only
- The `ProfileData` type in `lib/demo-profile.ts` is the source of truth for what a profile object looks like — match it exactly when building the AI API response
- The flame component (`components/flame.tsx`) scales based on the `aura` prop — it shows sparks when aura > 1000 and grows larger at higher values
- Tailwind classes use the `ri-*` prefix for all custom colors (e.g. `bg-ri-off-white`, `text-ri-gray-400`) — do not use raw hex values in JSX
- All font families are set via CSS variables: `font-sans` = Inter, `font-serif` = Fraunces, `font-mono` = JetBrains Mono
