// GET /api/wiki/home?lang=fr|en : the wiki home (mods, categories, pages, latest updates)
import { useWiki } from '../../lib/wikiCore'
import { buildHome } from '../../lib/wikiViews'

export default defineEventHandler(async (event) => {
  const lang = getQuery(event).lang === 'en' ? 'en' : 'fr'
  return buildHome(await useWiki(), lang)
})
