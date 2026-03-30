import { defineEventHandler } from 'h3'

let cachedVotes: { lsm: number; sp: number; ts: number } | null = null
let cacheTimestamp = 0
const CACHE_DURATION = 10 * 60 * 1000 // 10 minutes

const headers = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
}

async function fetchListeServeurs(): Promise<number> {
  try {
    const res = await fetch('https://www.liste-serveurs-minecraft.org/?s=create+france', { headers })
    const html = await res.text()
    // <i class="fa fa-thumbs-up" ...></i> 333
    const match = html.match(/fa-thumbs-up[^>]*><\/i>\s*([\d\s]+)/)
    if (match) return parseInt(match[1].replace(/\s/g, ''), 10)
  } catch {}
  return 0
}

async function fetchServeurPrive(): Promise<number> {
  try {
    const res = await fetch('https://serveur-prive.net/minecraft/serveur-create-france', { headers })
    const html = await res.text()
    // "Votes : 347" ou "347" apres le texte Votes
    const match = html.match(/Votes?\s*(?:total|:)?\s*[:：]?\s*([\d\s]+)/i)
    if (match) return parseInt(match[1].replace(/\s/g, ''), 10)
  } catch {}
  return 0
}

async function fetchTopServeurs(): Promise<number> {
  try {
    const res = await fetch('https://top-serveurs.net/minecraft/serveur-create-france', { headers })
    const html = await res.text()
    // Cherche le total dans les monthly data: somme de tous les mois
    const monthlyMatch = html.match(/"monthly"[\s\S]*?"Votes"[^[]*\[([\d,]+)\]/)
    if (monthlyMatch) {
      const values = monthlyMatch[1].split(',').map(Number)
      return values.reduce((a, b) => a + b, 0)
    }
    // Fallback: cherche "5722 votes" - pattern plus precis
    const textMatch = html.match(/([\d\s,.]+)\s*votes/i)
    if (textMatch) return parseInt(textMatch[1].replace(/[\s,.]/g, ''), 10)
  } catch {}
  return 0
}

export default defineEventHandler(async () => {
  const now = Date.now()

  if (cachedVotes !== null && now - cacheTimestamp < CACHE_DURATION) {
    return { totalVotes: cachedVotes.lsm + cachedVotes.sp + cachedVotes.ts }
  }

  const [lsm, sp, ts] = await Promise.all([
    fetchListeServeurs(),
    fetchServeurPrive(),
    fetchTopServeurs(),
  ])

  // Met en cache seulement si au moins un site repond
  if (lsm + sp + ts > 0) {
    cachedVotes = { lsm, sp, ts }
    cacheTimestamp = now
  }

  if (cachedVotes) {
    return { totalVotes: cachedVotes.lsm + cachedVotes.sp + cachedVotes.ts }
  }

  return { totalVotes: 0 }
})
