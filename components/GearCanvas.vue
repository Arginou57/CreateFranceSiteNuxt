<template>
  <canvas ref="canvasRef" class="gear-canvas"></canvas>
</template>

<script setup lang="ts">
interface Gear {
  x: number; y: number; vx: number; vy: number;
  radius: number; teeth: number; rotation: number;
  spinSpeed: number; opacity: number; mass: number;
}

const canvasRef = ref<HTMLCanvasElement | null>(null)
let physGears: Gear[] = []
let animId: number

function resizeCanvas(canvas: HTMLCanvasElement) {
  canvas.width = window.innerWidth
  canvas.height = window.innerHeight
}

function initPhysGears(canvas: HTMLCanvasElement) {
  physGears = []
  for (let i = 0; i < 15; i++) {
    const radius = 15 + Math.random() * 35
    const angle = Math.random() * Math.PI * 2
    const speed = 0.4 + Math.random() * 0.8
    physGears.push({
      x: radius + Math.random() * (canvas.width - radius * 2),
      y: radius + Math.random() * (canvas.height - radius * 2),
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      radius,
      teeth: Math.round(radius / 4) + 4,
      rotation: Math.random() * Math.PI * 2,
      spinSpeed: (0.005 + Math.random() * 0.01) * (Math.random() > 0.5 ? 1 : -1),
      opacity: 0.12 + Math.random() * 0.12,
      mass: radius,
    })
  }
}

function getButtonRect(): { x: number; y: number; w: number; h: number } | null {
  const btn = document.querySelector('.bento-shop')
  if (!btn) return null
  const r = btn.getBoundingClientRect()
  const pad = 5
  return { x: r.left - pad, y: r.top - pad, w: r.width + pad * 2, h: r.height + pad * 2 }
}

function drawPhysGear(ctx: CanvasRenderingContext2D, g: Gear) {
  ctx.save()
  ctx.translate(g.x, g.y)
  ctx.rotate(g.rotation)
  ctx.globalAlpha = g.opacity
  ctx.strokeStyle = '#D4764E'
  ctx.lineWidth = 1.2
  ctx.beginPath()
  const outerR = g.radius, innerR = g.radius * 0.78
  for (let i = 0; i < g.teeth; i++) {
    const a0 = (i / g.teeth) * Math.PI * 2
    const a1 = ((i + 0.15) / g.teeth) * Math.PI * 2
    const a2 = ((i + 0.35) / g.teeth) * Math.PI * 2
    const a3 = ((i + 0.5) / g.teeth) * Math.PI * 2
    if (i === 0) ctx.moveTo(Math.cos(a0) * innerR, Math.sin(a0) * innerR)
    else ctx.lineTo(Math.cos(a0) * innerR, Math.sin(a0) * innerR)
    ctx.lineTo(Math.cos(a1) * outerR, Math.sin(a1) * outerR)
    ctx.lineTo(Math.cos(a2) * outerR, Math.sin(a2) * outerR)
    ctx.lineTo(Math.cos(a3) * innerR, Math.sin(a3) * innerR)
  }
  ctx.closePath()
  ctx.stroke()
  ctx.fillStyle = `rgba(212,118,78,${g.opacity * 0.1})`
  ctx.fill()
  ctx.beginPath()
  ctx.arc(0, 0, g.radius * 0.28, 0, Math.PI * 2)
  ctx.stroke()
  ctx.beginPath()
  ctx.arc(0, 0, g.radius * 0.08, 0, Math.PI * 2)
  ctx.fillStyle = `rgba(212,118,78,${g.opacity})`
  ctx.fill()
  ctx.restore()
}

function collideGears(a: Gear, b: Gear) {
  const dx = b.x - a.x, dy = b.y - a.y
  const dist = Math.sqrt(dx * dx + dy * dy)
  const min = a.radius + b.radius
  if (dist < min && dist > 0) {
    const nx = dx / dist, ny = dy / dist
    const overlap = min - dist, total = a.mass + b.mass
    a.x -= nx * overlap * (b.mass / total)
    a.y -= ny * overlap * (b.mass / total)
    b.x += nx * overlap * (a.mass / total)
    b.y += ny * overlap * (a.mass / total)
    const dvx = a.vx - b.vx, dvy = a.vy - b.vy
    const dot = dvx * nx + dvy * ny
    if (dot > 0) {
      const imp = dot / total * 0.9
      a.vx -= imp * b.mass * nx; a.vy -= imp * b.mass * ny
      b.vx += imp * a.mass * nx; b.vy += imp * a.mass * ny
    }
    a.spinSpeed = -Math.abs(a.spinSpeed) * Math.sign(b.spinSpeed || 1) * -1
    b.spinSpeed = -a.spinSpeed
  }
}

function collideRect(g: Gear, rect: { x: number; y: number; w: number; h: number } | null) {
  if (!rect) return
  const cx = Math.max(rect.x, Math.min(g.x, rect.x + rect.w))
  const cy = Math.max(rect.y, Math.min(g.y, rect.y + rect.h))
  const dx = g.x - cx, dy = g.y - cy
  const dist = Math.sqrt(dx * dx + dy * dy)
  if (dist < g.radius && dist > 0) {
    const nx = dx / dist, ny = dy / dist
    g.x = cx + nx * g.radius
    g.y = cy + ny * g.radius
    const dot = g.vx * nx + g.vy * ny
    g.vx -= 2 * dot * nx * 0.8
    g.vy -= 2 * dot * ny * 0.8
    g.spinSpeed *= -1
  }
}

onMounted(() => {
  const canvas = canvasRef.value
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  resizeCanvas(canvas)
  initPhysGears(canvas)

  function physicsLoop() {
    ctx!.clearRect(0, 0, canvas!.width, canvas!.height)
    const btnRect = getButtonRect()
    for (let i = 0; i < physGears.length; i++) {
      const g = physGears[i]
      g.x += g.vx; g.y += g.vy; g.rotation += g.spinSpeed
      if (g.x - g.radius < 0) { g.x = g.radius; g.vx = Math.abs(g.vx); g.spinSpeed *= -1 }
      if (g.x + g.radius > canvas!.width) { g.x = canvas!.width - g.radius; g.vx = -Math.abs(g.vx); g.spinSpeed *= -1 }
      if (g.y - g.radius < 0) { g.y = g.radius; g.vy = Math.abs(g.vy); g.spinSpeed *= -1 }
      if (g.y + g.radius > canvas!.height) { g.y = canvas!.height - g.radius; g.vy = -Math.abs(g.vy); g.spinSpeed *= -1 }
      collideRect(g, btnRect)
      for (let j = i + 1; j < physGears.length; j++) collideGears(g, physGears[j])
      drawPhysGear(ctx!, g)
    }
    animId = requestAnimationFrame(physicsLoop)
  }

  physicsLoop()

  window.addEventListener('resize', () => {
    resizeCanvas(canvas!)
    initPhysGears(canvas!)
  })
})

onUnmounted(() => {
  if (animId) cancelAnimationFrame(animId)
})
</script>

<style scoped>
.gear-canvas {
  position: fixed; top: 0; left: 0; width: 100%; height: 100vh;
  pointer-events: none; z-index: 1;
}
</style>
