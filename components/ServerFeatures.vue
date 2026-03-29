<template>
  <section id="serveur" class="serveur-section">
    <h2 class="section-title">Le Serveur</h2>
    <p class="section-subtitle">Un univers de creativite infinie propulse par le mod Create</p>
    <div class="features-grid">
      <div v-for="feature in features" :key="feature.title" class="feature-card">
        <div class="feature-icon">
          <img :src="feature.icon" :alt="feature.title" class="feature-img">
        </div>
        <h3>{{ feature.title }}</h3>
        <p>{{ feature.description }}</p>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
const features = [
  {
    title: 'Construisez',
    icon: '/images/icon-construisez.png',
    description: 'Machines complexes, systemes automatises et structures spectaculaires.',
  },
  {
    title: 'Explorez',
    icon: '/images/icon-explorez.png',
    description: 'Decouvrez de nouveaux mondes et trouvez des ressources rares.',
  },
  {
    title: 'Communaute',
    icon: '/images/icon-communaute.png',
    description: 'Participez aux events et collaborez sur des projets ambitieux.',
  },
]

onMounted(() => {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        setTimeout(() => entry.target.classList.add('visible'), i * 100)
      }
    })
  }, { threshold: 0.1 })

  document.querySelectorAll('.feature-card').forEach(c => observer.observe(c))
})
</script>

<style scoped>
.serveur-section {
    position: relative; z-index: 2; padding: 5rem 2rem; max-width: 1000px; margin: 0 auto;
}

.serveur-section::before {
    content: ''; position: absolute; top: -2rem; left: -50vw; right: -50vw; bottom: -2rem;
    background: url('/images/serveur-bg.png') center center / cover no-repeat;
    opacity: 0.12; z-index: -1;
}

.features-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.2rem; }

.feature-card {
    text-align: center; padding: 2rem 1.5rem; border-radius: 16px;
    background: var(--glass); border: 1px solid var(--glass-border);
    backdrop-filter: blur(12px); transition: all 0.4s ease;
    opacity: 0; transform: translateY(20px);
}

.feature-card.visible { opacity: 1; transform: translateY(0); }
.feature-card:hover { border-color: rgba(212, 118, 78, 0.2); transform: translateY(-4px); }

.feature-icon { width: 80px; height: 80px; margin: 0 auto 1.2rem; }
.feature-img { width: 100%; height: 100%; object-fit: contain; filter: drop-shadow(0 2px 8px rgba(0, 0, 0, 0.2)); }
.feature-card h3 { font-family: 'Orbitron', sans-serif; font-size: 0.95rem; font-weight: 700; color: var(--terre-cuite); text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 0.6rem; }
.feature-card p { color: var(--text-secondary); font-size: 0.85rem; line-height: 1.6; font-weight: 300; }

@media (max-width: 900px) {
    .features-grid { grid-template-columns: 1fr; max-width: 400px; margin: 0 auto; }
}
</style>
