<template>
  <section id="faq" class="faq-section">
    <h2 class="section-title">{{ t('faq.title') }}</h2>
    <p class="faq-intro" v-html="t('faq.intro')" />
    <div class="faq-list">
      <details v-for="(item, i) in faq" :key="item.q" class="faq-item" :open="i === 0">
        <summary>{{ item.q }}</summary>
        <p v-html="item.a" />
      </details>
    </div>
  </section>
</template>

<script setup lang="ts">
// Same questions as the FAQPage structured data below, so what Google reads matches the page (in the page language).
const { t, tm, rt, locale } = useI18n()
const faq = computed(() =>
  (tm('faq.items') as unknown as { q: unknown; a: unknown }[]).map((f) => ({ q: rt(f.q as any), a: rt(f.a as any) })),
)

useHead({
  script: [{
    key: 'ld-faq',
    type: 'application/ld+json',
    innerHTML: computed(() => JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      inLanguage: locale.value === 'en' ? 'en' : 'fr-FR',
      mainEntity: faq.value.map((f) => ({
        '@type': 'Question',
        name: f.q,
        acceptedAnswer: { '@type': 'Answer', text: f.a.replace(/<[^>]+>/g, '') },
      })),
    })),
  }],
})
</script>

<style scoped>
.faq-section { position: relative; z-index: 2; padding: 4rem 2rem 5rem; max-width: 900px; margin: 0 auto; }
.faq-intro { color: var(--text-secondary); line-height: 1.75; font-size: 0.98rem; margin: 0 auto 2rem; max-width: 760px; text-align: center; }
.faq-intro :deep(strong) { color: var(--terre-cuite-light); font-weight: 600; }
.faq-list { display: flex; flex-direction: column; gap: 0.7rem; }
.faq-item {
  background: var(--glass); border: 1px solid var(--glass-border); border-radius: 12px;
  backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); padding: 0 1.2rem; transition: border-color 0.3s;
}
.faq-item[open], .faq-item:hover { border-color: rgba(212, 118, 78, 0.3); }
.faq-item summary {
  cursor: pointer; list-style: none; padding: 1rem 0; font-family: 'Orbitron', sans-serif; font-size: 0.88rem;
  font-weight: 700; color: var(--terre-cuite); display: flex; justify-content: space-between; align-items: center; gap: 1rem;
}
.faq-item summary::-webkit-details-marker { display: none; }
.faq-item summary::after { content: '+'; font-size: 1.2rem; color: var(--terre-cuite-light); transition: transform 0.3s; }
.faq-item[open] summary::after { transform: rotate(45deg); }
.faq-item p { color: var(--text-secondary); line-height: 1.7; font-size: 0.92rem; padding: 0 0 1.1rem; margin: 0; }
.faq-item p :deep(a) { color: var(--mandarine); }
.faq-item p :deep(strong) { color: var(--text-primary, #f3ece6); }
@media (max-width: 600px) { .faq-section { padding: 3rem 1rem 4rem; } }
</style>
