<template>
  <section id="grades" class="grades-section">
    <h2 class="section-title">Soutenir le Serveur</h2>
    <p class="section-subtitle">Choisissez votre grade et aidez-nous a faire tourner les engrenages !</p>
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
})
</script>

<style scoped>
.grades-section { position: relative; z-index: 2; padding: 5rem 2rem; max-width: 1100px; margin: 0 auto; }

.grades-container { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1.5rem; align-items: start; }

@media (max-width: 768px) {
    .grades-container { grid-template-columns: 1fr; max-width: 400px; margin: 0 auto; }
}
</style>
