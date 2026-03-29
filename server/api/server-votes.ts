import { defineEventHandler } from 'h3'

let cachedVotes: number | null = null
let cacheTimestamp = 0
const CACHE_DURATION = 10 * 60 * 1000 // 10 minutes

const headers = {
  'User-Agent': 'Mozilla/5.0 (compatible; CreateFranceBot/1.0)',
}

async function fetchListeServeurs(): Promise<number> {
  try {
    const res = await fetch('https://www.liste-serveurs-minecraft.org/?s=create+france', { headers })
    const html = await res.text()
    const match = html.match(/fa-thumbs-up[^>]*><\/i>\s*([\d\s]+)/)
    if (match) return parseInt(match[1].replace(/\s/g, ''), 10)
  } catch {}
  return 0
}

async function fetchServeurPrive(): Promise<number> {
  try {
    const res = await fetch('https://serveur-prive.net/minecraft/serveur-create-france', { headers })
    const html = await res.text()
    // Cherche "Votes total" ou le total dans la page
    const match = html.match(/Votes?\s*(?:total)?\s*[:：]\s*([\d\s]+)/i)
    if (match) return parseInt(match[1].replace(/\s/g, ''), 10)
  } catch {}
  return 0
}

export default defineEventHandler(async () => {
  const now = Date.now()

  if (cachedVotes !== null && now - cacheTimestamp < CACHE_DURATION) {
    return { totalVotes: cachedVotes }
  }

  const [lsm, sp] = await Promise.all([fetchListeServeurs(), fetchServeurPrive()])

  const total = lsm + sp
  if (total > 0) {
    cachedVotes = total
    cacheTimestamp = now
  }

  return { totalVotes: cachedVotes ?? 680 }
})
