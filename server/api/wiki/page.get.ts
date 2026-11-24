// GET /api/wiki/page?slug=<url slug>&lang=fr|en : one article (404 when the slug does not exist in that language)
import { useWiki } from '../../lib/wikiCore'
import { buildArticle } from '../../lib/wikiViews'

export default defineEventHandler(async (event) => {
  const q = getQuery(event)
  const lang = q.lang === 'en' ? 'en' : 'fr'
  const view = buildArticle(await useWiki(), String(q.slug || ''), lang)
  if (!view) throw createError({ statusCode: 404, statusMessage: 'Wiki page not found' })
  return view
})
