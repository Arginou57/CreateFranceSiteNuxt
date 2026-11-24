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
      <button v-if="paused" type="button" class="wiki-video-play" :aria-label="t('wiki.play')" @click="toggle">
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
    if (andPlay && !userPaused) play()
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
  if (e.key === ' ' || e.key === 'k') { e.preventDefault(); toggle() }
  else if (e.key === 'ArrowRight') { e.preventDefault(); chapters.value.length ? nextChapter() : seek(current.value + 5) }
  else if (e.key === 'ArrowLeft') { e.preventDefault(); chapters.value.length ? prevChapter() : seek(current.value - 5) }
}

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
