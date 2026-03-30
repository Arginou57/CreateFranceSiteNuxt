import { defineEventHandler } from 'h3'

let cached: { votesToday: number; votesMonth: number; date: string } | null = null
let cacheTimestamp = 0
const CACHE_DURATION = 60 * 1000 // 1 minute

const headers = {
  'User-Agent': 'Mozilla/5.0 (compatible; CreateFranceBot/1.0)',
}

// liste-serveurs-minecraft.org : JSON horaire fiable
async function fetchListeServeursVotes(): Promise<{ today: number; month: number }> {
  try {
    const res = await fetch(
      'https://www.liste-serveurs-minecraft.org/wp-content/themes/DL/mcstat-master/stats/207127.json',
      { headers }
    )
    const data = await res.json()

    const d = new Date()
    const today = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0')
    const month = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0')

    let todayVotes = 0
    let monthVotes = 0
    for (const key of Object.keys(data)) {
      if (data[key].votes) {
        if (key.startsWith(today)) todayVotes += data[key].votes
        if (key.startsWith(month)) monthVotes += data[key].votes
      }
    }
    return { today: todayVotes, month: monthVotes }
  } catch {}
  return { today: 0, month: 0 }
}

// serveur-prive.net : graph 7 jours, dernier = "Ce jour"
async function fetchServeurPriveTodayVotes(): Promise<number> {
  try {
    const res = await fetch('https://serveur-prive.net/minecraft/serveur-create-france', { headers })
    const html = await res.text()
    const match = html.match(/data:\s*\[([\d,]+)\]/)
    if (match) {
      const values = match[1].split(',').map(Number)
      return values[values.length - 1] || 0
    }
  } catch {}
  return 0
}

// top-serveurs.net : monthly data dans le HTML (ex: Mars = 329)
async function fetchTopServeursMonthVotes(): Promise<number> {
  try {
    const res = await fetch('https://top-serveurs.net/minecraft/serveur-create-france', { headers })
    const html = await res.text()
    const monthlyMatch = html.match(/"monthly"[\s\S]*?"Votes"[^[]*\[([\d,]+)\]/)
    if (monthlyMatch) {
      const values = monthlyMatch[1].split(',').map(Number)
      const currentMonth = new Date().getMonth() // 0-based
      return values[currentMonth] || 0
    }
  } catch {}
  return 0
}

export default defineEventHandler(async () => {
  const now = Date.now()

  if (cached !== null && now - cacheTimestamp < CACHE_DURATION) {
    return cached
  }

  const [lsm, spToday, tsMonth] = await Promise.all([
    fetchListeServeursVotes(),
    fetchServeurPriveTodayVotes(),
    fetchTopServeursMonthVotes(),
  ])

  const d = new Date()
  const today = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0')

  cached = {
    // Aujourd'hui = liste-serveurs (JSON horaire) + serveur-prive ("Ce jour")
    votesToday: lsm.today + spToday,
    // Ce mois = liste-serveurs (mois complet) + top-serveurs (monthly)
    votesMonth: lsm.month + tsMonth,
    date: today,
  }
  cacheTimestamp = now
  return cached
})
