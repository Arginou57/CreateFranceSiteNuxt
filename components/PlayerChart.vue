<template>
  <Teleport to="body">
    <div class="chart-overlay" @click.self="$emit('close')">
      <div class="chart-modal">
        <button class="chart-close" @click="$emit('close')">&times;</button>
        <h3 class="chart-title">Joueurs en ligne — 24h</h3>
        <div class="chart-container">
          <canvas ref="canvasRef"></canvas>
        </div>
        <p v-if="noData" class="chart-empty">Pas encore assez de donnees. Revenez dans quelques minutes.</p>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
defineEmits<{ close: [] }>()

interface PlayerRecord {
  time: number
  players: number
}

const canvasRef = ref<HTMLCanvasElement | null>(null)
const noData = ref(false)

function drawChart(canvas: HTMLCanvasElement, data: PlayerRecord[]) {
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  const dpr = window.devicePixelRatio || 1
  const rect = canvas.getBoundingClientRect()
  canvas.width = rect.width * dpr
  canvas.height = rect.height * dpr
  ctx.scale(dpr, dpr)

  const w = rect.width
  const h = rect.height
  const pad = { top: 20, right: 20, bottom: 35, left: 40 }
  const chartW = w - pad.left - pad.right
  const chartH = h - pad.top - pad.bottom

  ctx.clearRect(0, 0, w, h)

  if (data.length < 2) {
    noData.value = true
    return
  }
  noData.value = false

  const maxPlayers = Math.max(...data.map(d => d.players), 1)
  const yMax = Math.ceil(maxPlayers * 1.2) || 1
  const timeMin = data[0].time
  const timeMax = data[data.length - 1].time
  const timeRange = timeMax - timeMin || 1

  const toX = (t: number) => pad.left + ((t - timeMin) / timeRange) * chartW
  const toY = (p: number) => pad.top + chartH - (p / yMax) * chartH

  // Grille horizontale
  ctx.strokeStyle = 'rgba(255,255,255,0.06)'
  ctx.lineWidth = 1
  const ySteps = 4
  for (let i = 0; i <= ySteps; i++) {
    const y = pad.top + (i / ySteps) * chartH
    ctx.beginPath()
    ctx.moveTo(pad.left, y)
    ctx.lineTo(pad.left + chartW, y)
    ctx.stroke()
  }

  // Labels Y
  ctx.fillStyle = 'rgba(255,255,255,0.4)'
  ctx.font = '11px Poppins, sans-serif'
  ctx.textAlign = 'right'
  ctx.textBaseline = 'middle'
  for (let i = 0; i <= ySteps; i++) {
    const val = Math.round(yMax * (1 - i / ySteps))
    const y = pad.top + (i / ySteps) * chartH
    ctx.fillText(String(val), pad.left - 8, y)
  }

  // Labels X (heures)
  ctx.textAlign = 'center'
  ctx.textBaseline = 'top'
  const hours = new Set<string>()
  for (const d of data) {
    const date = new Date(d.time)
    hours.add(`${date.getHours()}:00`)
  }
  const uniqueHours = [...hours]
  const maxLabels = Math.min(uniqueHours.length, 8)
  const step = Math.max(1, Math.floor(uniqueHours.length / maxLabels))
  for (let i = 0; i < data.length; i++) {
    const date = new Date(data[i].time)
    const label = `${date.getHours()}h`
    const hourKey = `${date.getHours()}:00`
    if (i > 0 && new Date(data[i - 1].time).getHours() === date.getHours()) continue
    const hourIndex = uniqueHours.indexOf(hourKey)
    if (hourIndex % step !== 0) continue
    ctx.fillText(label, toX(data[i].time), pad.top + chartH + 8)
  }

  // Area fill gradient
  const grad = ctx.createLinearGradient(0, pad.top, 0, pad.top + chartH)
  grad.addColorStop(0, 'rgba(212, 118, 78, 0.35)')
  grad.addColorStop(1, 'rgba(212, 118, 78, 0.02)')

  ctx.beginPath()
  ctx.moveTo(toX(data[0].time), toY(0))
  for (const d of data) {
    ctx.lineTo(toX(d.time), toY(d.players))
  }
  ctx.lineTo(toX(data[data.length - 1].time), toY(0))
  ctx.closePath()
  ctx.fillStyle = grad
  ctx.fill()

  // Ligne de la courbe
  ctx.beginPath()
  ctx.moveTo(toX(data[0].time), toY(data[0].players))
  for (let i = 1; i < data.length; i++) {
    ctx.lineTo(toX(data[i].time), toY(data[i].players))
  }
  ctx.strokeStyle = '#D4764E'
  ctx.lineWidth = 2.5
  ctx.lineJoin = 'round'
  ctx.lineCap = 'round'
  ctx.stroke()

  // Points
  for (const d of data) {
    ctx.beginPath()
    ctx.arc(toX(d.time), toY(d.players), 3, 0, Math.PI * 2)
    ctx.fillStyle = '#D4764E'
    ctx.fill()
    ctx.strokeStyle = 'rgba(28, 24, 22, 0.8)'
    ctx.lineWidth = 1.5
    ctx.stroke()
  }
}

async function loadAndDraw() {
  try {
    const data = await $fetch<PlayerRecord[]>('/api/player-history')
    if (canvasRef.value) {
      drawChart(canvasRef.value, data)
    }
  } catch {
    noData.value = true
  }
}

onMounted(() => {
  loadAndDraw()
  window.addEventListener('resize', loadAndDraw)
})

onUnmounted(() => {
  window.removeEventListener('resize', loadAndDraw)
})
</script>

<style scoped>
.chart-overlay {
  position: fixed;
  inset: 0;
  z-index: 9999;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  animation: fadeIn 0.2s ease;
}

.chart-modal {
  position: relative;
  background: rgba(40, 35, 32, 0.92);
  border: 1px solid rgba(212, 118, 78, 0.2);
  border-radius: 16px;
  backdrop-filter: blur(16px);
  padding: 1.5rem;
  width: 90%;
  max-width: 600px;
  animation: slideUp 0.25s ease;
}

.chart-close {
  position: absolute;
  top: 12px;
  right: 14px;
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.5);
  font-size: 1.5rem;
  cursor: pointer;
  line-height: 1;
  transition: color 0.2s;
}

.chart-close:hover {
  color: #fff;
}

.chart-title {
  font-family: 'Orbitron', sans-serif;
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--terre-cuite, #D4764E);
  margin: 0 0 1rem 0;
}

.chart-container {
  width: 100%;
  height: 250px;
}

.chart-container canvas {
  width: 100%;
  height: 100%;
  display: block;
}

.chart-empty {
  text-align: center;
  color: rgba(255, 255, 255, 0.4);
  font-size: 0.85rem;
  margin-top: 0.5rem;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes slideUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

@media (max-width: 480px) {
  .chart-modal {
    width: 95%;
    padding: 1rem;
  }

  .chart-container {
    height: 200px;
  }
}
</style>
