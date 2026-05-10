export interface AuraItem {
  label: string
  value: number
  positive: boolean
  max: number
  reason: string
}

export interface JobMatch {
  title: string
  company: string
  match: number // percentage 0-100
  reason: string
}

export interface Improvement {
  area: string
  suggestion: string
  potentialGain: number
}

export interface ProfileData {
  id: string
  username: string
  name: string
  school: string
  aura: number
  tier: string
  avatar: string
  breakdown: AuraItem[]
  roasts: string[]
  jobMatches: JobMatch[]
  improvements: Improvement[]
}

export const DEMO_PROFILE: ProfileData = {
  id: "",
  username: "",
  name: "",
  school: "",
  aura: 0,
  tier: "",
  avatar: "",
  breakdown: [],
  roasts: [],
  jobMatches: [],
  improvements: [],
}

export function getDemoProfileById(id: string): ProfileData {
  return {
    ...DEMO_PROFILE,
    id,
  }
}
