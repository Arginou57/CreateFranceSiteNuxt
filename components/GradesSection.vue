<template>
  <section id="grades" class="grades-section">
    <h2 class="section-title">Soutenir le Serveur</h2>
    <p class="section-subtitle">Choisissez votre grade et aidez-nous a faire tourner les engrenages !</p>
    <div class="donate-notice">
      <span class="notice-icon">&#9888;</span>
      <span>Avant de vous abonner, merci d'envoyer un message à <strong>arginou#9106</strong> sur Discord afin de recevoir votre grade.</span>
    </div>
    <div class="grades-container">
      <GradeCard
        v-for="grade in grades"
        :key="grade.planId"
        v-bind="grade"
      />
    </div>

    <div ref="fundingBar" class="funding-progress">
      <div class="funding-header">
        <span class="funding-title">Objectif mensuel</span>
        <span class="funding-percent">{{ progressPercent }}%</span>
      </div>
      <div class="funding-bar">
        <div class="funding-fill" :style="{ width: barVisible ? progressPercent + '%' : '0%' }" />
      </div>
      <div class="funding-details">
        <span class="funding-amount">{{ currentFunding.toFixed(2) }}€ recoltés</span>
        <span class="funding-goal">{{ goalFunding }}€</span>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
const currentFunding = 14.82
const goalFunding = 143
const progressPercent = computed(() => Math.round((currentFunding / goalFunding) * 100))

const fundingBar = ref<HTMLElement | null>(null)
const barVisible = ref(false)

const grades = [
  {
    tier: 1,
    tierLabel: 'I',
    name: 'Mecene',
    slug: 'mecene',
    price: '2.99',
    image: '/images/mecene.png',
    planId: 'P-0MC85129CX493101DNHDRBOA',
    perks: [
      'Grade en jeu [Mecene]',
      '1 home',
      '/tpa - Se teleporter aux joueurs',
      '/spawn - Retourner au spawn',
      '/hdv - Hotel des ventes a distance',
    ],
  },
  {
    tier: 2,
    tierLabel: 'II',
    name: 'Bienfaiteur',
    slug: 'bienfaiteur',
    price: '5.99',
    image: '/images/bienfaiteur.png',
    planId: 'P-48M95932LE9502235NHDRDCY',
    featured: true,
    perks: [
      'Grade en jeu [Bienfaiteur]',
      '3 homes',
      '/tpa - Se teleporter aux joueurs',
      '/tpahere - Teleporter un joueur a soi',
      '/spawn - Retourner au spawn',
      '/hdv - Hotel des ventes a distance',
    ],
  },
  {
    tier: 3,
    tierLabel: 'III',
    name: 'Patron',
    slug: 'patron',
    price: '9.99',
    image: '/images/patron.png',
    planId: 'P-3DT928258J300445TNHDRFMA',
    perks: [
      'Tous les avantages Bienfaiteur',
      'Grade en jeu [Patron]',
      '5 homes',
      '/spawn - Retourner au spawn',
      '/hdv - Hotel des ventes a distance',
      'Acces anticipe aux events',
    ],
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

  document.querySelectorAll('.grade-card').forEach(c => observer.observe(c))

  if (fundingBar.value) {
    const fundingObserver = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        barVisible.value = true
        fundingObserver.disconnect()
      }
    }, { threshold: 0.3 })
    fundingObserver.observe(fundingBar.value)
  }
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
.donate-notice strong { color: var(--terre-cuite); }

.funding-progress {
    margin-top: 2.5rem;
    background: rgba(255, 255, 255, 0.03);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 14px;
    padding: 1.4rem 1.6rem;
    backdrop-filter: blur(10px);
}

.funding-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.8rem;
}

.funding-title {
    font-size: 0.95rem;
    font-weight: 600;
    color: var(--text-primary);
}

.funding-percent {
    font-size: 0.95rem;
    font-weight: 700;
    color: var(--terre-cuite);
}

.funding-bar {
    width: 100%;
    height: 12px;
    background: rgba(255, 255, 255, 0.06);
    border-radius: 6px;
    overflow: hidden;
}

.funding-fill {
    height: 100%;
    background: linear-gradient(90deg, var(--terre-cuite), var(--mandarine));
    border-radius: 6px;
    transition: width 1.2s cubic-bezier(0.22, 1, 0.36, 1);
}

.funding-details {
    display: flex;
    justify-content: space-between;
    margin-top: 0.6rem;
    font-size: 0.82rem;
    color: var(--text-secondary);
}

.funding-amount { font-weight: 500; }
.funding-goal { opacity: 0.7; }

@media (max-width: 768px) {
    .grades-container { grid-template-columns: 1fr; max-width: 400px; margin: 0 auto; }
}
</style>
