// Wiki data and logic, SERVER ONLY. The page files (content/wiki/*.json, ~200 pages, several MB) used to be bundled in the
// client JavaScript (3.5 MB on every page of the site); now they are read here from the Nitro server assets
// (nuxt.config.ts → nitro.serverAssets « wiki ») and the pages receive only what they show, through /api/wiki/*.
// Format of the files: see utils/wiki.ts (types) and DeadZoneVideo/out/A_POSTER/CREATE_FRANCE/WIKI/FORMAT_PAGE.md.
import type {
  WikiCategory, WikiChapter, WikiLocale, WikiMod, WikiPage, WikiPageView, WikiPonder, WikiVideo,
} from '../../utils/wiki'
import { LOUPE_VERSION, wikiItemIcon } from '../../utils/wiki'

export interface WikiData {
  pages: WikiPage[]
  categories: WikiCategory[]
  mods: WikiMod[]
  chapters: Record<string, Record<string, WikiChapter[]>>
  related: Record<string, string[]>
  loupe: Record<string, string[]>
  ponder: Record<string, Record<string, WikiPonder>>
  mediaVersions: Record<string, number | string>
}

async function readJson(storage: ReturnType<typeof useStorage>, key: string): Promise<any> {
  const raw: any = await storage.getItemRaw(key)
  if (raw == null) return null
  if (typeof raw === 'string') return JSON.parse(raw)
  if (raw instanceof Uint8Array || (typeof Buffer !== 'undefined' && Buffer.isBuffer(raw))) return JSON.parse(new TextDecoder().decode(raw))
  return typeof raw === 'object' ? raw : JSON.parse(String(raw))
}

let cache: Promise<Wiki> | null = null

/** The wiki (read once in production; re-read on every call in dev so edits show up). */
export function useWiki(): Promise<Wiki> {
  if (cache && !import.meta.dev) return cache
  cache = (async () => {
    const storage = useStorage('assets:wiki')
    const keys = (await storage.getKeys()).filter((k) => k.endsWith('.json'))
    const data: WikiData = { pages: [], categories: [], mods: [], chapters: {}, related: {}, loupe: {}, ponder: {}, mediaVersions: {} }
    for (const key of keys) {
      const name = key.split(':').pop()!
      const v = await readJson(storage, key)
      if (!v) continue
      if (name === '_categories.json') data.categories = v
      else if (name === '_mods.json') data.mods = v
      else if (name === '_chapters.json') data.chapters = v
      else if (name === '_related.json') data.related = v
      else if (name === '_loupe.json') data.loupe = v
      else if (name === '_ponder.json') data.ponder = v
      else if (name === '_media_versions.json') data.mediaVersions = v
      else if (!name.startsWith('_') && v.slug) data.pages.push(v)
    }
    data.pages.sort((a, b) => a.name.localeCompare(b.name, 'fr'))
    return new Wiki(data)
  })()
  return cache
}

export class Wiki {
  readonly bySlug = new Map<string, WikiPage>()
  readonly byEn = new Map<string, WikiPage>()

  constructor(readonly d: WikiData) {
    for (const p of d.pages) {
      this.bySlug.set(p.slug, p)
      if (p.en?.slugEn) this.byEn.set(p.en.slugEn, p)
    }
  }

  get pages() { return this.d.pages }

  pagePath(page: WikiPage, locale: WikiLocale): string | null {
    if (locale === 'en') return page.en?.slugEn ? `/en/wiki/${page.en.slugEn}` : null
    return `/wiki/${page.slug}`
  }

  get(slug: string) { return this.bySlug.get(slug) }

  /** Page by the slug of its URL in a language (French slug for fr, slugEn for en). */
  find(urlSlug: string, locale: WikiLocale) { return locale === 'en' ? this.byEn.get(urlSlug) : this.bySlug.get(urlSlug) }

  /** In English HTML: /wiki/<slug-fr> → /en/wiki/<slug-en>, /wiki → /en/wiki (safety net for links left in French). */
  private rewriteEnLinks(html: string): string {
    return html.replace(/href="\/wiki(?:\/([a-z0-9-]+))?(#[^"]*)?"/g, (whole, slug: string | undefined, hash: string | undefined) => {
      if (!slug) return `href="/en/wiki${hash || ''}"`
      const target = this.get(slug)
      const path = target && this.pagePath(target, 'en')
      return path ? `href="${path}${hash || ''}"` : whole
    })
  }

  /** The page in one language, every missing English field falling back to French. */
  localize(page: WikiPage, locale: WikiLocale): WikiPageView {
    const { en, ...fr } = page
    const paths = { fr: this.pagePath(page, 'fr')!, en: this.pagePath(page, 'en') }
    if (locale !== 'en' || !en) return { ...fr, locale: 'fr', path: paths.fr, paths }
    const html = (s: string) => this.rewriteEnLinks(s)
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

  private viewCache = new Map<WikiLocale, WikiPageView[]>()

  /** Pages that exist in a language, localized and sorted by their name in that language. */
  pagesIn(locale: WikiLocale): WikiPageView[] {
    let v = this.viewCache.get(locale)
    if (!v) {
      v = this.d.pages.filter((p) => this.pagePath(p, locale)).map((p) => this.localize(p, locale))
        .sort((a, b) => a.name.localeCompare(b.name, locale))
      this.viewCache.set(locale, v)
    }
    return v
  }

  category(id: string, locale: WikiLocale = 'fr'): WikiCategory | undefined {
    const c = this.d.categories.find((x) => x.id === id)
    if (!c || locale !== 'en' || !c.en) return c
    return { ...c, name: c.en.name || c.name, description: c.en.description || c.description }
  }

  mod(id: string, locale: WikiLocale = 'fr'): WikiMod | undefined {
    const m = this.d.mods.find((x) => x.id === id)
    if (!m) return undefined
    const en = locale === 'en' ? m.en : undefined
    return {
      ...m,
      name: en?.name || m.name,
      description: en?.description || m.description,
      start: m.start.map((s, i) => ({ slug: s.slug, label: en?.start?.[i] || s.label })),
    }
  }

  modOf(page: Pick<WikiPage, 'category'>): string {
    return this.d.categories.find((c) => c.id === page.category)?.mod || 'create'
  }

  /** Page that documents an item: its blockId, else the page whose recipe crafts it. */
  pageForItem(id: string): WikiPage | undefined {
    return this.d.pages.find((p) => p.blockId === id) || this.d.pages.find((p) => p.recipe?.resultItem === id)
  }

  /** Pages whose recipe uses this item, the page itself excluded. */
  pagesUsing(id: string, exceptSlug?: string): WikiPage[] {
    return this.d.pages.filter((p) => p.slug !== exceptSlug && p.recipe?.items?.some((row) => row.includes(id)))
  }

  related(page: Pick<WikiPage, 'slug' | 'related'>): string[] {
    const out = [...(page.related || [])]
    for (const s of this.d.related[page.slug] || []) if (!out.includes(s)) out.push(s)
    return out
  }

  chapters(slug: string, v: WikiVideo): WikiChapter[] {
    return v.chapters?.length ? v.chapters : this.d.chapters[slug]?.[v.id] || []
  }

  ponder(slug: string, videoId: string): WikiPonder | null {
    return this.d.ponder[slug]?.[videoId] || null
  }

  hasLoupe(slug: string, videoId: string): boolean {
    return !!this.d.loupe[slug]?.includes(videoId)
  }

  /** Public path of a page medium: /wiki-media/<slug-fr>/<file>?v=<dateModified>.<counter> (Cloudflare cache buster). */
  media(slug: string, file: string): string {
    const date = this.get(slug)?.dateModified
    const n = this.d.mediaVersions[slug]
    const v = [date, n].filter((x) => x !== undefined && x !== '').join('.')
    return `/wiki-media/${slug}/${file}${v ? `?v=${v}` : ''}`
  }

  videoFiles(slug: string, id: string) {
    const loupe = this.hasLoupe(slug, id) ? this.media(slug, `${id}_loupe.json`) : null
    return {
      webm: this.media(slug, `${id}.webm`),
      mp4: this.media(slug, `${id}.mp4`),
      poster: this.media(slug, `${id}_poster.jpg`),
      loupe: loupe && `${loupe}${loupe.includes('?') ? '&' : '?'}lv=${LOUPE_VERSION}`,
    }
  }

  /** Thumbnail of a page: poster of its first video, else its first step image. */
  cover(p: Pick<WikiPage, 'slug' | 'videos' | 'sections'>): string {
    if (p.videos[0]) return this.videoFiles(p.slug, p.videos[0].id).poster
    const img = p.sections.find((s) => s.image)?.image
    return img ? this.media(p.slug, img) : '/images/fond.png'
  }

  icon(id: string | null | undefined) { return wikiItemIcon(id) }
}
