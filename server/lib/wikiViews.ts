// What each wiki screen needs, built on the server (see wikiCore.ts): the home, one article, the item → page map of the
// loupe. Types of the responses: utils/wiki.ts (WikiHomeView, WikiArticleView…).
import type {
  WikiArticleView, WikiHomeView, WikiLocale, WikiNavMod, WikiNavPage, WikiPageView, WikiRecipeView,
} from '../../utils/wiki'
import type { Wiki } from './wikiCore'

function navPage(w: Wiki, p: WikiPageView, withDesc = false): WikiNavPage {
  return { slug: p.slug, name: p.name, path: p.path, blockId: p.blockId, ...(withDesc ? { description: p.description } : {}) }
}

/** Mods > categories > pages. `fullFor` = the mods whose categories and pages are listed (all of them on the home). */
export function buildNav(w: Wiki, lang: WikiLocale, opts: { fullFor?: string | 'all'; withDesc?: boolean } = {}): WikiNavMod[] {
  const pages = w.pagesIn(lang)
  return w.d.mods
    .map((m0) => {
      const m = w.mod(m0.id, lang)!
      const cats = w.d.categories
        .filter((c) => c.mod === m.id)
        .map((c0) => {
          const c = w.category(c0.id, lang)!
          return { id: c.id, name: c.name, description: c.description, icon: c.icon, pages: pages.filter((p) => p.category === c.id) }
        })
        .filter((c) => c.pages.length)
      const count = cats.reduce((n, c) => n + c.pages.length, 0)
      const full = opts.fullFor === 'all' || opts.fullFor === m.id
      return {
        id: m.id,
        name: m.name,
        version: m.version,
        icon: m.icon,
        description: m.description,
        count,
        cats: full ? cats.map((c) => ({ ...c, pages: c.pages.map((p) => navPage(w, p, opts.withDesc)) })) : [],
        start: full
          ? m.start
            .map((s) => ({ label: s.label, page: pages.find((p) => p.slug === s.slug) }))
            .filter((s): s is { label: string; page: WikiPageView } => !!s.page)
            .map((s) => ({ label: s.label, page: navPage(w, s.page) }))
          : [],
      }
    })
    .filter((m) => m.count > 0)
}

export function buildHome(w: Wiki, lang: WikiLocale): WikiHomeView {
  const pages = w.pagesIn(lang)
  const latest = [...pages]
    .sort((a, b) => b.dateModified.localeCompare(a.dateModified) || b.datePublished.localeCompare(a.datePublished))
    .slice(0, 6)
    .map((p) => ({ path: p.path, name: p.name, category: w.category(p.category, lang)?.name || '', cover: w.cover(p) }))
  return {
    count: pages.length,
    mods: buildNav(w, lang, { fullFor: 'all', withDesc: true }),
    latest,
    parts: pages.map((p) => ({ headline: p.title, path: p.path })),
    ogImage: pages[0] ? w.cover(pages[0]) : '/images/fond.png',
  }
}

function recipeView(w: Wiki, p: WikiPageView, lang: WikiLocale): WikiRecipeView | null {
  const r = p.recipe
  if (!r) return null
  const by = new Map<string, { name: string; icon: string | null; count: number; path: string | null }>()
  const cells = r.grid.map((row, i) => row.map((name, j) => {
    if (!name) return { name: null, icon: null }
    const id = r.items?.[i]?.[j] || null
    const key = id || name
    const cur = by.get(key)
    if (cur) cur.count++
    else {
      const page = id ? w.pageForItem(id) : undefined
      by.set(key, { name, icon: w.icon(id), count: 1, path: page && page.slug !== p.slug ? w.pagePath(page, lang) : null })
    }
    return { name, icon: w.icon(id) }
  }))
  return {
    label: r.label,
    result: r.result,
    count: Number.parseInt(r.result, 10) || 1,
    resultIcon: w.icon(r.resultItem),
    cells,
    ingredients: [...by.values()],
  }
}

/** Everything an article shows; null when the URL slug is unknown in that language. */
export function buildArticle(w: Wiki, urlSlug: string, lang: WikiLocale): WikiArticleView | null {
  const raw = w.find(urlSlug, lang)
  if (!raw) return null
  const p = w.localize(raw, lang)
  const cat = w.category(p.category, lang)
  const modId = w.modOf(p)
  const mod = w.mod(modId, lang)

  const videos = p.videos.map((v) => {
    // consecutive moments explained by the same section are one chapter; a single chapter is not worth a list
    const chapters: { t: number; label: string; section?: string }[] = []
    for (const c of [...w.chapters(p.slug, v)].sort((a, b) => a.t - b.t)) {
      if (chapters.length && c.section && chapters[chapters.length - 1].section === c.section) continue
      chapters.push({ t: c.t, section: c.section, label: c.label || p.sections.find((s) => s.id === c.section)?.title || '' })
    }
    return {
      id: v.id,
      name: v.name,
      description: v.description,
      duration: v.duration,
      files: w.videoFiles(p.slug, v.id),
      chapters: chapters.length >= 2 ? chapters.map(({ t, label }) => ({ t, label })) : [],
      ponder: w.ponder(p.slug, v.id),
    }
  })

  const sibl = w.pagesIn(lang).filter((x) => x.category === p.category)
  const pos = sibl.findIndex((x) => x.slug === p.slug)
  const nb = (x?: WikiPageView) => (x ? { path: x.path, name: x.name, icon: w.icon(x.blockId) } : null)

  return {
    page: {
      slug: p.slug,
      name: p.name,
      blockId: p.blockId,
      title: p.title,
      description: p.description,
      intro: p.intro,
      datePublished: p.datePublished,
      dateModified: p.dateModified,
      createVersion: p.createVersion,
      mcVersion: p.mcVersion,
      facts: p.facts,
      sources: p.sources,
      paths: p.paths,
      path: p.path,
      cover: w.cover(p),
      videos,
      sections: p.sections.map((s) => ({ ...s, imageUrl: s.image ? w.media(p.slug, s.image) : undefined })),
    },
    recipe: recipeView(w, p, lang),
    category: cat ? { id: cat.id, name: cat.name } : null,
    mod: mod ? { id: mod.id, name: mod.name } : null,
    related: w.related(p)
      .map((s) => w.get(s))
      .filter((x): x is NonNullable<typeof x> => !!x && !!w.pagePath(x, lang))
      .map((x) => w.localize(x, lang))
      .map((x) => ({ slug: x.slug, path: x.path, name: x.name, category: w.category(x.category, lang)?.name || '', cover: w.cover(x) })),
    usedIn: w.pagesUsing(p.blockId, p.slug)
      .filter((x) => w.pagePath(x, lang))
      .map((x) => w.localize(x, lang))
      .map((x) => ({ slug: x.slug, path: x.path, name: x.name, icon: w.icon(x.recipe?.resultItem || x.blockId) })),
    prev: nb(pos > 0 ? sibl[pos - 1] : undefined),
    next: nb(pos >= 0 && pos < sibl.length - 1 ? sibl[pos + 1] : undefined),
    nav: buildNav(w, lang, { fullFor: modId }),
  }
}

/** item id → { path, slug } of the page that documents it (loupe links), in one language */
export function buildItemPages(w: Wiki, lang: WikiLocale): Record<string, { path: string; slug: string }> {
  const out: Record<string, { path: string; slug: string }> = {}
  for (const p of w.pages) {
    const path = w.pagePath(p, lang)
    if (!path) continue
    for (const id of [p.recipe?.resultItem, p.blockId]) {
      if (id && !out[id]) out[id] = { path, slug: p.slug }
    }
  }
  // blockId wins over « crafted by the recipe of »
  for (const p of w.pages) {
    const path = w.pagePath(p, lang)
    if (path && p.blockId) out[p.blockId] = { path, slug: p.slug }
  }
  return out
}
