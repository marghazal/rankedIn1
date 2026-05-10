import { createClient } from '@supabase/supabase-js'
import { getAuraTier, normalizeAuraScore } from '@/lib/aura'

export async function POST(req: Request) {
  try {
    const body = await req.json()

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseKey) {
      return Response.json(
        { error: "Supabase not configured" },
        { status: 503 }
      )
    }

    const supabase = createClient(supabaseUrl, supabaseKey)
    const aura = normalizeAuraScore(body.aura)
    const tier = getAuraTier(aura, body.tier)

    const insertRow: Record<string, unknown> = {
      username: body.username,
      linkedin_url: body.linkedin_url,
      full_name: body.full_name,
      aura,
      tier,
      school: body.school || '',
    }

    if (body.user_id) insertRow.user_id = body.user_id

    // Upsert by linkedin_url — same profile URL updates the existing row instead of creating a duplicate
    const { data: existing } = await supabase
      .from('scans')
      .select('id')
      .eq('linkedin_url', insertRow.linkedin_url)
      .maybeSingle()

    let data, error
    if (existing?.id) {
      ;({ data, error } = await supabase
        .from('scans')
        .update({ aura, tier, full_name: insertRow.full_name, school: insertRow.school, updated_at: new Date().toISOString() })
        .eq('id', existing.id)
        .select())
    } else {
      ;({ data, error } = await supabase
        .from('scans')
        .insert([insertRow])
        .select())
    }

    if (error) {
      console.error("Supabase upsert error:", error)
      return Response.json(
        { error: "Failed to save scan" },
        { status: 500 }
      )
    }

    return Response.json({ success: true, data, updated: Boolean(existing?.id) })
  } catch (error) {
    console.error("Save scan error:", error)
    return Response.json(
      { error: "Failed to save scan" },
      { status: 500 }
    )
  }
}
