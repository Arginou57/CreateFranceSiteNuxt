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
//
// ─── 24/11 : CLIENT LÉGER ───
// Ce fichier ne contient plus que des types et de petites fonctions. Les données (pages, catégories, mods, _chapters,
// _related, _loupe, _ponder, _media_versions) sont lues côté serveur (server/lib/wikiCore.ts) et servies par
// /api/wiki/home, /api/wiki/page, /api/wiki/search et /api/wiki/items : le navigateur ne télécharge plus tout le wiki
// (3,5 Mo de JavaScript sur chaque page du site avant ce changement). N'importe jamais les JSON du wiki ici.

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

// Ponder-like overlays of a video (content/wiki/_ponder.json, { "<slug-fr>": { "<video id>": { bubbles, controls } } }):
// text bubbles written by us (never the mod's texts) and control hints (mouse clicks, keys), drawn over the video by the
// player at video time t, anchored at « at » (0..1000 of the frame, from the loupe projection).
export interface WikiPonderBubble { t: number; until?: number; at: [number, number]; fr: string; en?: string }
export interface WikiPonderControl { t: number; d: number; at: [number, number]; actions?: string[]; keys?: string[]; item?: string }
export interface WikiPonder { bubbles?: WikiPonderBubble[]; controls?: WikiPonderControl[] }

// ---------------------------------------------------------------- what /api/wiki/* returns
export interface WikiNavPage { slug: string; name: string; path: string; blockId: string; description?: string }
export interface WikiNavCat { id: string; name: string; description: string; icon?: string; pages: WikiNavPage[] }
export interface WikiNavMod {
  id: string
  name: string
  version: string
  icon: string
  description: string
  count: number
  /** listed only for the current mod (article) or for every mod (home) */
  cats: WikiNavCat[]
  start: { label: string; page: WikiNavPage }[]
}

export interface WikiHomeView {
  count: number
  mods: WikiNavMod[]
  latest: { path: string; name: string; category: string; cover: string }[]
  parts: { headline: string; path: string }[]
  ogImage: string
}

export interface WikiVideoFiles { webm: string; mp4: string; poster: string; loupe: string | null }
export interface WikiVideoView {
  id: string
  name: string
  description: string
  duration: string
  files: WikiVideoFiles
  chapters: { t: number; label: string }[]
  ponder: WikiPonder | null
}

export interface WikiRecipeView {
  label: string
  result: string
  count: number
  resultIcon: string | null
  cells: { name: string | null; icon: string | null }[][]
  ingredients: { name: string; icon: string | null; count: number; path: string | null }[]
}

export interface WikiArticleView {
  page: {
    slug: string
    name: string
    blockId: string
    title: string
    description: string
    intro: string
    datePublished: string
    dateModified: string
    createVersion: string
    mcVersion: string
    facts: WikiFact[]
    sources: string[]
    paths: { fr: string; en: string | null }
    path: string
    cover: string
    videos: WikiVideoView[]
    sections: (WikiSection & { imageUrl?: string })[]
  }
  recipe: WikiRecipeView | null
  category: { id: string; name: string } | null
  mod: { id: string; name: string } | null
  related: { slug: string; path: string; name: string; category: string; cover: string }[]
  usedIn: { slug: string; path: string; name: string; icon: string | null }[]
  prev: { path: string; name: string; icon: string | null } | null
  next: { path: string; name: string; icon: string | null } | null
  nav: WikiNavMod[]
}

export interface WikiSearchResult {
  name: string
  icon: string | null
  mod: string
  category: string
  section?: string
  href: string
  snippet: string
  marks: [number, number][]
}

// ---------------------------------------------------------------- small helpers (client and server)
export const WIKI_SITE = 'https://create-france.com'
export const WIKI_LAUNCHER = '/launcher/CreateFrance-Launcher-Setup.exe'
export const WIKI_DISCORD = 'https://discord.gg/JW7XQKPpVC'

export function wikiHomePath(locale: WikiLocale): string {
  return locale === 'en' ? '/en/wiki' : '/wiki'
}

export function wikiAbs(path: string): string {
  return WIKI_SITE + path
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

// Bump when the *_loupe.json files are regenerated (names, outlines): Cloudflare keeps /wiki-media/ under the same URL.
export const LOUPE_VERSION = '2'
