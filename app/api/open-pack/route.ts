import { NextResponse } from "next/server"

type Rarity = "Common" | "Rare" | "Legendary" | "Mythical"

interface Alien {
  id: string
  name: string
  rarity: Rarity
  image: string
}

const RARITY_CHANCES = {
  Common: 0.55,
  Rare: 0.3,
  Legendary: 0.12,
  Mythical: 0.03,
}

const ALIEN_PREFIXES = ["Zorg", "Xeno", "Quaz", "Blip", "Vex", "Nyx", "Zax", "Krix"]
const ALIEN_SUFFIXES = ["oid", "ax", "or", "us", "ix", "ar", "on", "ite"]

function generateAlienName(): string {
  const prefix = ALIEN_PREFIXES[Math.floor(Math.random() * ALIEN_PREFIXES.length)]
  const suffix = ALIEN_SUFFIXES[Math.floor(Math.random() * ALIEN_SUFFIXES.length)]
  return `${prefix}${suffix}`
}

function determineRarity(): Rarity {
  const random = Math.random()
  let cumulativeProbability = 0

  for (const [rarity, chance] of Object.entries(RARITY_CHANCES)) {
    cumulativeProbability += chance
    if (random <= cumulativeProbability) {
      return rarity as Rarity
    }
  }

  return "Common" // Fallback
}

function generateAlien(): Alien {
  const rarity = determineRarity()
  return {
    id: crypto.randomUUID(),
    name: generateAlienName(),
    rarity,
    image: `/placeholder.svg?height=200&width=200`, // In a real app, this would be different per alien
  }
}

export async function POST() {
  // Simulate some network delay
  await new Promise((resolve) => setTimeout(resolve, 1000))

  const aliens = Array.from({ length: 5 }, () => generateAlien())

  return NextResponse.json({ aliens })
}

