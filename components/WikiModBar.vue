<template>
  <nav class="wmodbar" :aria-label="t('wiki.mods')">
    <div class="wmodbar-inner">
      <NuxtLink
        v-for="m in tree"
        :key="m.id"
        :to="{ path: home, query: { mod: m.id } }"
        class="wmodbar-tab"
        :class="{ active: m.id === active }"
        :aria-current="m.id === active ? 'true' : undefined"
      >
        <img :src="wikiItemIcon(m.icon)!" alt="" width="36" height="36">
        <span class="wmodbar-txt">
          <strong>{{ m.name }}</strong>
          <small>{{ t('wiki.pageCount', { n: m.count }) }}</small>
        </span>
      </NuxtLink>
    </div>
  </nav>
</template>

<script setup lang="ts">
// Tabs of the mods covered by the wiki, at the top of the wiki home and of every wiki page (sticky under the navbar).
const props = defineProps<{ lang: WikiLocale; active?: string }>()
const { t } = useI18n()
const home = computed(() => wikiHomePath(props.lang))
const tree = computed(() => wikiTree(props.lang))
</script>

<style scoped>
.wmodbar {
  position: sticky; top: 58px; z-index: 40; margin: 0 -1rem; padding: 0.5rem 1rem;
  background: rgba(28, 24, 22, 0.88); backdrop-filter: blur(14px); -webkit-backdrop-filter: blur(14px);
  border-bottom: 1px solid rgba(212, 118, 78, 0.18);
}
.wmodbar-inner { display: flex; gap: 0.5rem; overflow-x: auto; scrollbar-width: none; }
.wmodbar-inner::-webkit-scrollbar { display: none; }
.wmodbar-tab {
  flex: 1 0 auto; display: flex; align-items: center; gap: 0.6rem; padding: 0.45rem 0.9rem 0.45rem 0.5rem; border-radius: 11px;
  text-decoration: none; border: 1px solid rgba(255, 255, 255, 0.06); background: rgba(255, 255, 255, 0.03);
  transition: border-color 0.2s, background 0.2s;
}
.wmodbar-tab:hover { border-color: rgba(212, 118, 78, 0.4); }
.wmodbar-tab.active {
  background: linear-gradient(135deg, rgba(212, 118, 78, 0.28), rgba(242, 166, 90, 0.12)); border-color: var(--terre-cuite);
}
.wmodbar-tab img { width: 36px; height: 36px; flex: none; }
.wmodbar-txt { display: flex; flex-direction: column; line-height: 1.2; white-space: nowrap; }
.wmodbar-txt strong { font-family: 'Orbitron', sans-serif; font-size: 0.78rem; color: var(--text-secondary); }
.wmodbar-tab.active strong { color: var(--terre-cuite-light); }
.wmodbar-txt small { font-size: 0.7rem; color: var(--text-muted); }
@media (min-width: 760px) { .wmodbar { margin: 0 -2rem; padding: 0.55rem 2rem; } }
/* many mods: on wide screens the tabs wrap on two lines instead of scrolling sideways */
@media (min-width: 960px) {
  .wmodbar-inner { flex-wrap: wrap; overflow: visible; }
  .wmodbar-tab { flex: 1 1 0; min-width: 170px; }
  .wmodbar-txt { white-space: normal; }
}
</style>
