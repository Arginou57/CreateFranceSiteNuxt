// Wiki Create France : les pages sont des fichiers JSON (content/wiki/<slug>.json), faciles à générer en série.
// Médias servis depuis /wiki-media/<slug>/ (public/wiki-media/). Surtout pas /wiki/<slug>/ : un dossier public au même
// chemin qu'une page fait rediriger la page vers « …/ », en contradiction avec sa canonical (signalé par la Search Console).

export interface WikiFact { label: string; value: string }
export interface WikiRecipe { label: string; grid: (string | null)[][]; result: string }
export interface WikiVideo { id: string; name: string; description: string; duration: string }
export interface WikiSection { id: string; title: string; image?: string; alt?: string; video?: string; html: string }
export interface WikiPage {
  slug: string
  name: string
  blockId: string
  category: string
  title: string
  description: string
  datePublished: string
  dateModified: string
  createVersion: string
  mcVersion: string
  intro: string
  facts: WikiFact[]
  recipe?: WikiRecipe
  videos: WikiVideo[]
  sections: WikiSection[]
  related: string[]
  sources: string[]
}
export interface WikiCategory { id: string; name: string; description: string }

const files = import.meta.glob('../content/wiki/*.json', { eager: true, import: 'default' }) as Record<string, unknown>

export const WIKI_SITE = 'https://create-france.com'
export const WIKI_LAUNCHER = '/launcher/CreateFrance-Launcher-Setup.exe'
export const WIKI_DISCORD = 'https://discord.gg/JW7XQKPpVC'

export const wikiCategories: WikiCategory[] = (files['../content/wiki/_categories.json'] as WikiCategory[]) || []

export const wikiPages: WikiPage[] = Object.entries(files)
  .filter(([path]) => !path.split('/').pop()!.startsWith('_'))
  .map(([, page]) => page as WikiPage)
  .sort((a, b) => a.name.localeCompare(b.name, 'fr'))

export function getWikiPage(slug: string): WikiPage | undefined {
  return wikiPages.find((p) => p.slug === slug)
}

export function getWikiCategory(id: string): WikiCategory | undefined {
  return wikiCategories.find((c) => c.id === id)
}

/** Public path of a page medium: /wiki-media/<slug>/<file>. */
export function wikiMedia(slug: string, file: string): string {
  return `/wiki-media/${slug}/${file}`
}

export function wikiVideoFiles(slug: string, id: string) {
  return {
    webm: wikiMedia(slug, `${id}.webm`),
    mp4: wikiMedia(slug, `${id}.mp4`),
    poster: wikiMedia(slug, `${id}_poster.jpg`),
  }
}

export function wikiAbs(path: string): string {
  return WIKI_SITE + path
}
