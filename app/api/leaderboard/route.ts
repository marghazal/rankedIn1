import { createClient } from '@supabase/supabase-js'
import { LEADERBOARD_RESET_AT, getAuraTier, normalizeAuraScore } from '@/lib/aura'

export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const university = url.searchParams.get('university')
    const limit = parseInt(url.searchParams.get('limit') || '50')

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseKey) {
      return Response.json(
        { error: "Supabase not configured" },
        { status: 503 }
      )
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    let query = supabase
      .from('scans')
      .select('*')
      .gte('created_at', LEADERBOARD_RESET_AT)
      .order('aura', { ascending: false })
      .limit(limit)

    if (university && university !== 'All Ontario Universities') {
      query = query.ilike('school', `%${university}%`)
    }

    const { data, error } = await query

    if (error) {
      console.error("Supabase error:", error)
      return Response.json(
        { error: "Failed to fetch leaderboard" },
        { status: 500 }
      )
    }

    // Deduplicate by both username and name, keeping the highest aura score
    const uniqueByUsername = new Map()
    for (const scan of (data || [])) {
      const username = scan.username?.toLowerCase().trim()
      const name = scan.full_name?.toLowerCase().trim()
      const key = username || name

      if (!key) continue

      const existing = uniqueByUsername.get(key)
      if (!existing || scan.aura > existing.aura) {
        uniqueByUsername.set(key, scan)
      }
    }

    const entries = Array.from(uniqueByUsername.values())
      .sort((a, b) => b.aura - a.aura)
      .map((scan, index) => ({
        id: scan.id,
        rank: index + 1,
        username: scan.username,
        name: scan.full_name,
        school: scan.school || '',
        university: scan.school || '',
        aura: normalizeAuraScore(scan.aura),
        tier: getAuraTier(scan.aura, scan.tier),
        delta: 0,
        avatar: '',
        linkedinUrl: scan.linkedin_url,
      }))

    return Response.json(entries)
  } catch (error) {
    console.error("Leaderboard API error:", error)
    return Response.json(
      { error: "Leaderboard API error" },
      { status: 500 }
    )
  }
}
