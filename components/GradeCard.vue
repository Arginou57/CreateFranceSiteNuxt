<template>
  <div class="grade-card" :class="{ featured }" :data-tier="tier">
    <div v-if="featured" class="popular-badge">Populaire</div>
    <div class="card-header">
      <div class="tier-badge">{{ tierLabel }}</div>
      <h3 class="grade-name">{{ name }}</h3>
      <div class="price">{{ price }}&euro;<span>/30 jours</span></div>
    </div>
    <div class="card-scene" :class="`scene-${slug}`">
      <div class="scene-bg"></div>
      <img :src="image" :alt="name" class="grade-img">
    </div>
    <ul class="perks-list">
      <li v-for="perk in perks" :key="perk">
        <span class="perk-icon">&#9881;</span> {{ perk }}
      </li>
    </ul>
    <div :id="`paypal-button-container-${planId}`" class="paypal-container"></div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  tier: number
  tierLabel: string
  name: string
  slug: string
  price: string
  perks: string[]
  planId: string
  image: string
  featured?: boolean
}>()

onMounted(() => {
  const renderPayPal = () => {
    if (typeof window !== 'undefined' && (window as any).paypal) {
      (window as any).paypal.Buttons({
        style: { shape: 'rect', color: 'gold', layout: 'vertical', label: 'subscribe' },
        createSubscription: (_d: any, actions: any) => actions.subscription.create({ plan_id: props.planId }),
        onApprove: (data: any) => { alert('Merci pour votre soutien ! ID: ' + data.subscriptionID) },
      }).render(`#paypal-button-container-${props.planId}`)
    } else {
      setTimeout(renderPayPal, 500)
    }
  }
  renderPayPal()
})
</script>

<style scoped>
.grade-card {
    position: relative; border-radius: 16px; padding: 2rem;
    background: var(--glass); border: 1px solid var(--glass-border);
    backdrop-filter: blur(12px); transition: all 0.4s ease;
    opacity: 0; transform: translateY(20px); overflow: hidden;
}

.grade-card.visible { opacity: 1; transform: translateY(0); }
.grade-card:hover { border-color: rgba(212, 118, 78, 0.18); }

.grade-card.featured { border-color: rgba(212, 118, 78, 0.2); box-shadow: 0 0 30px rgba(212, 118, 78, 0.06); }
.grade-card.featured.visible { transform: scale(1.02); }
.grade-card.featured:hover { transform: scale(1.04); }

.popular-badge {
    position: absolute; top: 1rem; right: 1rem;
    background: linear-gradient(135deg, var(--terre-cuite), var(--mandarine));
    color: #fff; font-size: 0.65rem; font-weight: 700;
    text-transform: uppercase; letter-spacing: 1px;
    padding: 0.25rem 0.7rem; border-radius: 20px; z-index: 3;
}

.card-header { text-align: center; margin-bottom: 1.5rem; }

.tier-badge {
    display: inline-flex; align-items: center; justify-content: center;
    width: 36px; height: 36px; border-radius: 50%;
    border: 2px solid var(--terre-cuite); color: var(--terre-cuite);
    font-family: 'Orbitron', sans-serif; font-weight: 700; font-size: 0.8rem; margin-bottom: 0.6rem;
}

.grade-name {
    font-family: 'Orbitron', sans-serif; font-size: 1.2rem; font-weight: 700;
    color: var(--text-primary); text-transform: uppercase; letter-spacing: 2px; margin-bottom: 0.4rem;
}

.price { font-family: 'Orbitron', sans-serif; font-size: 2rem; font-weight: 900; color: var(--terre-cuite); }
.price span { font-size: 0.8rem; font-weight: 400; color: var(--text-muted); }

/* Scenes */
.card-scene {
    position: relative; width: 100%; height: 340px; border-radius: 12px; overflow: hidden;
    margin-bottom: 1.5rem; background: rgba(212, 118, 78, 0.03); border: 1px solid var(--border);
}

.scene-bg { position: absolute; inset: 0; background: radial-gradient(circle at 50% 80%, rgba(212, 118, 78, 0.06) 0%, transparent 60%); }

.grade-img {
    position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);
    height: 100%; width: auto; object-fit: contain;
    filter: drop-shadow(0 4px 12px rgba(0, 0, 0, 0.3));
    transition: transform 0.4s ease;
}

.grade-card:hover .grade-img { transform: translate(-50%, -50%) scale(1.05); }

/* Perks */
.perks-list { list-style: none; margin-bottom: 1.5rem; }
.perks-list li { display: flex; align-items: center; gap: 0.6rem; padding: 0.5rem 0; color: var(--text-secondary); font-size: 0.85rem; border-bottom: 1px solid var(--border-light); font-weight: 300; }
.perks-list li:last-child { border-bottom: none; }
.perk-icon { color: var(--terre-cuite); font-size: 0.7rem; flex-shrink: 0; }

.paypal-container { position: relative; z-index: 3; margin-top: 0.5rem; }

/* Patron - accent sauge */
.grade-card[data-tier="3"] .tier-badge { border-color: var(--sauge); color: var(--sauge); }
.grade-card[data-tier="3"] .grade-name { color: var(--sauge-dark); }
.grade-card[data-tier="3"] .price { color: var(--sauge-dark); }
.grade-card[data-tier="3"] .perk-icon { color: var(--sauge); }

@media (max-width: 768px) {
    .grade-card.featured.visible { transform: scale(1); }
    .grade-card.featured:hover { transform: translateY(-4px); }
}
</style>
