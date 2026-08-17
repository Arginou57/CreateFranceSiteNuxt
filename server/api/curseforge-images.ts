import { defineEventHandler } from 'h3'

interface GalleryImage {
  url: string
  thumbnail?: string
  title?: string
  type: 'image' | 'gif'
}

const MOD_ID = 876457 // Serveur Create France sur CurseForge

let cachedImages: GalleryImage[] | null = null
let cacheTimestamp = 0
const CACHE_DURATION = 60 * 60 * 1000 // 1 hour

function imageType(url: string): 'image' | 'gif' {
  return url.toLowerCase().split('?')[0].endsWith('.gif') ? 'gif' : 'image'
}

// "Coucher_de_soleil_a_la_maison.png" -> "Coucher de soleil a la maison"
function cleanTitle(raw: string): string | undefined {
  const title = raw
    .replace(/\.(png|jpe?g|gif|webp)$/i, '')
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
  // Les noms techniques type "2026-04-21 11.41.30" ou "image" n'apportent rien
  if (!title || /^[\d\s.]+$/.test(title) || /^image$/i.test(title)) return undefined
  return title
}

// Source principale : la galerie officielle du modpack via l'API CurseForge
// (nécessite une clé gratuite — console.curseforge.com).
async function fetchFromGallery(apiKey: string): Promise<GalleryImage[]> {
  const res = await fetch(`https://api.curseforge.com/v1/mods/${MOD_ID}`, {
    headers: { 'x-api-key': apiKey, Accept: 'application/json' },
  })
  if (!res.ok) return []

  const { data } = await res.json()
  const screenshots: any[] = data?.screenshots ?? []

  return screenshots
    .filter((s) => s?.url)
    .map((s) => ({
      url: s.url,
      thumbnail: s.thumbnailUrl || undefined,
      title: s.title ? cleanTitle(s.title) : undefined,
      type: imageType(s.url),
    }))
}

// Repli sans clé API : images uploadées sur CurseForge dans la description
// du modpack (via cfwidget) — exclut badges et bannières externes.
async function fetchFromDescription(): Promise<GalleryImage[]> {
  const res = await fetch(
    'https://api.cfwidget.com/minecraft/modpacks/serveur-create-france-communauty-friends-coop'
  )
  if (!res.ok) return []

  const data = await res.json()
  const description: string = data.description || ''

  const seen = new Set<string>()
  const images: GalleryImage[] = []

  for (const match of description.matchAll(/<img[^>]+src="([^"]+)"/g)) {
    const url = match[1]
    if (!url.includes('media.forgecdn.net/attachments')) continue
    if (seen.has(url)) continue
    seen.add(url)
    images.push({ url, type: imageType(url) })
  }

  return images
}

export default defineEventHandler(async () => {
  const now = Date.now()

  if (cachedImages !== null && now - cacheTimestamp < CACHE_DURATION) {
    return { images: cachedImages }
  }

  try {
    const apiKey = useRuntimeConfig().curseforgeApiKey

    let images: GalleryImage[] = []
    if (apiKey) {
      images = await fetchFromGallery(apiKey)
    }
    if (images.length === 0) {
      images = await fetchFromDescription()
    }

    if (images.length > 0) {
      cachedImages = images
      cacheTimestamp = now
    }

    return { images: cachedImages ?? [] }
  } catch {
    return { images: cachedImages ?? [] }
  }
})
