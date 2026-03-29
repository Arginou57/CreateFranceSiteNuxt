export function useServerStats() {
  const playersOnline = ref('--')
  const votesToday = ref('--')

  async function fetchLiveStats() {
    const apiUrl = 'https://www.liste-serveurs-minecraft.org/wp-content/themes/DL/mcstat-master/stats/207127.json'

    let data: Record<string, any> | null = null

    try {
      const res = await fetch(apiUrl)
      data = await res.json()
    } catch {
      try {
        const res = await fetch('https://api.allorigins.win/raw?url=' + encodeURIComponent(apiUrl))
        data = await res.json()
      } catch {
        playersOnline.value = '--'
        votesToday.value = '--'
        return
      }
    }

    try {
      const keys = Object.keys(data!).sort()
      const latest = data![keys[keys.length - 1]]
      playersOnline.value = String(latest.maxplayers || '0')

      const now = new Date()
      const today = now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0') + '-' + String(now.getDate()).padStart(2, '0')
      let totalVotes = 0
      keys.forEach(k => {
        if (k.startsWith(today) && data![k].votes) totalVotes += data![k].votes
      })
      votesToday.value = String(totalVotes)
    } catch {
      playersOnline.value = '--'
      votesToday.value = '--'
    }
  }

  let interval: ReturnType<typeof setInterval> | null = null

  onMounted(() => {
    fetchLiveStats()
    interval = setInterval(fetchLiveStats, 60000)
  })

  onUnmounted(() => {
    if (interval) clearInterval(interval)
  })

  return { playersOnline, votesToday }
}
