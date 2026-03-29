import { defineEventHandler } from 'h3'

let cachedDownloads: number | null = null
let cacheTimestamp = 0
const CACHE_DURATION = 60 * 60 * 1000 // 1 hour

export default defineEventHandler(async () => {
  const now = Date.now()

  if (cachedDownloads !== null && now - cacheTimestamp < CACHE_DURATION) {
    return { downloads: cachedDownloads }
  }

  try {
    const res = await fetch(
      'https://api.curseforge.com/v1/mods/search?gameId=432&slug=serveur-create-france-communauty-friends-coop',
      {
        headers: {
          'Accept': 'application/json',
        },
      }
    )

    if (!res.ok) {
      // Fallback: scrape the CurseForge page
      const pageRes = await fetch(
        'https://www.curseforge.com/minecraft/modpacks/serveur-create-france-communauty-friends-coop'
      )
      const html = await pageRes.text()
      const match = html.match(/Downloads<\/dt>\s*<dd[^>]*>([\d,]+)/)
      if (match) {
        cachedDownloads = parseInt(match[1].replace(/,/g, ''), 10)
        cacheTimestamp = now
        return { downloads: cachedDownloads }
      }
      return { downloads: 16147 }
    }

    const data = await res.json()
    if (data.data && data.data.length > 0) {
      cachedDownloads = data.data[0].downloadCount
      cacheTimestamp = now
      return { downloads: cachedDownloads }
    }

    return { downloads: 16147 }
  } catch {
    return { downloads: cachedDownloads ?? 16147 }
  }
})
