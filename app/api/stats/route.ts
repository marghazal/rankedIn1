import { createClient } from '@supabase/supabase-js'
import { LEADERBOARD_RESET_AT } from '@/lib/aura'

export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseKey) {
      return Response.json({ count: 0 })
    }

    const supabase = createClient(supabaseUrl, supabaseKey)

    const { count, error } = await supabase
      .from('scans')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', LEADERBOARD_RESET_AT)

    if (error) {
      return Response.json({ count: 0 })
    }

    return Response.json({ count: count || 0 })
  } catch {
    return Response.json({ count: 0 })
  }
}
