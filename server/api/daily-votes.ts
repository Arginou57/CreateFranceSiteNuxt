import { defineEventHandler } from 'h3'

let cached: { votesToday: number; votesMonth: number; date: string } | null = null
let cacheTimestamp = 0
const CACHE_DURATION = 60 * 1000 // 1 minute

const headers = {
  'User-Agent': 'Mozilla/5.0 (compatible; CreateFranceBot/1.0)',
}

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

async function fetchServeurPriveVotes(): Promise<{ today: number; week: number }> {
  try {
    const res = await fetch('https://serveur-prive.net/minecraft/serveur-create-france', { headers })
    const html = await res.text()
    // data: [13,28,24,38,55,70,4] -> 7 derniers jours
    const match = html.match(/data:\s*\[([\d,]+)\]/)
    if (match) {
      const values = match[1].split(',').map(Number)
      const today = values[values.length - 1] || 0
      const week = values.reduce((a, b) => a + b, 0)
      return { today, week }
    }
  } catch {}
  return { today: 0, week: 0 }
}

async function fetchTopServeursVotes(): Promise<{ today: number; month: number }> {
  try {
    const res = await fetch('https://top-serveurs.net/minecraft/serveur-create-france', { headers })
    const html = await res.text()

    let today = 0
    let month = 0

    // Weekly data: "Votes","data":[13,21,22,35,56,72,5] -> dernier = aujourd'hui (Dimanche)
    // Les jours sont Lundi->Dimanche, le dernier correspond au jour actuel de la semaine
    const weeklyMatch = html.match(/"weekly"[\s\S]*?"Votes"[^[]*\[([\d,]+)\]/)
    if (weeklyMatch) {
      const values = weeklyMatch[1].split(',').map(Number)
      // Le jour actuel = index basé sur le jour de la semaine (0=Lundi, 6=Dimanche)
      const dayIndex = (new Date().getDay() + 6) % 7 // JS: 0=Dim -> converti en 6
      today = values[dayIndex] || 0
    }

    // Monthly data: "Votes","data":[691,163,329,0,...] -> index = mois-1
    const monthlyMatch = html.match(/"monthly"[\s\S]*?"Votes"[^[]*\[([\d,]+)\]/)
    if (monthlyMatch) {
      const values = monthlyMatch[1].split(',').map(Number)
      const currentMonth = new Date().getMonth() // 0-based
      month = values[currentMonth] || 0
    }

    return { today, month }
  } catch {}
  return { today: 0, month: 0 }
}

export default defineEventHandler(async () => {
  const now = Date.now()

  if (cached !== null && now - cacheTimestamp < CACHE_DURATION) {
    return cached
  }

  const [lsm, sp, ts] = await Promise.all([
    fetchListeServeursVotes(),
    fetchServeurPriveVotes(),
    fetchTopServeursVotes(),
  ])

  const d = new Date()
  const today = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0')

  cached = {
    votesToday: lsm.today + sp.today + ts.today,
    votesMonth: lsm.month + sp.week + ts.month,
    date: today,
  }
  cacheTimestamp = now
  return cached
})
