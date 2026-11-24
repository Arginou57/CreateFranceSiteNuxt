<template>
  <figure class="wiki-video" :class="{ 'has-chapters': chapters.length }">
    <div class="wiki-video-frame" @keydown="onKey">
      <video
        ref="videoRef"
        :poster="files.poster"
        :aria-label="video.name"
        width="720"
        height="720"
        muted
        loop
        playsinline
        :preload="preload"
        loading="lazy"
        @click="toggle"
        @timeupdate="onTime"
        @loadedmetadata="onMeta"
        @play="paused = false"
        @pause="paused = true"
      >
        <source :src="files.webm" type="video/webm">
        <source :src="files.mp4" type="video/mp4">
      </video>
      <!-- loupe (Ponder identify mode): the video is paused, hovering a block shows what it is -->
      <div
        v-if="loupeOn"
        class="wv-loupe"
        @pointermove="onLoupeMove"
        @pointerdown="onLoupeMove"
        @pointerleave="hover = null"
        @click.stop="openHover"
      >
        <svg viewBox="0 0 1000 1000" preserveAspectRatio="none" aria-hidden="true">
          <polygon v-if="hover" :points="hover.points" class="wv-loupe-poly" />
        </svg>
        <p v-if="!hover" class="wv-loupe-hint">{{ loupeData ? t('wiki.video.loupeHint') : t('wiki.video.loupeLoading') }}</p>
        <div v-if="hover" class="wv-loupe-card" :style="cardStyle">
          <img v-if="hover.icon" :src="hover.icon" alt="" width="40" height="40">
          <span>
            <strong>{{ hover.name }}</strong>
            <NuxtLink v-if="hover.path" :to="hover.path" @click.stop>{{ t('wiki.video.loupeOpen') }} →</NuxtLink>
            <small v-else-if="hover.here">{{ t('wiki.video.loupeHere') }}</small>
          </span>
        </div>
      </div>

      <button v-if="paused && !loupeOn" type="button" class="wiki-video-play" :aria-label="t('wiki.play')" @click="toggle">
        <svg viewBox="0 0 24 24" width="26" height="26" aria-hidden="true"><path d="M8 5v14l11-7z" fill="currentColor" /></svg>
      </button>

      <!-- Ponder-like controls: timeline with the key moments, previous / next key moment, time -->
      <div class="wv-bar" @click.stop>
        <button type="button" class="wv-btn" :aria-label="paused ? t('wiki.play') : t('wiki.video.pause')" @click="toggle">
          <svg v-if="paused" viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M8 5v14l11-7z" fill="currentColor" /></svg>
          <svg v-else viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M7 5h4v14H7zM13 5h4v14h-4z" fill="currentColor" /></svg>
        </button>
        <button v-if="chapters.length" type="button" class="wv-btn" :aria-label="t('wiki.video.prev')" :title="t('wiki.video.prev')" @click="prevChapter">
          <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M6 5h2v14H6zM20 5v14L9 12z" fill="currentColor" /></svg>
        </button>
        <button v-if="chapters.length" type="button" class="wv-btn" :aria-label="t('wiki.video.next')" :title="t('wiki.video.next')" @click="nextChapter">
          <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M16 5h2v14h-2zM4 5v14l11-7z" fill="currentColor" /></svg>
        </button>
        <div
          ref="trackRef"
          class="wv-track"
          role="slider"
          tabindex="0"
          :aria-label="t('wiki.video.timeline')"
          aria-valuemin="0"
          :aria-valuemax="Math.round(duration)"
          :aria-valuenow="Math.round(current)"
          :aria-valuetext="`${fmt(current)} / ${fmt(duration)}`"
          @pointerdown="onTrackDown"
        >
          <div class="wv-fill" :style="{ width: `${pct(current)}%` }" />
          <button
            v-for="(c, i) in chapters"
            :key="i"
            type="button"
            class="wv-mark"
            :class="{ done: current >= c.t - 0.05 }"
            :style="{ left: `${pct(c.t)}%` }"
            :title="`${i + 1}. ${c.label}`"
            :aria-label="`${t('wiki.video.goto')} ${i + 1} : ${c.label}`"
            @pointerdown.stop
            @click.stop="seek(c.t, true)"
          />
          <div class="wv-knob" :style="{ left: `${pct(current)}%` }" />
        </div>
        <span class="wv-time">{{ fmt(current) }} / {{ fmt(duration) }}</span>
        <button
          v-if="hasLoupe"
          type="button"
          class="wv-btn wv-loupe-btn"
          :class="{ on: loupeOn }"
          :aria-pressed="loupeOn"
          :aria-label="t('wiki.video.loupe')"
          :title="t('wiki.video.loupe')"
          @click="toggleLoupe"
        >
          <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M10.5 3a7.5 7.5 0 0 1 5.96 12.05l4.25 4.24-1.42 1.42-4.24-4.25A7.5 7.5 0 1 1 10.5 3Zm0 2a5.5 5.5 0 1 0 0 11 5.5 5.5 0 0 0 0-11Z" fill="currentColor" /></svg>
        </button>
      </div>
    </div>

    <figcaption>{{ video.description }}</figcaption>

    <!-- chapter list under the video: the key moments, in clear text, clickable -->
    <ol v-if="chapters.length" class="wv-chapters" :aria-label="t('wiki.video.chapters')">
      <li v-for="(c, i) in chapters" :key="i">
        <button type="button" :class="{ active: activeChapter === i }" @click="seek(c.t, true)">
          <span class="wv-chap-num">{{ i + 1 }}</span>
          <span class="wv-chap-label">{{ c.label }}</span>
          <span class="wv-chap-time">{{ fmt(c.t) }}</span>
        </button>
      </li>
    </ol>
  </figure>
</template>

<script setup lang="ts">
import type { WikiVideo } from '~/utils/wiki'

const props = defineProps<{ slug: string; video: WikiVideo; chapters?: { t: number; label: string }[] }>()
const { t } = useI18n()
const files = computed(() => wikiVideoFiles(props.slug, props.video.id))
const chapters = computed(() => [...(props.chapters || [])].sort((a, b) => a.t - b.t))
const videoRef = ref<HTMLVideoElement | null>(null)
const trackRef = ref<HTMLElement | null>(null)
const paused = ref(true)
const current = ref(0)
// declared duration (ISO 8601 « PT18S ») until the real one is known
const duration = ref(isoSeconds(props.video.duration))
const preload = ref<'none' | 'metadata' | 'auto'>('none')
let userPaused = false
let observer: IntersectionObserver | null = null

function isoSeconds(d: string): number {
  const m = /PT(?:(\d+)M)?(?:([\d.]+)S)?/.exec(d || '')
  return m ? (Number(m[1] || 0) * 60 + Number(m[2] || 0)) || 1 : 1
}

const activeChapter = computed(() => {
  let k = -1
  chapters.value.forEach((c, i) => { if (current.value >= c.t - 0.05) k = i })
  return k
})

function pct(s: number) {
  return Math.max(0, Math.min(100, (s / (duration.value || 1)) * 100))
}

function fmt(s: number) {
  const v = Math.max(0, Math.floor(s))
  return `${Math.floor(v / 60)}:${String(v % 60).padStart(2, '0')}`
}

function play() {
  const v = videoRef.value
  if (!v) return
  v.play().then(() => { paused.value = false }).catch(() => { paused.value = true })
}

function toggle() {
  const v = videoRef.value
  if (!v) return
  if (loupeOn.value) { loupeOn.value = false; hover.value = null }
  if (v.paused) {
    userPaused = false
    play()
  } else {
    userPaused = true
    v.pause()
  }
}

function onTime() {
  if (videoRef.value) current.value = videoRef.value.currentTime
}

function onMeta() {
  const v = videoRef.value
  if (v && Number.isFinite(v.duration) && v.duration > 0) duration.value = v.duration
}

/** go to a time; `andPlay` (chapter jump) starts playback unless the user paused on purpose, like the Ponder UI */
function seek(s: number, andPlay = false) {
  const v = videoRef.value
  if (!v) return
  const to = Math.max(0, Math.min(s, (duration.value || s) - 0.05))
  current.value = to
  const apply = () => {
    v.currentTime = to
    if (andPlay && !userPaused && !loupeOn.value) play()   // the loupe keeps the image still
  }
  if (v.readyState >= 1) apply()
  else {
    preload.value = 'auto'
    v.addEventListener('loadedmetadata', apply, { once: true })
    v.load()
  }
}

function prevChapter() {
  // like a music player: back to the start of the current key moment, or to the previous one if just after it
  const cs = chapters.value
  let target = 0
  for (const c of cs) if (c.t < current.value - 1.0) target = c.t
  seek(target, true)
}

function nextChapter() {
  const c = chapters.value.find((x) => x.t > current.value + 0.2)
  if (c) seek(c.t, true)
  else seek(0, true)
}

function trackTime(e: PointerEvent) {
  const r = trackRef.value!.getBoundingClientRect()
  return Math.max(0, Math.min(1, (e.clientX - r.left) / r.width)) * (duration.value || 0)
}

function onTrackDown(e: PointerEvent) {
  const el = trackRef.value
  if (!el) return
  el.setPointerCapture(e.pointerId)
  seek(trackTime(e))
  const move = (ev: PointerEvent) => seek(trackTime(ev))
  const up = () => {
    el.removeEventListener('pointermove', move)
    el.removeEventListener('pointerup', up)
    el.removeEventListener('pointercancel', up)
  }
  el.addEventListener('pointermove', move)
  el.addEventListener('pointerup', up)
  el.addEventListener('pointercancel', up)
}

// keyboard on the player: space = pause, ← → = previous / next key moment (or 5 s without key moments)
function onKey(e: KeyboardEvent) {
  if ((e.target as HTMLElement)?.tagName === 'BUTTON' && e.key === ' ') return
  if (e.key === 'Escape' && loupeOn.value) { toggleLoupe(); return }
  if (e.key === ' ' || e.key === 'k') { e.preventDefault(); toggle() }
  else if (e.key === 'ArrowRight') { e.preventDefault(); chapters.value.length ? nextChapter() : seek(current.value + 5) }
  else if (e.key === 'ArrowLeft') { e.preventDefault(); chapters.value.length ? prevChapter() : seek(current.value - 5) }
}

// ------------------------------------------------------------------ loupe (Ponder identify mode)
interface LoupeData { dt: number; dur: number; ids: string[]; names: Record<string, { fr: string; en: string }>; frames: number[][][] }
const { locale } = useI18n()
const hasLoupe = computed(() => wikiVideoHasLoupe(props.slug, props.video.id))
const loupeOn = ref(false)
const loupeData = ref<LoupeData | null>(null)
const hover = ref<{ id: string; name: string; icon: string | null; path: string | null; here: boolean; points: string; x: number; y: number } | null>(null)
let resumeAfterLoupe = false

async function toggleLoupe() {
  const v = videoRef.value
  if (!loupeOn.value) {
    resumeAfterLoupe = !!v && !v.paused
    v?.pause()
    loupeOn.value = true
    if (!loupeData.value) {
      try {
        const u = wikiMedia(props.slug, `${props.video.id}_loupe.json`)
        loupeData.value = await $fetch<LoupeData>(`${u}${u.includes('?') ? '&' : '?'}lv=${LOUPE_VERSION}`)
      } catch {
        loupeOn.value = false
      }
    }
  } else {
    loupeOn.value = false
    hover.value = null
    if (resumeAfterLoupe && !userPaused) play()
  }
}

function inPoly(x: number, y: number, e: number[]) {
  let inside = false
  const n = (e.length - 2) / 2
  for (let i = 0, j = n - 1; i < n; j = i++) {
    const xi = e[2 + 2 * i], yi = e[3 + 2 * i], xj = e[2 + 2 * j], yj = e[3 + 2 * j]
    if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside
  }
  return inside
}

function onLoupeMove(ev: PointerEvent) {
  const d = loupeData.value
  if (!d) return
  const r = (ev.currentTarget as HTMLElement).getBoundingClientRect()
  const x = ((ev.clientX - r.left) / r.width) * 1000
  const y = ((ev.clientY - r.top) / r.height) * 1000
  const fi = Math.max(0, Math.min(d.frames.length - 1, Math.round(current.value / d.dt)))
  // the frames are sorted by depth: the first outline under the pointer is the visible block
  const e = d.frames[fi].find((q) => inPoly(x, y, q))
  if (!e) { hover.value = null; return }
  const id = d.ids[e[0]]
  const page = wikiPageForItem(id)
  const lang: WikiLocale = locale.value === 'en' ? 'en' : 'fr'
  const pts: string[] = []
  for (let k = 2; k < e.length; k += 2) pts.push(`${e[k]},${e[k + 1]}`)
  hover.value = {
    id,
    name: d.names[id]?.[lang] || id,
    icon: wikiItemIcon(id),
    path: page && page.slug !== props.slug ? wikiPagePath(page, lang) : null,
    here: page?.slug === props.slug,
    points: pts.join(' '),
    x: x / 10,
    y: y / 10,
  }
}

function openHover() {
  if (hover.value?.path) navigateTo(hover.value.path)
}

// the card follows the pointer, flipped to stay inside the video
const cardStyle = computed(() => {
  const h = hover.value
  if (!h) return {}
  return {
    left: h.x < 55 ? `${h.x + 3}%` : undefined,
    right: h.x >= 55 ? `${100 - h.x + 3}%` : undefined,
    top: h.y < 70 ? `${h.y + 3}%` : undefined,
    bottom: h.y >= 70 ? `${100 - h.y + 3}%` : undefined,
  }
})

onMounted(() => {
  const v = videoRef.value
  if (!v) return
  // les animations ne se chargent et ne tournent que lorsqu'elles sont visibles (données mobiles)
  const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
  if (reduce || !('IntersectionObserver' in window)) return
  observer = new IntersectionObserver((entries) => {
    for (const e of entries) {
      if (e.isIntersecting && !userPaused) play()
      else if (!e.isIntersecting && !v.paused) v.pause()
    }
  }, { threshold: 0.35 })
  observer.observe(v)
})

onUnmounted(() => observer?.disconnect())
</script>

<style scoped>
.wiki-video { margin: 0; min-width: 0; }
.wiki-video-frame {
  position: relative; aspect-ratio: 1 / 1; width: 100%; border-radius: 14px; overflow: hidden;
  background: var(--bg-lighter); border: 1px solid var(--glass-border);
  box-shadow: 0 10px 40px var(--shadow-md);
}
.wiki-video video { display: block; width: 100%; max-width: 100%; height: 100%; object-fit: cover; cursor: pointer; }
.wiki-video-play {
  position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%);
  width: 58px; height: 58px; border-radius: 50%; border: none; cursor: pointer;
  background: rgba(212, 118, 78, 0.92); color: #1C1816; display: flex; align-items: center; justify-content: center;
  box-shadow: 0 6px 24px rgba(0, 0, 0, 0.35); transition: transform 0.2s;
}
.wiki-video-play:hover { transform: translate(-50%, -50%) scale(1.08); }

/* control bar, over the bottom of the video (always visible on touch screens, on hover / focus otherwise) */
.wv-bar {
  position: absolute; left: 0; right: 0; bottom: 0; display: flex; align-items: center; gap: 0.35rem; padding: 1.4rem 0.6rem 0.5rem;
  background: linear-gradient(to top, rgba(20, 16, 14, 0.85), rgba(20, 16, 14, 0));
  transition: opacity 0.25s;
}
@media (hover: hover) {
  .wiki-video-frame .wv-bar { opacity: 0; }
  .wiki-video-frame:hover .wv-bar, .wiki-video-frame:focus-within .wv-bar, .has-chapters .wv-bar { opacity: 1; }
}
.wv-btn {
  flex: none; width: 30px; height: 30px; border-radius: 7px; border: none; cursor: pointer; display: flex; align-items: center;
  justify-content: center; color: #fff; background: rgba(255, 255, 255, 0.1);
}
.wv-btn:hover, .wv-btn:focus-visible { background: rgba(212, 118, 78, 0.75); outline: none; }
.wv-track {
  position: relative; flex: 1; height: 22px; cursor: pointer; touch-action: none; outline: none;
}
.wv-track::before {
  content: ''; position: absolute; left: 0; right: 0; top: 50%; height: 5px; margin-top: -2.5px; border-radius: 3px;
  background: rgba(255, 255, 255, 0.22);
}
.wv-track:focus-visible::before { box-shadow: 0 0 0 2px var(--mandarine); }
.wv-fill {
  position: absolute; left: 0; top: 50%; height: 5px; margin-top: -2.5px; border-radius: 3px; background: var(--terre-cuite);
  pointer-events: none;
}
.wv-knob {
  position: absolute; top: 50%; width: 12px; height: 12px; margin: -6px 0 0 -6px; border-radius: 50%; background: #fff;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.5); pointer-events: none;
}
/* key moments: Ponder-like notches */
.wv-mark {
  position: absolute; top: 50%; width: 14px; height: 18px; margin: -9px 0 0 -7px; padding: 0; border: none; background: none; cursor: pointer;
}
.wv-mark::after {
  content: ''; position: absolute; left: 5px; top: 1px; width: 4px; height: 16px; border-radius: 2px;
  background: #fff; box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.45);
}
.wv-mark.done::after { background: var(--mandarine-light); }
.wv-mark:hover::after, .wv-mark:focus-visible::after { transform: scaleY(1.2); background: var(--mandarine); }
.wv-time { flex: none; font-size: 0.72rem; color: #fff; font-variant-numeric: tabular-nums; text-shadow: 0 1px 2px rgba(0, 0, 0, 0.6); }

/* loupe */
.wv-loupe { position: absolute; inset: 0; cursor: crosshair; }
.wv-loupe svg { position: absolute; inset: 0; width: 100%; height: 100%; pointer-events: none; }
.wv-loupe-poly { fill: rgba(242, 166, 90, 0.22); stroke: var(--mandarine-light); stroke-width: 4; vector-effect: non-scaling-stroke; stroke-linejoin: round; }
.wv-loupe-hint {
  position: absolute; left: 50%; top: 0.8rem; transform: translateX(-50%); padding: 0.3rem 0.8rem; border-radius: 999px;
  font-size: 0.75rem; color: #fff; background: rgba(20, 16, 14, 0.75); white-space: nowrap; pointer-events: none;
}
.wv-loupe-card {
  position: absolute; display: flex; gap: 0.55rem; align-items: center; padding: 0.45rem 0.7rem 0.45rem 0.45rem; border-radius: 10px;
  background: rgba(28, 24, 22, 0.94); border: 1px solid var(--terre-cuite); box-shadow: 0 8px 24px rgba(0, 0, 0, 0.45); max-width: 70%;
}
.wv-loupe-card img { width: 40px; height: 40px; flex: none; }
.wv-loupe-card span { display: flex; flex-direction: column; gap: 0.1rem; min-width: 0; }
.wv-loupe-card strong { color: var(--text-primary); font-size: 0.85rem; }
.wv-loupe-card a { color: var(--mandarine); font-size: 0.75rem; text-decoration: none; }
.wv-loupe-card small { color: var(--text-muted); font-size: 0.68rem; }
.wv-loupe-btn.on { background: var(--terre-cuite); color: #1C1816; }

.wiki-video figcaption { color: var(--text-muted); font-size: 0.8rem; line-height: 1.5; margin-top: 0.6rem; text-align: center; }

.wv-chapters { list-style: none; display: grid; gap: 0.3rem; margin-top: 0.6rem; }
.wv-chapters button {
  width: 100%; display: flex; align-items: center; gap: 0.6rem; padding: 0.4rem 0.6rem; border-radius: 9px; cursor: pointer;
  font: inherit; text-align: left; color: var(--text-secondary); background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.06); transition: border-color 0.2s, background 0.2s;
}
.wv-chapters button:hover { border-color: rgba(212, 118, 78, 0.4); }
.wv-chapters button.active { color: var(--text-primary); background: rgba(212, 118, 78, 0.16); border-color: var(--terre-cuite); }
.wv-chap-num {
  flex: none; width: 1.4rem; height: 1.4rem; border-radius: 50%; display: flex; align-items: center; justify-content: center;
  font-family: 'Orbitron', sans-serif; font-size: 0.68rem; font-weight: 700; color: #1C1816; background: var(--text-muted);
}
.wv-chapters button.active .wv-chap-num { background: var(--terre-cuite); }
.wv-chap-label { flex: 1; font-size: 0.82rem; }
.wv-chap-time { font-size: 0.72rem; color: var(--text-muted); font-variant-numeric: tabular-nums; }
</style>
