# RankedIn

Turn your LinkedIn profile into an **Aura score** (0 – 2,500) and climb the leaderboard.

Built at GDGHack · Next.js 15 · TypeScript · Tailwind CSS v4 · Supabase · RapidAPI

---

## Prerequisites

- Node.js 20+
- npm
- A [Supabase](https://supabase.com) project (free tier works)
- A [RapidAPI](https://rapidapi.com) account with the following APIs subscribed (all have free tiers):
  - **Fresh LinkedIn Scraper** (`fresh-linkedin-scraper-api.p.rapidapi.com`)
  - **LI Data Scraper** (`li-data-scraper.p.rapidapi.com`)
  - **AI Web Scraper** (`ai-web-scraper1.p.rapidapi.com`)

---

## Local Setup

### 1. Clone the repo

```bash
git clone https://github.com/marghazal/rankedIn1.git
cd rankedIn1
```

### 2. Install dependencies

```bash
npm install --legacy-peer-deps
```

### 3. Set up environment variables

Create a `.env.local` file in the project root:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# RapidAPI (used for LinkedIn scraping)
RAPIDAPI_KEY=your-rapidapi-key
```

You can find these values in:
- **Supabase**: Project Settings → API
- **RapidAPI**: Your Apps → Add New App → copy the key

### 4. Set up the Supabase database

Run the following SQL in your Supabase SQL editor (or use the included `supabase-setup.sql` file):

```sql
create table scans (
  id uuid default gen_random_uuid() primary key,
  username text,
  linkedin_url text,
  full_name text,
  aura integer,
  tier text,
  created_at timestamptz default now()
);
```

Also enable **Email Auth** in Supabase: Authentication → Providers → Email → Enable.

### 5. Start the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Deploying to Netlify

1. Push your code to GitHub.
2. Go to [app.netlify.com](https://app.netlify.com) → **Add new site** → **Import from Git**.
3. Select your repo. Build settings are pre-configured via `netlify.toml`.
4. Add the same environment variables from `.env.local` under **Site settings → Environment variables**:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `RAPIDAPI_KEY`
5. Click **Deploy**.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| Animations | Framer Motion |
| Database + Auth | Supabase (Postgres) |
| LinkedIn Scraping | RapidAPI (3-layer fallback) |
| Scoring Engine | Custom text-mining pipeline (no AI APIs) |
| Deployment | Netlify + @netlify/plugin-nextjs |

---

## Project Structure

```
app/
  page.tsx                  # Landing page
  scan/page.tsx             # Scan entry
  profile/[id]/page.tsx     # Score result
  leaderboard/page.tsx      # Public leaderboard
  battle/page.tsx           # Head-to-head compare
  about/page.tsx            # Methodology + formula
  api/
    linkedin/route.ts       # LinkedIn scraping (3-layer)
    score/route.ts          # Scoring engine
    scan/route.ts           # Save scan to Supabase

components/
  nav.tsx
  landing/
  scan/
  profile/
  leaderboard/
  battle/

lib/
  supabase.ts               # Supabase client + helpers
  ranks.ts                  # Tier definitions
  demo-profile.ts           # Type definitions
```

---

## How the Score Works

Aura is calculated across 8 dimensions — no AI, fully deterministic:

| Dimension | Max pts |
|---|---|
| Headline clarity | 250 |
| Experience signal | 650 |
| Education fit | 350 |
| Skills depth | 450 |
| About / Summary | 200 |
| Projects proof | 300 |
| Profile completeness | 300 |
| Recruiter signal bonus | 150 |
| **Total** | **2,500** |

See [/about](https://your-site.netlify.app/about) for the full formula breakdown.
