import { defineEventHandler } from 'h3'

let cached: { votesToday: number; date: string } | null = null
let cacheTimestamp = 0
const CACHE_DURATION = 60 * 1000 // 1 minute

const headers = {
  'User-Agent': 'Mozilla/5.0 (compatible; CreateFranceBot/1.0)',
}

async function fetchListeServeursDailyVotes(): Promise<number> {
  try {
    const res = await fetch(
      'https://www.liste-serveurs-minecraft.org/wp-content/themes/DL/mcstat-master/stats/207127.json',
      { headers }
    )
    const data = await res.json()

    const d = new Date()
    const today = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0')

    let totalVotes = 0
    for (const key of Object.keys(data)) {
      if (key.startsWith(today) && data[key].votes) {
        totalVotes += data[key].votes
      }
    }
    return totalVotes
  } catch {}
  return 0
}

async function fetchServeurPriveDailyVotes(): Promise<number> {
  try {
    const res = await fetch('https://serveur-prive.net/minecraft/serveur-create-france', { headers })
    const html = await res.text()
    // Extrait les données du chart: data: [13,28,24,38,55,70,4] -> dernier = aujourd'hui
    const match = html.match(/data:\s*\[([\d,]+)\]/)
    if (match) {
      const values = match[1].split(',').map(Number)
      return values[values.length - 1] || 0
    }
  } catch {}
  return 0
}

export default defineEventHandler(async () => {
  const now = Date.now()

  if (cached !== null && now - cacheTimestamp < CACHE_DURATION) {
    return cached
  }

  const [lsm, sp] = await Promise.all([
    fetchListeServeursDailyVotes(),
    fetchServeurPriveDailyVotes(),
  ])

  const d = new Date()
  const today = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0')

  cached = { votesToday: lsm + sp, date: today }
  cacheTimestamp = now
  return cached
})
