// URL paths of the same page in French and in English, from the current path alone (no page state), so the language
// switcher, the hreflang tags and the sitemap always agree, on the server as on the client.
//   /            <-> /en
//   /wiki        <-> /en/wiki
//   /wiki/<fr>   <-> /en/wiki/<slugEn>   (en = null when the page is not translated yet)
export interface AltPaths { fr: string; en: string | null }

export function alternatesFor(path: string): AltPaths | null {
  const p = path.length > 1 ? path.replace(/\/+$/, '') : path
  if (p === '/' || p === '' || p === '/en') return { fr: '/', en: '/en' }
  if (p === '/wiki' || p === '/en/wiki') return { fr: '/wiki', en: '/en/wiki' }
  const m = p.match(/^(\/en)?\/wiki\/([^/]+)$/)
  if (m) {
    const page = findWikiPage(decodeURIComponent(m[2]), m[1] ? 'en' : 'fr')
    if (page) return { fr: wikiPagePath(page, 'fr')!, en: wikiPagePath(page, 'en') }
  }
  return null
}
