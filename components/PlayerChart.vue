<template>
  <Teleport to="body">
    <div class="chart-overlay" @click.self="$emit('close')">
      <div class="chart-modal">
        <button class="chart-close" @click="$emit('close')">&times;</button>
        <h3 class="chart-title">Joueurs en ligne</h3>
        <div class="chart-range-bar">
          <button
            v-for="r in ranges"
            :key="r.key"
            class="chart-range-btn"
            :class="{ active: activeRange === r.key }"
            @click="setRange(r.key)"
          >{{ r.label }}</button>
        </div>
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

type RangeKey = '24h' | '7d' | '30d'

const ranges = [
  { key: '24h' as RangeKey, label: '24h', ms: 24 * 60 * 60 * 1000 },
  { key: '7d' as RangeKey, label: '7 jours', ms: 7 * 24 * 60 * 60 * 1000 },
  { key: '30d' as RangeKey, label: '1 mois', ms: 30 * 24 * 60 * 60 * 1000 },
]

const canvasRef = ref<HTMLCanvasElement | null>(null)
const noData = ref(false)
const activeRange = ref<RangeKey>('24h')
let allData: PlayerRecord[] = []

function filterData(data: PlayerRecord[], rangeKey: RangeKey): PlayerRecord[] {
  const range = ranges.find(r => r.key === rangeKey)!
  const cutoff = Date.now() - range.ms
  return data.filter(d => d.time >= cutoff)
}

function formatXLabel(time: number, rangeKey: RangeKey): string {
  const date = new Date(time)
  if (rangeKey === '24h') {
    return `${date.getHours()}h`
  }
  return `${date.getDate()}/${date.getMonth() + 1}`
}

function getXLabelKey(time: number, rangeKey: RangeKey): string {
  const date = new Date(time)
  if (rangeKey === '24h') {
    return `${date.getHours()}`
  }
  return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`
}

function drawChart(canvas: HTMLCanvasElement, data: PlayerRecord[], rangeKey: RangeKey) {
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

  // Labels X
  ctx.textAlign = 'center'
  ctx.textBaseline = 'top'
  const seenKeys = new Set<string>()
  const labelPositions: { x: number; label: string }[] = []
  for (const d of data) {
    const key = getXLabelKey(d.time, rangeKey)
    if (seenKeys.has(key)) continue
    seenKeys.add(key)
    labelPositions.push({ x: toX(d.time), label: formatXLabel(d.time, rangeKey) })
  }
  const maxLabels = 8
  const step = Math.max(1, Math.floor(labelPositions.length / maxLabels))
  for (let i = 0; i < labelPositions.length; i++) {
    if (i % step !== 0) continue
    ctx.fillText(labelPositions[i].label, labelPositions[i].x, pad.top + chartH + 8)
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

  // Points (limiter pour ne pas surcharger sur 7j/30j)
  const maxPoints = 80
  const pointStep = Math.max(1, Math.floor(data.length / maxPoints))
  for (let i = 0; i < data.length; i++) {
    if (i % pointStep !== 0 && i !== data.length - 1) continue
    const d = data[i]
    ctx.beginPath()
    ctx.arc(toX(d.time), toY(d.players), 3, 0, Math.PI * 2)
    ctx.fillStyle = '#D4764E'
    ctx.fill()
    ctx.strokeStyle = 'rgba(28, 24, 22, 0.8)'
    ctx.lineWidth = 1.5
    ctx.stroke()
  }
}

function redraw() {
  if (!canvasRef.value) return
  const filtered = filterData(allData, activeRange.value)
  drawChart(canvasRef.value, filtered, activeRange.value)
}

function setRange(key: RangeKey) {
  activeRange.value = key
  redraw()
}

async function loadAndDraw() {
  try {
    allData = await $fetch<PlayerRecord[]>('/api/player-history')
    redraw()
  } catch {
    noData.value = true
  }
}

onMounted(() => {
  loadAndDraw()
  window.addEventListener('resize', redraw)
})

onUnmounted(() => {
  window.removeEventListener('resize', redraw)
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
  margin: 0 0 0.8rem 0;
}

.chart-range-bar {
  display: flex;
  gap: 6px;
  margin-bottom: 1rem;
}

.chart-range-btn {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.5);
  padding: 0.3rem 0.75rem;
  border-radius: 8px;
  font-size: 0.75rem;
  font-family: 'Poppins', sans-serif;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.chart-range-btn:hover {
  border-color: rgba(212, 118, 78, 0.3);
  color: rgba(255, 255, 255, 0.7);
}

.chart-range-btn.active {
  background: rgba(212, 118, 78, 0.15);
  border-color: rgba(212, 118, 78, 0.4);
  color: #D4764E;
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
