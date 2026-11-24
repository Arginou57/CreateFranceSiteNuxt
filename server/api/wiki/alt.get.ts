// GET /api/wiki/alt?path=/wiki/<slug> or /en/wiki/<slug> : the same page in each language (language switcher of the navbar)
import { useWiki } from '../../lib/wikiCore'

export default defineEventHandler(async (event) => {
  const raw = String(getQuery(event).path || '')
  const path = raw.length > 1 ? raw.replace(/\/+$/, '') : raw
  setHeader(event, 'cache-control', 'public, max-age=3600')
  if (path === '/wiki' || path === '/en/wiki') return { fr: '/wiki', en: '/en/wiki' }
  const m = path.match(/^(\/en)?\/wiki\/([^/]+)$/)
  if (!m) return null
  const w = await useWiki()
  const page = w.find(decodeURIComponent(m[2]), m[1] ? 'en' : 'fr')
  return page ? { fr: w.pagePath(page, 'fr')!, en: w.pagePath(page, 'en') } : null
})
