// GET /api/wiki/search?q=<query>&lang=fr|en : the 8 best results (names, sections, snippets with highlights)
import { useWiki } from '../../lib/wikiCore'
import { toResult, wikiSearch } from '../../lib/wikiSearch'

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const lang = query.lang === 'en' ? 'en' : 'fr'
  const q = String(query.q || '').slice(0, 80)
  setHeader(event, 'cache-control', 'public, max-age=300')
  return wikiSearch(await useWiki(), lang, q, 8).map(toResult)
})
