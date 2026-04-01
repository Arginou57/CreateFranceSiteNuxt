interface PlayerRecord {
  time: number
  players: number
}

const MAX_AGE = 30 * 24 * 60 * 60 * 1000 // 30 jours en ms

const history: PlayerRecord[] = []

export function recordPlayers(players: number) {
  const now = Date.now()
  history.push({ time: now, players })

  // Supprimer les entrées de plus de 30 jours
  const cutoff = now - MAX_AGE
  while (history.length > 0 && history[0].time < cutoff) {
    history.shift()
  }
}

export function getPlayerHistory(): PlayerRecord[] {
  return history
}
