import { defineEventHandler } from 'h3'

interface GalleryImage {
  url: string
  type: 'image' | 'gif'
}

let cachedImages: GalleryImage[] | null = null
let cacheTimestamp = 0
const CACHE_DURATION = 60 * 60 * 1000 // 1 hour

// Seules les images uploadées directement sur CurseForge (attachments)
// sont considérées comme du contenu de galerie — exclut badges et bannières.
const CONTENT_HOST = 'media.forgecdn.net/attachments'

export default defineEventHandler(async () => {
  const now = Date.now()

  if (cachedImages !== null && now - cacheTimestamp < CACHE_DURATION) {
    return { images: cachedImages }
  }

  try {
    const res = await fetch(
      'https://api.cfwidget.com/minecraft/modpacks/serveur-create-france-communauty-friends-coop'
    )

    if (res.ok) {
      const data = await res.json()
      const description: string = data.description || ''

      const seen = new Set<string>()
      const images: GalleryImage[] = []

      for (const match of description.matchAll(/<img[^>]+src="([^"]+)"/g)) {
        const url = match[1]
        if (!url.includes(CONTENT_HOST)) continue
        if (seen.has(url)) continue
        seen.add(url)
        images.push({
          url,
          type: url.toLowerCase().endsWith('.gif') ? 'gif' : 'image',
        })
      }

      if (images.length > 0) {
        cachedImages = images
        cacheTimestamp = now
        return { images }
      }
    }

    return { images: cachedImages ?? [] }
  } catch {
    return { images: cachedImages ?? [] }
  }
})
