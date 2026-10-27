// /sitemap.xml, built from content/wiki/*.json (bundled as server assets, see nitro.serverAssets in nuxt.config.ts):
// every new wiki page appears here on the next build, in French and, when it has "en.slugEn", in English, with the
// hreflang alternates (fr, en, x-default = fr). Same URLs as the canonicals: no trailing slash except the French home.
const SITE = 'https://create-france.com'

interface Entry { fr: string; en: string | null; lastmod?: string }

function esc(s: string) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

async function readJson(storage: ReturnType<typeof useStorage>, key: string): Promise<any> {
  const raw: any = await storage.getItemRaw(key)
  if (raw == null) return null
  if (typeof raw === 'string') return JSON.parse(raw)
  if (raw instanceof Uint8Array || (typeof Buffer !== 'undefined' && Buffer.isBuffer(raw))) {
    return JSON.parse(new TextDecoder().decode(raw))
  }
  return typeof raw === 'object' ? raw : JSON.parse(String(raw))
}

export default defineEventHandler(async (event) => {
  const storage = useStorage('assets:wiki')
  const keys = (await storage.getKeys()).filter((k) => k.endsWith('.json') && !k.split(':').pop()!.startsWith('_'))

  const pages: Entry[] = []
  for (const key of keys) {
    const p = await readJson(storage, key)
    if (!p?.slug) continue
    pages.push({
      fr: `/wiki/${p.slug}`,
      en: p.en?.slugEn ? `/en/wiki/${p.en.slugEn}` : null,
      lastmod: p.dateModified,
    })
  }
  pages.sort((a, b) => a.fr.localeCompare(b.fr))
  const wikiLastmod = pages.map((p) => p.lastmod || '').sort().pop() || undefined

  const entries: Entry[] = [
    { fr: '/', en: '/en' },
    { fr: '/wiki', en: '/en/wiki', lastmod: wikiLastmod },
    ...pages,
  ]

  const lines: string[] = []
  for (const e of entries) {
    const alternates = [
      `    <xhtml:link rel="alternate" hreflang="fr" href="${esc(SITE + e.fr)}"/>`,
      ...(e.en ? [`    <xhtml:link rel="alternate" hreflang="en" href="${esc(SITE + e.en)}"/>`] : []),
      `    <xhtml:link rel="alternate" hreflang="x-default" href="${esc(SITE + e.fr)}"/>`,
    ].join('\n')
    for (const loc of [e.fr, e.en]) {
      if (!loc) continue
      lines.push(
        `  <url>\n    <loc>${esc(SITE + loc)}</loc>\n${e.lastmod ? `    <lastmod>${esc(e.lastmod)}</lastmod>\n` : ''}${alternates}\n  </url>`,
      )
    }
  }

  setHeader(event, 'content-type', 'application/xml; charset=utf-8')
  setHeader(event, 'cache-control', 'public, max-age=3600')
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${lines.join('\n')}
</urlset>
`
})
