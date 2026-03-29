export function useServerStats() {
  const playersOnline = ref('--')
  const votesToday = ref('--')
  const votesMonth = ref('--')
  const totalVotes = ref('--')

  async function fetchPlayerCount() {
    try {
      const res = await fetch('/api/server-status')
      const data = await res.json()
      playersOnline.value = String(data.players ?? 0)
    } catch {
      playersOnline.value = '--'
    }
  }

  async function fetchDailyVotes() {
    try {
      const res = await fetch('/api/daily-votes')
      const data = await res.json()
      votesToday.value = String(data.votesToday ?? 0)
      votesMonth.value = String(data.votesMonth ?? 0)
    } catch {
      votesToday.value = '--'
      votesMonth.value = '--'
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

  let playerInterval: ReturnType<typeof setInterval> | null = null
  let votesInterval: ReturnType<typeof setInterval> | null = null

  onMounted(() => {
    fetchPlayerCount()
    fetchDailyVotes()
    playerInterval = setInterval(fetchPlayerCount, 30000)
    votesInterval = setInterval(fetchDailyVotes, 60000)
  })

  onUnmounted(() => {
    if (playerInterval) clearInterval(playerInterval)
    if (votesInterval) clearInterval(votesInterval)
  })

  return { playersOnline, votesToday, votesMonth, totalVotes }
}
