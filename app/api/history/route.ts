import { createClient } from '@supabase/supabase-js'
import { LEADERBOARD_RESET_AT, getAuraTier, normalizeAuraScore } from '@/lib/aura'

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const userId = url.searchParams.get('user_id')

    if (!userId) {
      return Response.json([], { status: 200 })
    }

    if (!isUuid(userId)) {
      return Response.json([], { status: 200 })
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseKey) {
      return Response.json({ error: "Supabase not configured" }, { status: 503 })
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    const { data, error } = await supabase
      .from('scans')
      .select('*')
      .eq('user_id', userId)
      .gte('created_at', LEADERBOARD_RESET_AT)
      .order('created_at', { ascending: false })
      .limit(100)

    if (error) {
      console.error("Supabase history error:", error)
      return Response.json({ error: "Failed to fetch history" }, { status: 500 })
    }

    return Response.json((data || []).map((scan) => ({
      ...scan,
      aura: normalizeAuraScore(scan.aura),
      tier: getAuraTier(scan.aura, scan.tier),
    })))
  } catch (error) {
    console.error("History API error:", error)
    return Response.json({ error: "History API error" }, { status: 500 })
  }
}
