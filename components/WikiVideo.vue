<template>
  <figure class="wiki-video">
    <div class="wiki-video-frame">
      <video
        ref="videoRef"
        :poster="files.poster"
        :aria-label="video.name"
        width="720"
        height="720"
        muted
        loop
        playsinline
        preload="none"
        loading="lazy"
        @click="toggle"
      >
        <source :src="files.webm" type="video/webm">
        <source :src="files.mp4" type="video/mp4">
      </video>
      <button v-if="paused" type="button" class="wiki-video-play" aria-label="Lire l'animation" @click="toggle">
        <svg viewBox="0 0 24 24" width="26" height="26" aria-hidden="true"><path d="M8 5v14l11-7z" fill="currentColor" /></svg>
      </button>
    </div>
    <figcaption>{{ video.description }}</figcaption>
  </figure>
</template>

<script setup lang="ts">
import type { WikiVideo } from '~/utils/wiki'

const props = defineProps<{ slug: string; video: WikiVideo }>()
const files = computed(() => wikiVideoFiles(props.slug, props.video.id))
const videoRef = ref<HTMLVideoElement | null>(null)
const paused = ref(true)
let userPaused = false
let observer: IntersectionObserver | null = null

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
    paused.value = true
  }
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
      else if (!e.isIntersecting && !v.paused) { v.pause(); paused.value = true }
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
.wiki-video figcaption { color: var(--text-muted); font-size: 0.8rem; line-height: 1.5; margin-top: 0.6rem; text-align: center; }
</style>
