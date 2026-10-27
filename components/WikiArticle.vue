<template>
  <main class="wiki-page">
    <nav class="wiki-crumbs" aria-label="Fil d'Ariane">
      <ol>
        <li><NuxtLink to="/">Accueil</NuxtLink></li>
        <li><NuxtLink to="/wiki">Wiki</NuxtLink></li>
        <li v-if="category"><NuxtLink :to="`/wiki#${category.id}`">{{ category.name }}</NuxtLink></li>
        <li aria-current="page">{{ page.name }}</li>
      </ol>
    </nav>

    <article class="wiki-article">
      <header class="wiki-head">
        <p class="wiki-kicker">Wiki Create · {{ category?.name }}</p>
        <h1>{{ page.name }}</h1>
        <p class="wiki-lead" v-html="page.intro" />
        <p class="wiki-meta">
          Create {{ page.createVersion }} · Minecraft {{ page.mcVersion }} · mis à jour le
          <time :datetime="page.dateModified">{{ dateFr(page.dateModified) }}</time>
        </p>
      </header>

      <div class="wiki-top">
        <WikiVideo v-if="page.videos[0]" class="wiki-top-video" :slug="page.slug" :video="page.videos[0]" />
        <div class="wiki-card wiki-facts">
          <h2 class="wiki-card-title">Fiche technique</h2>
          <dl>
            <template v-for="f in page.facts" :key="f.label">
              <dt>{{ f.label }}</dt>
              <dd>{{ f.value }}</dd>
            </template>
          </dl>
          <div v-if="page.recipe" class="wiki-recipe">
            <p class="wiki-recipe-label">{{ page.recipe.label }}</p>
            <div class="wiki-recipe-grid" role="table" :aria-label="`Recette : ${page.recipe.result}`">
              <div v-for="(row, i) in page.recipe.grid" :key="i" class="wiki-recipe-row" role="row">
                <span v-for="(cell, j) in row" :key="j" class="wiki-recipe-cell" :class="{ empty: !cell }" role="cell">{{ cell || '' }}</span>
              </div>
            </div>
            <p class="wiki-recipe-result">→ {{ page.recipe.result }}</p>
          </div>
        </div>
      </div>

      <nav class="wiki-toc" aria-label="Sommaire">
        <p>Sommaire</p>
        <ol>
          <li v-for="s in page.sections" :key="s.id"><a :href="`#${s.id}`">{{ s.title }}</a></li>
        </ol>
      </nav>

      <section v-for="s in page.sections" :id="s.id" :key="s.id" class="wiki-step" :class="{ 'has-media': s.image || s.video }">
        <h2>{{ s.title }}</h2>
        <div class="wiki-step-body">
          <div v-if="s.video || s.image" class="wiki-step-media">
            <WikiVideo v-if="s.video && videoOf(s.video)" :slug="page.slug" :video="videoOf(s.video)!" />
            <figure v-else-if="s.image">
              <img :src="media(page.slug, s.image)" :alt="s.alt || s.title" width="600" height="600" loading="lazy" decoding="async">
            </figure>
          </div>
          <div class="wiki-step-text" v-html="s.html" />
        </div>
      </section>

      <WikiCta :lead="`Envie de construire ta propre ${page.name.toLowerCase()} ?`" />

      <section class="wiki-related" aria-labelledby="wiki-related-title">
        <h2 id="wiki-related-title">Pages liées</h2>
        <div class="wiki-related-grid">
          <NuxtLink v-for="r in related" :key="r.slug" :to="`/wiki/${r.slug}`" class="wiki-card wiki-related-card">
            <img :src="media(r.slug, `${r.videos[0]?.id}_poster.jpg`)" :alt="r.name" width="96" height="96" loading="lazy" decoding="async">
            <span>
              <strong>{{ r.name }}</strong>
              <small>{{ catName(r.category) }}</small>
            </span>
          </NuxtLink>
        </div>
        <p class="wiki-back"><NuxtLink to="/wiki">← Tous les guides du wiki Create</NuxtLink></p>
      </section>

      <details class="wiki-sources">
        <summary>Sources des chiffres (code de Create {{ page.createVersion }})</summary>
        <ul>
          <li v-for="(src, i) in page.sources" :key="i">{{ src }}</li>
        </ul>
        <p>Textes et animations originaux de Create France, rendus d'après les scènes Ponder du mod. Create est un mod de la Create Team, non affilié à Create France.</p>
      </details>
    </article>
  </main>
</template>

<script setup lang="ts">
import type { WikiPage } from '~/utils/wiki'

const props = defineProps<{ page: WikiPage }>()
const media = wikiMedia
const catName = (id: string) => getWikiCategory(id)?.name
const category = computed(() => getWikiCategory(props.page.category))
const related = computed(() => props.page.related.map((s) => getWikiPage(s)).filter((p): p is WikiPage => !!p))

function videoOf(id: string) {
  return props.page.videos.find((v) => v.id === id)
}

function dateFr(d: string) {
  const [y, m, day] = d.split('-').map(Number)
  const mois = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre']
  return `${day} ${mois[m - 1]} ${y}`
}
</script>

<style scoped>
.wiki-page { position: relative; z-index: 2; overflow-wrap: break-word; max-width: 980px; margin: 0 auto; padding: 5.5rem 1rem 1rem; }

.wiki-crumbs ol { list-style: none; display: flex; flex-wrap: wrap; gap: 0.3rem; font-size: 0.78rem; color: var(--text-muted); }
.wiki-crumbs li + li::before { content: '›'; margin-right: 0.3rem; color: var(--text-muted); }
.wiki-crumbs a { color: var(--text-secondary); text-decoration: none; }
.wiki-crumbs a:hover { color: var(--terre-cuite); }
.wiki-crumbs [aria-current] { color: var(--terre-cuite-light); }

.wiki-head { margin: 1.4rem 0 1.6rem; }
.wiki-kicker { font-family: 'Orbitron', sans-serif; font-size: 0.7rem; letter-spacing: 1.5px; text-transform: uppercase; color: var(--sauge); margin-bottom: 0.4rem; }
.wiki-head h1 {
  font-family: 'Orbitron', sans-serif; color: var(--terre-cuite); font-weight: 900;
  font-size: clamp(1.7rem, 6vw, 2.6rem); line-height: 1.15; margin-bottom: 0.9rem;
}
.wiki-lead { color: var(--text-primary); font-size: 1.02rem; line-height: 1.75; font-weight: 300; max-width: 760px; }
.wiki-lead :deep(strong) { color: var(--mandarine-light); font-weight: 600; }
.wiki-meta { color: var(--text-muted); font-size: 0.75rem; margin-top: 0.8rem; }

.wiki-top { display: grid; gap: 1.2rem; grid-template-columns: minmax(0, 1fr); margin-bottom: 1.6rem; }

.wiki-card {
  background: var(--glass); border: 1px solid var(--glass-border); border-radius: 14px;
  backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px);
}
.wiki-facts { padding: 1.1rem 1.2rem; }
.wiki-card-title { font-family: 'Orbitron', sans-serif; font-size: 0.85rem; color: var(--terre-cuite-light); letter-spacing: 1px; text-transform: uppercase; margin-bottom: 0.8rem; }
.wiki-facts dl { display: grid; grid-template-columns: minmax(7rem, auto) 1fr; gap: 0.45rem 0.9rem; font-size: 0.86rem; }
.wiki-facts dt { color: var(--text-muted); }
.wiki-facts dd { color: var(--text-primary); }

.wiki-recipe { margin-top: 1.1rem; padding-top: 1rem; border-top: 1px solid var(--border); }
.wiki-recipe-label { color: var(--text-muted); font-size: 0.78rem; margin-bottom: 0.5rem; }
.wiki-recipe-grid { display: grid; gap: 4px; max-width: 16rem; }
.wiki-recipe-row { display: grid; grid-template-columns: repeat(3, minmax(0, 5.2rem)); gap: 4px; }
.wiki-recipe-cell {
  min-height: 3.1rem; display: flex; align-items: center; justify-content: center; text-align: center; padding: 0.25rem;
  font-size: 0.66rem; line-height: 1.25; color: var(--text-primary);
  background: rgba(0, 0, 0, 0.28); border: 1px solid rgba(255, 255, 255, 0.06); border-radius: 6px;
}
.wiki-recipe-cell.empty { background: rgba(0, 0, 0, 0.14); }
.wiki-recipe-result { color: var(--mandarine); font-size: 0.82rem; margin-top: 0.5rem; }

.wiki-toc { margin: 0.4rem 0 1.4rem; padding: 0.9rem 1.1rem; border-left: 3px solid var(--terre-cuite); background: rgba(255, 255, 255, 0.025); border-radius: 0 10px 10px 0; }
.wiki-toc p { font-family: 'Orbitron', sans-serif; font-size: 0.72rem; text-transform: uppercase; letter-spacing: 1.2px; color: var(--terre-cuite-light); margin-bottom: 0.4rem; }
.wiki-toc ol { padding-left: 1.2rem; display: grid; gap: 0.2rem; }
.wiki-toc a { color: var(--text-secondary); text-decoration: none; font-size: 0.86rem; }
.wiki-toc a:hover { color: var(--terre-cuite); }

.wiki-step { padding: 1.4rem 0; border-top: 1px solid var(--border); scroll-margin-top: 5rem; }
.wiki-step h2 { font-family: 'Orbitron', sans-serif; color: var(--terre-cuite); font-size: clamp(1.05rem, 3.6vw, 1.3rem); line-height: 1.3; margin-bottom: 0.9rem; }
.wiki-step-body { display: grid; gap: 1rem; grid-template-columns: minmax(0, 1fr); }
.wiki-step-media figure { margin: 0; }
.wiki-step-media img { display: block; width: 100%; height: auto; border-radius: 12px; border: 1px solid var(--glass-border); background: var(--bg-lighter); }
.wiki-step-text { color: var(--text-secondary); font-size: 0.95rem; line-height: 1.75; }
.wiki-step-text :deep(p) { margin-bottom: 0.8rem; }
.wiki-step-text :deep(strong) { color: var(--text-primary); font-weight: 600; }
.wiki-step-text :deep(a) { color: var(--mandarine); }
.wiki-step-text :deep(code) { font-size: 0.85em; background: rgba(0, 0, 0, 0.3); padding: 0.05rem 0.3rem; border-radius: 4px; color: var(--mandarine-light); }
.wiki-step-text :deep(ul), .wiki-step-text :deep(ol) { padding-left: 1.2rem; display: grid; gap: 0.4rem; margin-bottom: 0.8rem; }
.wiki-step-text :deep(table) { width: 100%; border-collapse: collapse; font-size: 0.8rem; margin: 0.4rem 0 1rem; display: block; overflow-x: auto; }
.wiki-step-text :deep(th), .wiki-step-text :deep(td) { padding: 0.4rem 0.5rem; border-bottom: 1px solid rgba(255, 255, 255, 0.07); text-align: left; white-space: nowrap; }
.wiki-step-text :deep(th) { color: var(--terre-cuite-light); font-weight: 600; }

.wiki-related h2 { font-family: 'Orbitron', sans-serif; color: var(--terre-cuite); font-size: 1.1rem; margin-bottom: 0.9rem; }
.wiki-related-grid { display: grid; gap: 0.8rem; grid-template-columns: minmax(0, 1fr); }
.wiki-related-card { display: flex; gap: 0.9rem; align-items: center; padding: 0.6rem; text-decoration: none; transition: border-color 0.3s, transform 0.2s; }
.wiki-related-card:hover { border-color: rgba(212, 118, 78, 0.35); transform: translateY(-2px); }
.wiki-related-card img { width: 72px; height: 72px; border-radius: 10px; object-fit: cover; }
.wiki-related-card strong { display: block; color: var(--text-primary); font-size: 0.95rem; }
.wiki-related-card small { color: var(--text-muted); font-size: 0.75rem; }
.wiki-back { margin-top: 1.1rem; }
.wiki-back a { color: var(--mandarine); text-decoration: none; font-size: 0.9rem; }

.wiki-sources { margin: 2.2rem 0 1rem; color: var(--text-muted); font-size: 0.75rem; line-height: 1.6; }
.wiki-sources summary { cursor: pointer; color: var(--text-secondary); }
.wiki-sources ul { padding-left: 1.1rem; margin: 0.6rem 0; }
.wiki-sources p { margin-top: 0.4rem; }

@media (min-width: 760px) {
  .wiki-page { padding: 6.5rem 2rem 2rem; }
  .wiki-top { grid-template-columns: minmax(0, 1.1fr) minmax(0, 1fr); align-items: start; }
  .wiki-step.has-media .wiki-step-body { grid-template-columns: minmax(0, 0.85fr) minmax(0, 1.15fr); align-items: start; gap: 1.6rem; }
  .wiki-related-grid { grid-template-columns: 1fr 1fr; }
}
</style>
