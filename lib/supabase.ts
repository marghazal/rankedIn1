import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase credentials')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export interface Scan {
  id?: string
  username: string
  linkedin_url: string
  full_name: string
  aura: number
  tier: string
  created_at?: string
}

export async function saveScan(scan: Scan) {
  const { data, error } = await supabase
    .from('scans')
    .insert([
      {
        username: scan.username,
        linkedin_url: scan.linkedin_url,
        full_name: scan.full_name,
        aura: scan.aura,
        tier: scan.tier,
      },
    ])
    .select()

  if (error) throw error
  return data
}

export async function getLeaderboard(limit = 50) {
  const { data, error } = await supabase
    .from('scans')
    .select('*')
    .order('aura', { ascending: false })
    .limit(limit)

  if (error) throw error
  return data
}

export async function getLeaderboardByUniversity(university: string, limit = 50) {
  const { data, error } = await supabase
    .from('scans')
    .select('*')
    .ilike('school', `%${university}%`)
    .order('aura', { ascending: false })
    .limit(limit)

  if (error) throw error
  return data
}
