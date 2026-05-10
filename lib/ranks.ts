export interface RankTier {
  name: string
  auraMin: number
  auraMax: number | null
  description: string
}

export const RANK_TIERS: RankTier[] = [
  {
    name: "Resume Silver",
    auraMin: 0,
    auraMax: 199,
    description: "you exist. that's a start.",
  },
  {
    name: "Internship Bronze",
    auraMin: 200,
    auraMax: 499,
    description: "you've done something. keep going.",
  },
  {
    name: "Internship Gold",
    auraMin: 500,
    auraMax: 999,
    description: "real experience detected. we see you.",
  },
  {
    name: "New Grad Silver",
    auraMin: 1000,
    auraMax: 1499,
    description: "the grind is showing. respect.",
  },
  {
    name: "FAANG Contender",
    auraMin: 1500,
    auraMax: 1999,
    description: "you might actually get the offer.",
  },
  {
    name: "FAANG Platinum",
    auraMin: 2000,
    auraMax: null,
    description: "the aura is immaculate.",
  },
]

export function getTierForAura(aura: number): RankTier {
  return (
    RANK_TIERS.slice()
      .reverse()
      .find((tier) => aura >= tier.auraMin) ?? RANK_TIERS[0]
  )
}
