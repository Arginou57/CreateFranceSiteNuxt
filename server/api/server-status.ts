import { defineEventHandler } from 'h3'

let cached: { players: number; max: number } | null = null
let cacheTimestamp = 0
const CACHE_DURATION = 30 * 1000 // 30 secondes

export default defineEventHandler(async () => {
  const now = Date.now()

  if (cached !== null && now - cacheTimestamp < CACHE_DURATION) {
    return cached
  }

  try {
    const res = await fetch('https://api.mcsrvstat.us/3/88.99.1.96:25566')
    const data = await res.json()

    if (data.online) {
      cached = {
        players: data.players?.online ?? 0,
        max: data.players?.max ?? 0,
      }
    } else {
      cached = { players: 0, max: 0 }
    }

    cacheTimestamp = now
    return cached
  } catch {
    return cached ?? { players: 0, max: 0 }
  }
})
