export function useServerStats() {
  const playersOnline = ref('--')
  const votesToday = ref('--')
  const totalVotes = ref('--')

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
      let dayVotes = 0
      keys.forEach(k => {
        if (k.startsWith(today) && data![k].votes) dayVotes += data![k].votes
      })
      votesToday.value = String(dayVotes)
    } catch {
      playersOnline.value = '--'
      votesToday.value = '--'
    }
  }

  // Fetch total votes via server proxy
  const { data: votesData } = useFetch('/api/server-votes', {
    server: true,
    lazy: true,
  })

  watch(votesData, (val) => {
    if (val && (val as any).totalVotes) {
      totalVotes.value = String((val as any).totalVotes)
    }
  }, { immediate: true })

  let interval: ReturnType<typeof setInterval> | null = null

  onMounted(() => {
    fetchLiveStats()
    interval = setInterval(fetchLiveStats, 60000)
  })

  onUnmounted(() => {
    if (interval) clearInterval(interval)
  })

  return { playersOnline, votesToday, totalVotes }
}
