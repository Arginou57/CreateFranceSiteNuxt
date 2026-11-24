<template>
  <div class="wrecipe">
    <p class="wrecipe-label">{{ recipe.label }}</p>
    <div class="wrecipe-craft">
      <div class="wrecipe-grid" role="table" :aria-label="t('wiki.recipeAria', { result: recipe.result })">
        <div v-for="(row, i) in cells" :key="i" class="wrecipe-row" role="row">
          <span v-for="(c, j) in row" :key="j" class="wrecipe-slot" :class="{ empty: !c.name }" role="cell" :title="c.name || undefined">
            <img v-if="c.icon" :src="c.icon" :alt="c.name || ''" width="64" height="64" loading="lazy" decoding="async">
            <span v-else-if="c.name" class="wrecipe-txt">{{ c.name }}</span>
          </span>
        </div>
      </div>
      <span class="wrecipe-arrow" aria-hidden="true">
        <svg viewBox="0 0 32 24" width="34" height="26"><path d="M2 9h18V3l10 9-10 9v-6H2z" fill="currentColor" /></svg>
      </span>
      <span class="wrecipe-slot wrecipe-out" :title="recipe.result">
        <img v-if="resultIcon" :src="resultIcon" :alt="recipe.result" width="64" height="64" loading="lazy" decoding="async">
        <b v-if="count > 1" class="wrecipe-count" aria-hidden="true">{{ count }}</b>
      </span>
    </div>
    <p class="wrecipe-result">→ {{ recipe.result }}</p>
    <!-- the names in clear text: readable on mobile (no hover) and for screen readers; ingredients with a page are links -->
    <ul class="wrecipe-legend" :aria-label="t('wiki.ingredients')">
      <li v-for="ing in ingredients" :key="ing.name">
        <img v-if="ing.icon" :src="ing.icon" alt="" width="24" height="24" loading="lazy">
        <span class="wrecipe-qty">{{ ing.count }} ×</span>
        <NuxtLink v-if="ing.path" :to="ing.path">{{ ing.name }}</NuxtLink>
        <span v-else>{{ ing.name }}</span>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import type { WikiRecipeView } from '~/utils/wiki'

// built on the server (server/lib/wikiViews.ts → recipeView): icons, ingredient counts and links are ready
const props = defineProps<{ recipe: WikiRecipeView }>()
const { t } = useI18n()
const cells = computed(() => props.recipe.cells)
const resultIcon = computed(() => props.recipe.resultIcon)
const count = computed(() => props.recipe.count)
const ingredients = computed(() => props.recipe.ingredients)
</script>

<style scoped>
.wrecipe { margin-top: 1.1rem; padding-top: 1rem; border-top: 1px solid var(--border); }
.wrecipe-label { color: var(--text-muted); font-size: 0.78rem; margin-bottom: 0.6rem; }
.wrecipe-craft {
  display: inline-flex; align-items: center; gap: 0.7rem; padding: 0.7rem; border-radius: 10px;
  background: #c6c6c6; box-shadow: inset 2px 2px 0 #fff, inset -2px -2px 0 #555;
}
.wrecipe-grid { display: grid; gap: 0; }
.wrecipe-row { display: flex; }
.wrecipe-slot {
  position: relative; width: 52px; height: 52px; display: flex; align-items: center; justify-content: center;
  background: #8b8b8b; box-shadow: inset 2px 2px 0 #373737, inset -2px -2px 0 #fff; margin: 1px;
}
.wrecipe-slot img { width: 42px; height: 42px; }
.wrecipe-txt { font-size: 0.55rem; line-height: 1.1; color: #1c1816; text-align: center; padding: 2px; }
.wrecipe-arrow { color: #8b8b8b; display: flex; }
.wrecipe-out { width: 64px; height: 64px; }
.wrecipe-out img { width: 52px; height: 52px; }
.wrecipe-count {
  position: absolute; right: 4px; bottom: 1px; font-family: 'Orbitron', sans-serif; font-size: 1rem; font-weight: 700; color: #fff;
  text-shadow: 2px 2px 0 #3f3f3f;
}
.wrecipe-result { color: var(--mandarine); font-size: 0.82rem; margin-top: 0.55rem; }
.wrecipe-legend { list-style: none; display: grid; gap: 0.3rem; margin-top: 0.6rem; font-size: 0.82rem; color: var(--text-secondary); }
.wrecipe-legend li { display: flex; align-items: center; gap: 0.45rem; }
.wrecipe-legend img { width: 24px; height: 24px; }
.wrecipe-qty { color: var(--text-muted); min-width: 1.8rem; }
.wrecipe-legend a { color: var(--mandarine); }
@media (max-width: 380px) {
  .wrecipe-slot { width: 44px; height: 44px; }
  .wrecipe-slot img { width: 36px; height: 36px; }
  .wrecipe-out { width: 54px; height: 54px; }
}
</style>
