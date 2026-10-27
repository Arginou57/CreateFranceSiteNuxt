<template>
  <aside class="wiki-cta" aria-labelledby="wiki-cta-title">
    <div class="wiki-cta-gear" aria-hidden="true">&#9881;</div>
    <h2 id="wiki-cta-title">{{ t('wiki.cta.title') }}</h2>
    <p v-html="t('wiki.cta.text', { lead: safeLead })" />
    <div class="wiki-cta-actions">
      <a :href="launcher" class="wiki-cta-btn" download>{{ t('wiki.cta.launcher') }}</a>
      <a :href="discord" class="wiki-cta-link" target="_blank" rel="noopener">{{ t('wiki.cta.discord') }}</a>
    </div>
    <p class="wiki-cta-ip" v-html="t('wiki.cta.ip')" />
  </aside>
</template>

<script setup lang="ts">
const props = defineProps<{ lead?: string }>()
const { t } = useI18n()
const launcher = WIKI_LAUNCHER
const discord = WIKI_DISCORD
// the lead is plain text (page name inside): escape it, the rest of the message is our own HTML
const safeLead = computed(() => (props.lead || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'))
</script>

<style scoped>
.wiki-cta {
  position: relative; overflow: hidden; margin: 3rem 0 2rem; padding: 1.8rem 1.4rem; border-radius: 16px;
  background: linear-gradient(135deg, rgba(212, 118, 78, 0.16), rgba(242, 166, 90, 0.07));
  border: 1px solid rgba(212, 118, 78, 0.3);
}
.wiki-cta-gear {
  position: absolute; right: -18px; top: -26px; font-size: 7rem; color: rgba(212, 118, 78, 0.12);
  animation: spin 18s linear infinite; pointer-events: none;
}
.wiki-cta h2 {
  font-family: 'Orbitron', sans-serif; color: var(--terre-cuite-light); font-size: 1.05rem; letter-spacing: 0.5px;
  margin-bottom: 0.7rem; position: relative;
}
.wiki-cta p { color: var(--text-secondary); font-size: 0.92rem; line-height: 1.7; position: relative; }
.wiki-cta :deep(strong) { color: var(--text-primary); }
.wiki-cta-actions { display: flex; flex-wrap: wrap; gap: 0.8rem; align-items: center; margin-top: 1.2rem; position: relative; }
.wiki-cta-btn {
  display: inline-flex; padding: 0.8rem 1.3rem; border-radius: 10px; text-decoration: none;
  background: linear-gradient(135deg, var(--terre-cuite), var(--mandarine)); color: #1C1816;
  font-family: 'Orbitron', sans-serif; font-size: 0.8rem; font-weight: 700; letter-spacing: 0.5px;
  box-shadow: 0 6px 24px rgba(212, 118, 78, 0.35); transition: transform 0.2s;
}
.wiki-cta-btn:hover { transform: translateY(-2px); }
.wiki-cta-link { color: var(--mandarine); font-size: 0.88rem; font-weight: 500; }
.wiki-cta-ip { margin-top: 0.9rem; font-size: 0.78rem !important; color: var(--text-muted) !important; }
</style>
