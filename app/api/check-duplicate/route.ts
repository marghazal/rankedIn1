import { createClient } from '@supabase/supabase-js'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const url = searchParams.get('url')

  if (!url) {
    return Response.json({ exists: false })
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    return Response.json({ exists: false })
  }

  const supabase = createClient(supabaseUrl, supabaseKey)

  const { data } = await supabase
    .from('scans')
    .select('id')
    .eq('linkedin_url', url)
    .maybeSingle()

  return Response.json({ exists: Boolean(data?.id) })
}
