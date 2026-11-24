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
// _categories.json : chaque catégorie a { id, mod, icon, name, description, en: { name, description } } ; "mod" renvoie à
// _mods.json (Create, Create Big Cannons, Create Diesel Generators… : ordre d'affichage, version, icône, parcours débutant).
// Recettes (23/11) : "recipe.items" = la grille en identifiants d'objets (même forme que "grid", communs aux deux langues)
// et "recipe.resultItem" ; les icônes sont dans public/wiki-items/<ns>/<chemin>.png (WIKI/recipe_items.py remplit les
// identifiants, WIKI/recipe_icons.py dessine les icônes : à relancer quand une page apporte un nouvel objet).
// Le sitemap (server/routes/sitemap.xml.ts), les hreflang et le sélecteur de langue suivent ces fichiers tout seuls.

export type WikiLocale = 'fr' | 'en'

export interface WikiFact { label: string; value: string }
/** grid = names shown in each language; items = the same grid as item ids (icons, links), resultItem = the crafted item. */
export interface WikiRecipe { label: string; grid: (string | null)[][]; items?: (string | null)[][]; result: string; resultItem?: string }
/** A key moment of a video (like the keyframes of the in-game Ponder timeline): time in seconds, and the page section
 * it explains (its title is the chapter label, in each language) or an explicit label. */
export interface WikiChapter { t: number; section?: string; label?: string }
export interface WikiVideo { id: string; name: string; description: string; duration: string; chapters?: WikiChapter[] }
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

export interface WikiCategory {
  id: string
  /** id of the mod the category belongs to (_mods.json) */
  mod: string
  /** item id whose icon stands for the category */
  icon?: string
  name: string
  description: string
  en?: { name?: string; description?: string }
}

/** _mods.json: one entry per mod covered by the wiki, in display order, with its beginner path. */
export interface WikiMod {
  id: string
  name: string
  version: string
  icon: string
  description: string
  start: { slug: string; label: string }[]
  en?: { name?: string; description?: string; start?: string[] }
}

const files = import.meta.glob('../content/wiki/*.json', { eager: true, import: 'default' }) as Record<string, unknown>

export const WIKI_SITE = 'https://create-france.com'
export const WIKI_LAUNCHER = '/launcher/CreateFrance-Launcher-Setup.exe'
export const WIKI_DISCORD = 'https://discord.gg/JW7XQKPpVC'

export const wikiCategories: WikiCategory[] = (files['../content/wiki/_categories.json'] as WikiCategory[]) || []
export const wikiMods: WikiMod[] = (files['../content/wiki/_mods.json'] as WikiMod[]) || []

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
      ...fr.recipe,
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

/** A mod in one language (the beginner path keeps only the pages that exist in that language). */
export function getWikiMod(id: string, locale: WikiLocale = 'fr'): WikiMod | undefined {
  const m = wikiMods.find((x) => x.id === id)
  if (!m) return undefined
  const en = locale === 'en' ? m.en : undefined
  return {
    ...m,
    name: en?.name || m.name,
    description: en?.description || m.description,
    start: m.start.map((s, i) => ({ slug: s.slug, label: en?.start?.[i] || s.label })),
  }
}

export interface WikiTreeMod extends WikiMod {
  count: number
  cats: (WikiCategory & { pages: WikiPageView[] })[]
}

/** Mods > categories > pages of one language, without the mods and categories that have no page yet. */
export function wikiTree(locale: WikiLocale): WikiTreeMod[] {
  const pages = wikiPagesIn(locale)
  return wikiMods
    .map((m) => {
      const cats = wikiCategories
        .filter((c) => c.mod === m.id)
        .map((c) => ({ ...getWikiCategory(c.id, locale)!, pages: pages.filter((p) => p.category === c.id) }))
        .filter((c) => c.pages.length)
      return { ...getWikiMod(m.id, locale)!, cats, count: cats.reduce((n, c) => n + c.pages.length, 0) }
    })
    .filter((m) => m.count > 0)
}

/** Mod of a page (through its category). */
export function wikiModOf(page: Pick<WikiPage, 'category'>): string {
  return wikiCategories.find((c) => c.id === page.category)?.mod || 'create'
}

// Item icons (public/wiki-items/<namespace>/<path>.png, 128 px, rendered by WIKI/recipe_icons.py from the mod models).
// Bump ICON_VERSION when the icons are re-rendered (Cloudflare caches them under the same URL).
const ICON_VERSION = '1'

/** Icon of an item id ("create:shaft"), or null for an empty slot. */
export function wikiItemIcon(id: string | null | undefined): string | null {
  if (!id || !id.includes(':')) return null
  const [ns, path] = id.split(':')
  return `/wiki-items/${ns}/${path}.png?v=${ICON_VERSION}`
}

/** Page that documents an item: its blockId, else the page whose recipe crafts it. */
export function wikiPageForItem(id: string): WikiPage | undefined {
  return wikiPages.find((p) => p.blockId === id) || wikiPages.find((p) => p.recipe?.resultItem === id)
}

/** Pages whose recipe uses this item (« sert à fabriquer »), the page itself excluded. */
export function wikiPagesUsing(id: string, exceptSlug?: string): WikiPage[] {
  return wikiPages.filter((p) => p.slug !== exceptSlug && p.recipe?.items?.some((row) => row.includes(id)))
}

// Key moments of the videos kept apart from the pages (content/wiki/_chapters.json, { "<slug-fr>": { "<video id>": [{ t, section }] } }),
// so they can be filled for every page without touching the page files; a "chapters" field in the page wins.
const chapterFile = (files['../content/wiki/_chapters.json'] as Record<string, Record<string, WikiChapter[]>>) || {}

// Extra « related » links kept apart from the pages (content/wiki/_related.json, { "<slug-fr>": ["<slug-fr>", ...] }), so the
// main session can link new series from existing pages while other agents edit those page files.
const relatedFile = (files['../content/wiki/_related.json'] as Record<string, string[]>) || {}

/** related slugs of a page: its own field, then the extra ones (no duplicates) */
export function wikiRelated(page: Pick<WikiPage, 'slug' | 'related'>): string[] {
  const out = [...(page.related || [])]
  for (const s of relatedFile[page.slug] || []) if (!out.includes(s)) out.push(s)
  return out
}

export function wikiVideoChapters(slug: string, v: WikiVideo): WikiChapter[] {
  return v.chapters?.length ? v.chapters : chapterFile[slug]?.[v.id] || []
}

// Videos that have loupe data (/wiki-media/<slug>/<video id>_loupe.json, written by WIKI/loupe_export.py):
// content/wiki/_loupe.json = { "<slug-fr>": ["<video id>", ...] }
const loupeFile = (files['../content/wiki/_loupe.json'] as Record<string, string[]>) || {}

// Ponder-like overlays of a video (content/wiki/_ponder.json, { "<slug-fr>": { "<video id>": { bubbles, controls } } }):
// text bubbles written by us (never the mod's texts) and control hints (mouse clicks, keys), drawn over the video by the
// player at video time t, anchored at « at » (0..1000 of the frame, from the loupe projection).
export interface WikiPonderBubble { t: number; until?: number; at: [number, number]; fr: string; en?: string }
export interface WikiPonderControl { t: number; d: number; at: [number, number]; actions?: string[]; keys?: string[] }
export interface WikiPonder { bubbles?: WikiPonderBubble[]; controls?: WikiPonderControl[] }
const ponderFile = (files['../content/wiki/_ponder.json'] as Record<string, Record<string, WikiPonder>>) || {}

export function wikiVideoPonder(slug: string, videoId: string): WikiPonder | null {
  return ponderFile[slug]?.[videoId] || null
}

// Bump when the *_loupe.json files are regenerated (names, outlines): Cloudflare keeps /wiki-media/ under the same URL.
export const LOUPE_VERSION = '2'

export function wikiVideoHasLoupe(slug: string, videoId: string): boolean {
  return !!loupeFile[slug]?.includes(videoId)
}

// Cloudflare keeps /wiki-media/ 30 days under the same URL: every medium gets ?v=<dateModified of its page>, plus the
// counter of _media_versions.json ({ "<slug-fr>": n }) to bump when a page's media are re-rendered without a page edit.
const mediaVersions = (files['../content/wiki/_media_versions.json'] as Record<string, number | string>) || {}

/** Public path of a page medium: /wiki-media/<slug-fr>/<file>?v=… (shared by both languages). */
export function wikiMedia(slug: string, file: string): string {
  const date = getWikiPage(slug)?.dateModified
  const n = mediaVersions[slug]
  const v = [date, n].filter((x) => x !== undefined && x !== '').join('.')
  return `/wiki-media/${slug}/${file}${v ? `?v=${v}` : ''}`
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
