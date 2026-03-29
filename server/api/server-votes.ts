import { defineEventHandler } from 'h3'

let cachedVotes: number | null = null
let cacheTimestamp = 0
const CACHE_DURATION = 10 * 60 * 1000 // 10 minutes

export default defineEventHandler(async () => {
  const now = Date.now()

  if (cachedVotes !== null && now - cacheTimestamp < CACHE_DURATION) {
    return { totalVotes: cachedVotes }
  }

  try {
    const res = await fetch(
      'https://www.liste-serveurs-minecraft.org/?s=create+france',
      {
        headers: {
          'User-Agent': 'Mozilla/5.0 (compatible; CreateFranceBot/1.0)',
        },
      }
    )
    const html = await res.text()
    // Cherche le nombre de votes dans le HTML (ex: <i class="fa fa-thumbs-up" ...></i> 333)
    const match = html.match(/fa-thumbs-up[^>]*><\/i>\s*([\d\s]+)/)
    if (match) {
      cachedVotes = parseInt(match[1].replace(/\s/g, ''), 10)
      cacheTimestamp = now
      return { totalVotes: cachedVotes }
    }
    return { totalVotes: cachedVotes ?? 333 }
  } catch {
    return { totalVotes: cachedVotes ?? 333 }
  }
})
