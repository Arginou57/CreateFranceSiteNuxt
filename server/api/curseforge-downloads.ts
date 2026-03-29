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
    // API publique CurseForge Widget (pas besoin de clé API)
    const res = await fetch(
      'https://api.cfwidget.com/minecraft/modpacks/serveur-create-france-communauty-friends-coop'
    )

    if (res.ok) {
      const data = await res.json()
      if (data.downloads && data.downloads.total) {
        cachedDownloads = data.downloads.total
        cacheTimestamp = now
        return { downloads: cachedDownloads }
      }
    }

    return { downloads: cachedDownloads ?? 16147 }
  } catch {
    return { downloads: cachedDownloads ?? 16147 }
  }
})
