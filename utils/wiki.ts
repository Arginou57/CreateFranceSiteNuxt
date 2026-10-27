// Wiki Create France : les pages sont des fichiers JSON (content/wiki/<slug>.json), faciles à générer en série.
// Médias servis depuis /wiki-media/<slug>/ (public/wiki-media/). Surtout pas /wiki/<slug>/ : un dossier public au même
// chemin qu'une page fait rediriger la page vers « …/ », en contradiction avec sa canonical (signalé par la Search Console).
//
// ─── FORMAT BILINGUE (fixé le 27/10, copie détaillée : DeadZoneVideo/out/A_POSTER/CREATE_FRANCE/WIKI/FORMAT_PAGE.md) ───
// Un seul fichier par page, content/wiki/<slug-fr>.json : le français au format du pilote + un objet "en" :
//   "en": {
//     "slugEn": "mechanical-press",          // OBLIGATOIRE : URL anglaise /en/wiki/<slugEn> (ASCII minuscules, tirets, unique)
//     "name", "title", "description", "intro",  // title ≤ 60 car. : « <Name> — Create mod guide »
//     "facts":    [{ label, value }],         // même nombre et même ordre que les facts français (associés par position)
//     "recipe":   { label, grid?, result? },  // grid de même forme que le français, noms anglais officiels
//     "videos":   [{ id, name, description }],// associées par id
//     "sections": [{ id, title, alt?, html }],// associées par id (même id qu'en français) ; jamais d'image/video ici
//     "sources":  [ ... ]                     // facultatif
//   }
// Communs aux deux langues (pris dans le français) : slug, blockId, category, dates, versions, related (slugs FR),
// images et vidéos (/wiki-media/<slug-fr>/…). Tout champ absent de "en" reprend le français. Sans slugEn, la page
// n'existe qu'en français. Dans le HTML anglais, les liens /wiki/<slug-fr> sont réécrits en /en/wiki/<slug-en>.
// _categories.json : chaque catégorie a { id, name, description, en: { name, description } }.
// Le sitemap (server/routes/sitemap.xml.ts), les hreflang et le sélecteur de langue suivent ces fichiers tout seuls.

export type WikiLocale = 'fr' | 'en'

export interface WikiFact { label: string; value: string }
export interface WikiRecipe { label: string; grid: (string | null)[][]; result: string }
export interface WikiVideo { id: string; name: string; description: string; duration: string }
export interface WikiSection { id: string; title: string; image?: string; alt?: string; video?: string; html: string }

export interface WikiPageEn {
  slugEn: string
  name?: string
  title?: string
  description?: string
  intro?: string
  facts?: WikiFact[]
  recipe?: Partial<WikiRecipe>
  videos?: { id: string; name?: string; description?: string }[]
  sections?: { id: string; title?: string; alt?: string; html?: string }[]
  sources?: string[]
}

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
  en?: WikiPageEn
}

/** A page as shown in one language: texts merged with the French fallback, `slug` stays the French one (media). */
export interface WikiPageView extends Omit<WikiPage, 'en'> {
  locale: WikiLocale
  /** URL path in this language, e.g. /wiki/presse-mecanique or /en/wiki/mechanical-press */
  path: string
  /** URL paths of the page in each language (null when the page has no English version) */
  paths: { fr: string; en: string | null }
}

export interface WikiCategory { id: string; name: string; description: string; en?: { name?: string; description?: string } }

const files = import.meta.glob('../content/wiki/*.json', { eager: true, import: 'default' }) as Record<string, unknown>

export const WIKI_SITE = 'https://create-france.com'
export const WIKI_LAUNCHER = '/launcher/CreateFrance-Launcher-Setup.exe'
export const WIKI_DISCORD = 'https://discord.gg/JW7XQKPpVC'

export const wikiCategories: WikiCategory[] = (files['../content/wiki/_categories.json'] as WikiCategory[]) || []

/** Raw pages (French data + optional "en" object), sorted by French name. */
export const wikiPages: WikiPage[] = Object.entries(files)
  .filter(([path]) => !path.split('/').pop()!.startsWith('_'))
  .map(([, page]) => page as WikiPage)
  .sort((a, b) => a.name.localeCompare(b.name, 'fr'))

export function wikiHomePath(locale: WikiLocale): string {
  return locale === 'en' ? '/en/wiki' : '/wiki'
}

/** URL path of a page in a language, or null if it is not translated into that language. */
export function wikiPagePath(page: WikiPage, locale: WikiLocale): string | null {
  if (locale === 'en') return page.en?.slugEn ? `/en/wiki/${page.en.slugEn}` : null
  return `/wiki/${page.slug}`
}

/** Page by its French slug (the file name). */
export function getWikiPage(slug: string): WikiPage | undefined {
  return wikiPages.find((p) => p.slug === slug)
}

/** Page by the slug of its URL in a language (French slug for fr, slugEn for en). */
export function findWikiPage(urlSlug: string, locale: WikiLocale): WikiPage | undefined {
  return locale === 'en'
    ? wikiPages.find((p) => p.en?.slugEn === urlSlug)
    : wikiPages.find((p) => p.slug === urlSlug)
}

/** In English HTML: /wiki/<slug-fr> → /en/wiki/<slug-en>, /wiki → /en/wiki (safety net for links left in French). */
function rewriteEnLinks(html: string): string {
  return html.replace(/href="\/wiki(?:\/([a-z0-9-]+))?(#[^"]*)?"/g, (whole, slug: string | undefined, hash: string | undefined) => {
    if (!slug) return `href="/en/wiki${hash || ''}"`
    const target = getWikiPage(slug)
    const path = target && wikiPagePath(target, 'en')
    return path ? `href="${path}${hash || ''}"` : whole
  })
}

/** The page in one language, every missing English field falling back to French. */
export function localizeWikiPage(page: WikiPage, locale: WikiLocale): WikiPageView {
  const { en, ...fr } = page
  const paths = { fr: wikiPagePath(page, 'fr')!, en: wikiPagePath(page, 'en') }
  if (locale !== 'en' || !en) return { ...fr, locale: 'fr', path: paths.fr, paths }
  const html = (s: string) => rewriteEnLinks(s)
  const sameShape = (g?: (string | null)[][]) =>
    !!g && !!fr.recipe && g.length === fr.recipe.grid.length && g.every((row, i) => row.length === fr.recipe!.grid[i].length)
  return {
    ...fr,
    locale: 'en',
    path: paths.en!,
    paths,
    name: en.name || fr.name,
    title: en.title || fr.title,
    description: en.description || fr.description,
    intro: html(en.intro || fr.intro),
    facts: fr.facts.map((f, i) => ({ label: en.facts?.[i]?.label || f.label, value: en.facts?.[i]?.value || f.value })),
    recipe: fr.recipe && {
      label: en.recipe?.label || fr.recipe.label,
      grid: sameShape(en.recipe?.grid) ? en.recipe!.grid! : fr.recipe.grid,
      result: en.recipe?.result || fr.recipe.result,
    },
    videos: fr.videos.map((v) => {
      const t = en.videos?.find((x) => x.id === v.id)
      return { ...v, name: t?.name || v.name, description: t?.description || v.description }
    }),
    sections: fr.sections.map((s) => {
      const t = en.sections?.find((x) => x.id === s.id)
      return { ...s, title: t?.title || s.title, alt: t?.alt || s.alt, html: html(t?.html || s.html) }
    }),
    sources: en.sources?.length ? en.sources : fr.sources,
  }
}

/** Pages that exist in a language, localized and sorted by their name in that language. */
export function wikiPagesIn(locale: WikiLocale): WikiPageView[] {
  return wikiPages
    .filter((p) => wikiPagePath(p, locale))
    .map((p) => localizeWikiPage(p, locale))
    .sort((a, b) => a.name.localeCompare(b.name, locale))
}

export function getWikiCategory(id: string, locale: WikiLocale = 'fr'): WikiCategory | undefined {
  const c = wikiCategories.find((x) => x.id === id)
  if (!c || locale !== 'en' || !c.en) return c
  return { ...c, name: c.en.name || c.name, description: c.en.description || c.description }
}

/** Public path of a page medium: /wiki-media/<slug-fr>/<file> (shared by both languages). */
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

/** Thumbnail of a page: poster of its first video, else its first step image (image-only pages). */
export function wikiCover(p: Pick<WikiPage, 'slug' | 'videos' | 'sections'>): string {
  if (p.videos[0]) return wikiVideoFiles(p.slug, p.videos[0].id).poster
  const img = p.sections.find((s) => s.image)?.image
  return img ? wikiMedia(p.slug, img) : '/images/fond.png'
}

export function wikiAbs(path: string): string {
  return WIKI_SITE + path
}
