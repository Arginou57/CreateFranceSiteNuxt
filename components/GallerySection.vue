<template>
  <section id="galerie" class="gallery-section" v-if="images.length > 0">
    <h2 class="section-title">Galerie du serveur Create</h2>
    <p class="section-subtitle">
      Les images du modpack, détectées automatiquement depuis CurseForge
    </p>

    <div class="gallery-grid">
      <button
        v-for="(img, i) in images"
        :key="img.url"
        class="gallery-item"
        :class="{ wide: i % 5 === 0 }"
        @click="openLightbox(i)"
        :aria-label="`Agrandir l'image ${i + 1}`"
      >
        <img
          :src="img.thumbnail || img.url"
          :alt="img.title || `Screenshot du serveur Create France ${i + 1}`"
          loading="lazy"
        />
        <span v-if="img.type === 'gif'" class="gif-badge">GIF</span>
        <span v-if="img.title" class="gallery-caption">{{ img.title }}</span>
        <span class="gallery-zoom">&#8853;</span>
      </button>
    </div>

    <!-- Lightbox -->
    <Teleport to="body">
      <Transition name="lightbox-fade">
        <div v-if="lightboxIndex !== null" class="lightbox" @click.self="closeLightbox">
          <button class="lightbox-close" @click="closeLightbox" aria-label="Fermer">&times;</button>
          <button class="lightbox-nav lightbox-prev" @click.stop="prev" aria-label="Image précédente">&#8249;</button>
          <img
            :key="lightboxIndex"
            :src="images[lightboxIndex].url"
            :alt="images[lightboxIndex].title || `Screenshot du serveur Create France ${lightboxIndex + 1}`"
            class="lightbox-img"
          />
          <button class="lightbox-nav lightbox-next" @click.stop="next" aria-label="Image suivante">&#8250;</button>
          <div class="lightbox-counter">
            <span v-if="images[lightboxIndex].title" class="lightbox-title">{{ images[lightboxIndex].title }}</span>
            {{ lightboxIndex + 1 }} / {{ images.length }}
          </div>
        </div>
      </Transition>
    </Teleport>
  </section>
</template>

<script setup lang="ts">
const { images } = useCurseForgeImages()

const lightboxIndex = ref<number | null>(null)

function openLightbox(i: number) {
  lightboxIndex.value = i
  document.body.style.overflow = 'hidden'
}

function closeLightbox() {
  lightboxIndex.value = null
  document.body.style.overflow = ''
}

function prev() {
  if (lightboxIndex.value === null) return
  lightboxIndex.value = (lightboxIndex.value - 1 + images.value.length) % images.value.length
}

function next() {
  if (lightboxIndex.value === null) return
  lightboxIndex.value = (lightboxIndex.value + 1) % images.value.length
}

function onKeydown(e: KeyboardEvent) {
  if (lightboxIndex.value === null) return
  if (e.key === 'Escape') closeLightbox()
  if (e.key === 'ArrowLeft') prev()
  if (e.key === 'ArrowRight') next()
}

let observer: IntersectionObserver | null = null

function observeItems() {
  observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        setTimeout(() => entry.target.classList.add('visible'), i * 60)
        observer!.unobserve(entry.target)
      }
    })
  }, { threshold: 0.1 })

  document.querySelectorAll('.gallery-item').forEach(c => observer!.observe(c))
}

watch(images, () => {
  nextTick(() => observeItems())
})

onMounted(() => {
  window.addEventListener('keydown', onKeydown)
  observeItems()
})

onUnmounted(() => {
  window.removeEventListener('keydown', onKeydown)
  observer?.disconnect()
  document.body.style.overflow = ''
})
</script>

<style scoped>
.gallery-section {
    position: relative; z-index: 2;
    padding: 5rem 2rem; max-width: 1100px; margin: 0 auto;
}

.gallery-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
    grid-auto-rows: 180px;
    grid-auto-flow: dense;
    gap: 12px;
}

.gallery-item {
    position: relative; border: 1px solid var(--glass-border);
    border-radius: 16px; overflow: hidden; padding: 0;
    background: var(--glass); cursor: pointer;
    opacity: 0; transform: translateY(15px);
    transition: opacity 0.5s ease, transform 0.5s ease, border-color 0.3s ease;
}

.gallery-item.visible { opacity: 1; transform: translateY(0); }
.gallery-item.wide { grid-column: span 2; grid-row: span 2; }

.gallery-item img {
    width: 100%; height: 100%; object-fit: cover; display: block;
    transition: transform 0.5s ease;
}

.gallery-item:hover { border-color: rgba(212, 118, 78, 0.4); }
.gallery-item:hover img { transform: scale(1.05); }

.gallery-zoom {
    position: absolute; inset: 0;
    display: flex; align-items: center; justify-content: center;
    font-size: 2rem; color: #fff;
    background: rgba(28, 24, 22, 0.45);
    opacity: 0; transition: opacity 0.3s ease;
}

.gallery-item:hover .gallery-zoom { opacity: 1; }

.gallery-caption {
    position: absolute; left: 0; right: 0; bottom: 0; z-index: 1;
    padding: 1.4rem 0.8rem 0.6rem; text-align: left;
    font-size: 0.72rem; font-weight: 500; color: var(--text-primary);
    background: linear-gradient(to top, rgba(28, 24, 22, 0.85), transparent);
    white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
    opacity: 0; transition: opacity 0.3s ease;
}

.gallery-item:hover .gallery-caption { opacity: 1; }

.gif-badge {
    position: absolute; top: 10px; right: 10px; z-index: 1;
    font-family: 'Orbitron', sans-serif; font-size: 0.6rem; font-weight: 700;
    color: var(--terre-cuite-light); letter-spacing: 1px;
    background: rgba(28, 24, 22, 0.8); padding: 0.2rem 0.5rem;
    border-radius: 6px; border: 1px solid rgba(212, 118, 78, 0.3);
}

/* ======== LIGHTBOX ======== */
.lightbox {
    position: fixed; inset: 0; z-index: 1000;
    background: rgba(20, 17, 15, 0.95);
    backdrop-filter: blur(8px); -webkit-backdrop-filter: blur(8px);
    display: flex; align-items: center; justify-content: center;
    padding: 3rem;
}

.lightbox-img {
    max-width: 100%; max-height: 100%; object-fit: contain;
    border-radius: 12px; box-shadow: 0 20px 60px rgba(0, 0, 0, 0.6);
}

.lightbox-close {
    position: absolute; top: 1rem; right: 1.5rem; z-index: 2;
    background: none; border: none; color: var(--text-secondary);
    font-size: 2.5rem; cursor: pointer; line-height: 1;
    transition: color 0.3s ease;
}

.lightbox-close:hover { color: var(--terre-cuite); }

.lightbox-nav {
    position: absolute; top: 50%; transform: translateY(-50%); z-index: 2;
    width: 48px; height: 48px; border-radius: 50%;
    background: rgba(255, 255, 255, 0.06); border: 1px solid var(--glass-border);
    color: var(--text-primary); font-size: 1.8rem; line-height: 1;
    cursor: pointer; transition: all 0.3s ease;
    display: flex; align-items: center; justify-content: center;
}

.lightbox-nav:hover { background: rgba(212, 118, 78, 0.2); border-color: var(--terre-cuite); }
.lightbox-prev { left: 1.5rem; }
.lightbox-next { right: 1.5rem; }

.lightbox-counter {
    position: absolute; bottom: 1.2rem; left: 50%; transform: translateX(-50%);
    font-family: 'Orbitron', sans-serif; font-size: 0.8rem;
    color: var(--text-secondary); letter-spacing: 2px;
    display: flex; align-items: center; gap: 1rem; white-space: nowrap;
}

.lightbox-title {
    font-family: 'Poppins', sans-serif; font-size: 0.85rem;
    color: var(--text-primary); letter-spacing: 0.3px;
    max-width: 50vw; overflow: hidden; text-overflow: ellipsis;
}

.lightbox-fade-enter-active, .lightbox-fade-leave-active { transition: opacity 0.3s ease; }
.lightbox-fade-enter-from, .lightbox-fade-leave-to { opacity: 0; }

@media (max-width: 768px) {
    .gallery-grid { grid-template-columns: repeat(2, 1fr); grid-auto-rows: 140px; }
    .gallery-item.wide { grid-column: span 2; grid-row: span 1; }
    .lightbox { padding: 1rem; }
    .lightbox-nav { width: 40px; height: 40px; }
    .lightbox-prev { left: 0.5rem; }
    .lightbox-next { right: 0.5rem; }
}
</style>
