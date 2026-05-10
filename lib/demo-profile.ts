export interface AuraItem {
  label: string
  value: number
  positive: boolean
  max: number
  reason: string
  actionItems?: ProfileChange[]
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
  changes?: ProfileChange[]
}

export interface ProfileChange {
  area?: string
  section: string
  change: string
  example: string
  why: string
  potentialGain?: number
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
  profileChanges?: ProfileChange[]
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
  profileChanges: [],
}

export function getDemoProfileById(id: string): ProfileData {
  return {
    ...DEMO_PROFILE,
    id,
  }
}
