<template>
  <nav class="wnav" :aria-label="t('wiki.nav.title')">
    <div v-for="m in tree" :key="m.id" class="wnav-mod" :class="{ current: m.id === currentMod }">
      <NuxtLink :to="{ path: home, query: { mod: m.id } }" class="wnav-mod-head">
        <img :src="wikiItemIcon(m.icon)!" alt="" width="28" height="28" loading="lazy">
        <span>{{ m.name }}</span>
        <small>{{ m.count }}</small>
      </NuxtLink>
      <ul v-if="m.id === currentMod" class="wnav-cats">
        <li v-for="c in m.cats" :key="c.id">
          <details :open="c.id === currentCategory">
            <summary :class="{ current: c.id === currentCategory }">
              <img v-if="c.icon" :src="wikiItemIcon(c.icon)!" alt="" width="20" height="20" loading="lazy">
              {{ c.id === m.id ? t('wiki.allPages') : c.name }} <small>{{ c.pages.length }}</small>
            </summary>
            <ul class="wnav-pages">
              <li v-for="p in c.pages" :key="p.slug">
                <NuxtLink :to="p.path" :aria-current="p.slug === currentSlug ? 'page' : undefined">
                  <img :src="wikiItemIcon(p.blockId)!" alt="" width="20" height="20" loading="lazy">
                  {{ p.name }}
                </NuxtLink>
              </li>
            </ul>
          </details>
        </li>
      </ul>
    </div>
  </nav>
</template>

<script setup lang="ts">
import type { WikiLocale, WikiNavMod } from '~/utils/wiki'

// mods > categories > pages, from the server (the categories are listed for the current mod only)
const props = defineProps<{ lang: WikiLocale; mods: WikiNavMod[]; currentSlug?: string; currentCategory?: string; currentMod?: string }>()
const { t } = useI18n()
const home = computed(() => wikiHomePath(props.lang))
const tree = computed(() => props.mods)
</script>

<style scoped>
.wnav { font-size: 0.84rem; }
.wnav-mod + .wnav-mod { margin-top: 0.35rem; }
.wnav-mod-head {
  display: flex; align-items: center; gap: 0.55rem; padding: 0.45rem 0.55rem; border-radius: 9px; text-decoration: none;
  color: var(--text-secondary); font-family: 'Orbitron', sans-serif; font-size: 0.74rem; letter-spacing: 0.4px;
}
.wnav-mod-head:hover { background: rgba(255, 255, 255, 0.04); color: var(--text-primary); }
.wnav-mod.current .wnav-mod-head { color: var(--terre-cuite-light); background: rgba(212, 118, 78, 0.1); }
.wnav-mod-head img { width: 28px; height: 28px; }
.wnav-mod-head span { flex: 1; }
.wnav-mod-head small, summary small { color: var(--text-muted); font-family: 'Poppins', sans-serif; font-size: 0.7rem; }
.wnav-cats { list-style: none; margin: 0.3rem 0 0.4rem 0.6rem; padding-left: 0.5rem; border-left: 1px solid rgba(212, 118, 78, 0.15); }
summary {
  list-style: none; cursor: pointer; display: flex; align-items: center; gap: 0.45rem; padding: 0.32rem 0.4rem;
  border-radius: 7px; color: var(--text-secondary);
}
summary::-webkit-details-marker { display: none; }
summary::after { content: '▸'; margin-left: auto; color: var(--text-muted); transition: transform 0.15s; }
details[open] > summary::after { transform: rotate(90deg); }
summary:hover { color: var(--text-primary); }
summary.current { color: var(--text-primary); font-weight: 600; }
summary img, .wnav-pages img { width: 20px; height: 20px; flex: none; }
.wnav-pages { list-style: none; margin: 0.15rem 0 0.35rem 0.4rem; }
.wnav-pages a {
  display: flex; align-items: center; gap: 0.45rem; padding: 0.25rem 0.4rem; border-radius: 6px; text-decoration: none;
  color: var(--text-secondary); font-size: 0.8rem; line-height: 1.3;
}
.wnav-pages a:hover { color: var(--text-primary); background: rgba(255, 255, 255, 0.04); }
.wnav-pages a[aria-current] { color: var(--mandarine-light); background: rgba(242, 166, 90, 0.1); font-weight: 600; }
</style>
