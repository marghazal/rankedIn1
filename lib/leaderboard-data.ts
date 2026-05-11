export interface LeaderboardEntry {
  id?: string
  rank: number
  username: string
  name: string
  school: string
  university: string
  aura: number
  tier: string
  delta: number
  avatar: string
  linkedinUrl: string
  created_at?: string
}

export const LEADERBOARD: LeaderboardEntry[] = []

export const ONTARIO_UNIVERSITIES = [
  "Brock University",
  "Carleton University",
  "McMaster University",
  "OCAD University",
  "Ontario Tech University",
  "Queen's University",
  "Royal Military College of Canada",
  "Toronto Metropolitan University",
  "Trent University",
  "University of Guelph",
  "University of Ottawa",
  "University of Toronto",
  "University of Waterloo",
  "University of Windsor",
  "Western University",
  "Wilfrid Laurier University",
  "York University",
]
