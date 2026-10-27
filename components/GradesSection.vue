<template>
  <section id="grades" class="grades-section">
    <h2 class="section-title">{{ t('grades.title') }}</h2>
    <p class="section-subtitle">{{ t('grades.subtitle') }}</p>
    <div class="donate-notice">
      <span class="notice-icon">&#9888;</span>
      <span v-html="t('grades.notice')" />
    </div>
    <div class="grades-container">
      <GradeCard
        v-for="grade in grades"
        :key="grade.planId"
        v-bind="grade"
      />
    </div>
  </section>
</template>

<script setup lang="ts">
// Rank names are the in-game tags ([Mecene], [Bienfaiteur], [Patron]) and the PayPal plan ids never change;
// the perks come from the locale files (grades.perks.<slug>).
const { t, tm, rt } = useI18n()
const perksOf = (slug: string) => (tm(`grades.perks.${slug}`) as unknown as unknown[]).map((p) => rt(p as any))

const gradeData = [
  {
    tier: 1,
    tierLabel: 'I',
    name: 'Mecene',
    slug: 'mecene',
    price: '2.99',
    image: '/images/mecene.webp',
    planId: 'P-0MC85129CX493101DNHDRBOA',
  },
  {
    tier: 2,
    tierLabel: 'II',
    name: 'Bienfaiteur',
    slug: 'bienfaiteur',
    price: '5.99',
    image: '/images/bienfaiteur.webp',
    planId: 'P-48M95932LE9502235NHDRDCY',
    featured: true,
  },
  {
    tier: 3,
    tierLabel: 'III',
    name: 'Patron',
    slug: 'patron',
    price: '9.99',
    image: '/images/patron.webp',
    planId: 'P-3DT928258J300445TNHDRFMA',
  },
]
const grades = computed(() => gradeData.map((g) => ({ ...g, perks: perksOf(g.slug) })))

onMounted(() => {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        setTimeout(() => entry.target.classList.add('visible'), i * 100)
      }
    })
  }, { threshold: 0.1 })

  document.querySelectorAll('.grade-card').forEach(c => observer.observe(c))

})
</script>

<style scoped>
.grades-section { position: relative; z-index: 2; padding: 5rem 2rem; max-width: 1100px; margin: 0 auto; }

.grades-container { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1.5rem; align-items: start; }

.donate-notice {
    display: flex; align-items: center; gap: 0.6rem;
    background: rgba(242, 166, 90, 0.08); border: 1px solid rgba(242, 166, 90, 0.25);
    border-radius: 10px; padding: 0.8rem 1.2rem; margin-bottom: 2rem;
    font-size: 0.9rem; color: var(--text-secondary); line-height: 1.5;
    text-align: left;
}
.donate-notice .notice-icon { color: var(--mandarine); font-size: 1.2rem; flex-shrink: 0; }
.donate-notice :deep(strong) { color: var(--terre-cuite); }


@media (max-width: 768px) {
    .grades-container { grid-template-columns: 1fr; max-width: 400px; margin: 0 auto; }
}
</style>
