// GET /api/wiki/items?lang=fr|en : item id → page that documents it (links of the video loupe)
import { useWiki } from '../../lib/wikiCore'
import { buildItemPages } from '../../lib/wikiViews'

export default defineEventHandler(async (event) => {
  const lang = getQuery(event).lang === 'en' ? 'en' : 'fr'
  setHeader(event, 'cache-control', 'public, max-age=3600')
  return buildItemPages(await useWiki(), lang)
})
