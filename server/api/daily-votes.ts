import { defineEventHandler } from 'h3'

let cached: { votesToday: number; date: string } | null = null
let cacheTimestamp = 0
const CACHE_DURATION = 60 * 1000 // 1 minute

export default defineEventHandler(async () => {
  const now = Date.now()

  if (cached !== null && now - cacheTimestamp < CACHE_DURATION) {
    return cached
  }

  const apiUrl = 'https://www.liste-serveurs-minecraft.org/wp-content/themes/DL/mcstat-master/stats/207127.json'

  try {
    const res = await fetch(apiUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; CreateFranceBot/1.0)',
      },
    })
    const data = await res.json()

    const d = new Date()
    const today = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0')

    let totalVotes = 0
    for (const key of Object.keys(data)) {
      if (key.startsWith(today) && data[key].votes) {
        totalVotes += data[key].votes
      }
    }

    cached = { votesToday: totalVotes, date: today }
    cacheTimestamp = now
    return cached
  } catch {
    return cached ?? { votesToday: 0, date: '' }
  }
})
