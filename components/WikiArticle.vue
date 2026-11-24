<template>
  <main class="wiki-page">
    <nav class="wiki-crumbs" :aria-label="t('wiki.breadcrumb')">
      <ol>
        <li><NuxtLink :to="localePath('/')">{{ t('wiki.home') }}</NuxtLink></li>
        <li><NuxtLink :to="wikiHome">{{ t('wiki.wiki') }}</NuxtLink></li>
        <li v-if="mod"><NuxtLink :to="{ path: wikiHome, query: { mod: mod.id } }">{{ mod.name }}</NuxtLink></li>
        <li v-if="category && category.name !== mod?.name"><NuxtLink :to="{ path: wikiHome, query: { mod: mod?.id, cat: category.id } }">{{ category.name }}</NuxtLink></li>
        <li aria-current="page">{{ page.name }}</li>
      </ol>
    </nav>

    <WikiModBar class="wiki-modbar" :lang="lang" :active="mod?.id" />

    <div class="wiki-tools">
      <WikiSearch class="wiki-tools-search" shortcut />
      <details class="wiki-browse">
        <summary>{{ t('wiki.nav.browse') }}</summary>
        <WikiNav :lang="lang" :current-slug="page.slug" :current-category="page.category" />
      </details>
    </div>

    <div class="wiki-layout">
    <aside class="wiki-side">
      <p class="wiki-side-title">{{ t('wiki.nav.title') }}</p>
      <WikiNav :lang="lang" :current-slug="page.slug" :current-category="page.category" />
    </aside>

    <article class="wiki-article">
      <header class="wiki-head">
        <p class="wiki-kicker">{{ t('wiki.articleKicker', { category: category?.name || '' }) }}</p>
        <h1>{{ page.name }}</h1>
        <p class="wiki-lead" v-html="page.intro" />
        <p class="wiki-meta">
          Create {{ page.createVersion }} · Minecraft {{ page.mcVersion }} · {{ t('wiki.updated') }}
          <time :datetime="page.dateModified">{{ formatDate(page.dateModified) }}</time>
        </p>
      </header>

      <div class="wiki-top">
        <WikiVideo v-if="page.videos[0]" class="wiki-top-video" :slug="page.slug" :video="page.videos[0]" :chapters="chaptersOf(page.videos[0])" :ponder="wikiVideoPonder(page.slug, page.videos[0].id)" :lang="lang" />
        <div class="wiki-card wiki-facts">
          <h2 class="wiki-card-title">{{ t('wiki.facts') }}</h2>
          <dl>
            <template v-for="f in page.facts" :key="f.label">
              <dt>{{ f.label }}</dt>
              <dd>{{ f.value }}</dd>
            </template>
          </dl>
          <WikiRecipe v-if="page.recipe" :recipe="page.recipe" :lang="lang" :slug="page.slug" />
          <div v-if="usedIn.length" class="wiki-usedin">
            <p class="wiki-usedin-label">{{ t('wiki.usedIn', { name: page.name }) }}</p>
            <ul>
              <li v-for="u in usedIn" :key="u.slug">
                <NuxtLink :to="u.path">
                  <img :src="wikiItemIcon(u.recipe?.resultItem || u.blockId)!" alt="" width="28" height="28" loading="lazy">
                  {{ u.name }}
                </NuxtLink>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <nav class="wiki-toc" :aria-label="t('wiki.toc')">
        <p>{{ t('wiki.toc') }}</p>
        <ol>
          <li v-for="s in page.sections" :key="s.id"><a :href="`#${s.id}`">{{ s.title }}</a></li>
        </ol>
      </nav>

      <section v-for="s in page.sections" :id="s.id" :key="s.id" class="wiki-step" :class="{ 'has-media': s.image || s.video }">
        <h2>{{ s.title }}</h2>
        <div class="wiki-step-body">
          <div v-if="s.video || s.image" class="wiki-step-media">
            <WikiVideo v-if="s.video && videoOf(s.video)" :slug="page.slug" :video="videoOf(s.video)!" :chapters="chaptersOf(videoOf(s.video)!)" :ponder="wikiVideoPonder(page.slug, s.video)" :lang="lang" />
            <figure v-else-if="s.image">
              <img :src="media(page.slug, s.image)" :alt="s.alt || s.title" width="600" height="600" loading="lazy" decoding="async">
            </figure>
          </div>
          <div class="wiki-step-text" v-html="s.html" />
        </div>
      </section>

      <nav v-if="prev || next" class="wiki-prevnext" :aria-label="t('wiki.nav.prevnext', { category: category?.name || '' })">
        <NuxtLink v-if="prev" :to="prev.path" class="wiki-card prev" rel="prev">
          <small>← {{ t('wiki.nav.prev') }}</small>
          <span><img :src="wikiItemIcon(prev.blockId)!" alt="" width="32" height="32" loading="lazy">{{ prev.name }}</span>
        </NuxtLink>
        <span v-else />
        <NuxtLink v-if="next" :to="next.path" class="wiki-card next" rel="next">
          <small>{{ t('wiki.nav.next') }} →</small>
          <span>{{ next.name }}<img :src="wikiItemIcon(next.blockId)!" alt="" width="32" height="32" loading="lazy"></span>
        </NuxtLink>
      </nav>

      <WikiCta :lead="t('wiki.ctaLead', { name: page.name.toLowerCase() })" />

      <section v-if="related.length" class="wiki-related" aria-labelledby="wiki-related-title">
        <h2 id="wiki-related-title">{{ t('wiki.related') }}</h2>
        <div class="wiki-related-grid">
          <NuxtLink v-for="r in related" :key="r.slug" :to="r.path" class="wiki-card wiki-related-card">
            <img :src="wikiCover(r)" :alt="r.name" width="96" height="96" loading="lazy" decoding="async">
            <span>
              <strong>{{ r.name }}</strong>
              <small>{{ catName(r.category) }}</small>
            </span>
          </NuxtLink>
        </div>
      </section>
      <p class="wiki-back"><NuxtLink :to="wikiHome">{{ t('wiki.back') }}</NuxtLink></p>

      <details class="wiki-sources">
        <summary>{{ t('wiki.sources', { version: page.createVersion }) }}</summary>
        <ul>
          <li v-for="(src, i) in page.sources" :key="i">{{ src }}</li>
        </ul>
        <p>{{ t('wiki.credits') }}</p>
      </details>
    </article>
    </div>
  </main>
</template>

<script setup lang="ts">
import type { WikiPage, WikiPageView, WikiVideo } from '~/utils/wiki'

const props = defineProps<{ page: WikiPageView }>()
const { t, tm, rt } = useI18n()
const localePath = useLocalePath()
const media = wikiMedia
const lang = computed(() => props.page.locale)
const wikiHome = computed(() => wikiHomePath(lang.value))
const catName = (id: string) => getWikiCategory(id, lang.value)?.name
const category = computed(() => getWikiCategory(props.page.category, lang.value))
const mod = computed(() => getWikiMod(category.value?.mod || 'create', lang.value))
// « sert à fabriquer » : pages whose recipe uses this page's item
const usedIn = computed(() =>
  wikiPagesUsing(props.page.blockId, props.page.slug)
    .filter((p) => wikiPagePath(p, lang.value))
    .map((p) => localizeWikiPage(p, lang.value)),
)
// previous / next page of the same category, in the order of the wiki home
const siblings = computed(() => wikiPagesIn(lang.value).filter((p) => p.category === props.page.category))
const pos = computed(() => siblings.value.findIndex((p) => p.slug === props.page.slug))
const prev = computed(() => (pos.value > 0 ? siblings.value[pos.value - 1] : null))
const next = computed(() => (pos.value >= 0 && pos.value < siblings.value.length - 1 ? siblings.value[pos.value + 1] : null))
// related pages that exist in this language (no link to a page that is not translated yet)
const related = computed(() =>
  wikiRelated(props.page)
    .map((s) => getWikiPage(s))
    .filter((p): p is WikiPage => !!p && !!wikiPagePath(p, lang.value))
    .map((p) => localizeWikiPage(p, lang.value)),
)

function videoOf(id: string) {
  return props.page.videos.find((v) => v.id === id)
}

// key moments of a video, labelled with the title of the page section they explain (so they follow the language)
function chaptersOf(v: WikiVideo) {
  // consecutive moments explained by the same section are one chapter; a single chapter is not worth a list
  const out: { t: number; label: string; section?: string }[] = []
  for (const c of [...wikiVideoChapters(props.page.slug, v)].sort((a, b) => a.t - b.t)) {
    if (out.length && c.section && out[out.length - 1].section === c.section) continue
    out.push({ t: c.t, section: c.section, label: c.label || props.page.sections.find((s) => s.id === c.section)?.title || '' })
  }
  return out.length >= 2 ? out : []
}

function formatDate(d: string) {
  const [y, m, day] = d.split('-').map(Number)
  const months = (tm('wiki.months') as unknown as unknown[]).map((x) => rt(x as any))
  return t('wiki.date', { day, month: months[m - 1], year: y })
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

.wiki-usedin { margin-top: 1rem; padding-top: 0.9rem; border-top: 1px solid var(--border); }
.wiki-usedin-label { color: var(--text-muted); font-size: 0.78rem; margin-bottom: 0.5rem; }
.wiki-usedin ul { list-style: none; display: flex; flex-wrap: wrap; gap: 0.4rem; }
.wiki-usedin a {
  display: inline-flex; align-items: center; gap: 0.35rem; padding: 0.2rem 0.6rem 0.2rem 0.25rem; border-radius: 8px;
  font-size: 0.8rem; text-decoration: none; color: var(--text-primary); background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.06);
}
.wiki-usedin a:hover { border-color: rgba(212, 118, 78, 0.4); }
.wiki-usedin img { width: 28px; height: 28px; }

.wiki-modbar { margin-top: 0.8rem; }
.wiki-tools { display: grid; gap: 0.6rem; margin-top: 0.9rem; }
.wiki-browse { border: 1px solid var(--glass-border); border-radius: 12px; background: var(--glass); }
.wiki-browse > summary {
  cursor: pointer; list-style: none; padding: 0.65rem 0.9rem; font-size: 0.85rem; color: var(--text-secondary);
  display: flex; align-items: center; gap: 0.5rem;
}
.wiki-browse > summary::-webkit-details-marker { display: none; }
.wiki-browse > summary::before { content: '☰'; color: var(--terre-cuite-light); }
.wiki-browse[open] > summary { border-bottom: 1px solid var(--border); }
.wiki-browse > .wnav { padding: 0.5rem; max-height: 60vh; overflow-y: auto; }
.wiki-layout { display: block; }
.wiki-article { min-width: 0; }
.wiki-side { display: none; }

.wiki-prevnext { display: grid; grid-template-columns: 1fr 1fr; gap: 0.8rem; margin-top: 2rem; }
.wiki-prevnext a { display: flex; flex-direction: column; gap: 0.3rem; padding: 0.7rem 0.9rem; text-decoration: none; transition: border-color 0.2s; }
.wiki-prevnext a:hover { border-color: rgba(212, 118, 78, 0.4); }
.wiki-prevnext small { color: var(--text-muted); font-size: 0.72rem; }
.wiki-prevnext span { display: flex; align-items: center; gap: 0.5rem; color: var(--text-primary); font-size: 0.88rem; font-weight: 500; }
.wiki-prevnext .next { align-items: flex-end; text-align: right; }
.wiki-prevnext .next span { justify-content: flex-end; }
.wiki-prevnext img { width: 32px; height: 32px; flex: none; }

.wiki-toc { margin: 0.4rem 0 1.4rem; padding: 0.9rem 1.1rem; border-left: 3px solid var(--terre-cuite); background: rgba(255, 255, 255, 0.025); border-radius: 0 10px 10px 0; }
.wiki-toc p { font-family: 'Orbitron', sans-serif; font-size: 0.72rem; text-transform: uppercase; letter-spacing: 1.2px; color: var(--terre-cuite-light); margin-bottom: 0.4rem; }
.wiki-toc ol { padding-left: 1.2rem; display: grid; gap: 0.2rem; }
.wiki-toc a { color: var(--text-secondary); text-decoration: none; font-size: 0.86rem; }
.wiki-toc a:hover { color: var(--terre-cuite); }

.wiki-step { padding: 1.4rem 0; border-top: 1px solid var(--border); scroll-margin-top: 8.5rem; }
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

@media (min-width: 1100px) {
  .wiki-page { max-width: 1280px; }
  .wiki-layout { display: grid; grid-template-columns: 250px minmax(0, 1fr); gap: 2.2rem; align-items: start; }
  .wiki-side {
    display: block; position: sticky; top: 8rem; max-height: calc(100vh - 9rem); overflow-y: auto; padding: 0.4rem 0.3rem 1rem 0;
    scrollbar-width: thin; scrollbar-color: rgba(212, 118, 78, 0.3) transparent;
  }
  .wiki-side-title {
    font-family: 'Orbitron', sans-serif; font-size: 0.68rem; letter-spacing: 1.2px; text-transform: uppercase;
    color: var(--text-muted); margin: 0 0 0.5rem 0.55rem;
  }
  .wiki-browse { display: none; }
  .wiki-tools { max-width: 560px; margin-left: calc(250px + 2.2rem); }
}
@media (min-width: 760px) {
  .wiki-page { padding: 6.5rem 2rem 2rem; }
  .wiki-top { grid-template-columns: minmax(0, 1.1fr) minmax(0, 1fr); align-items: start; }
  .wiki-step.has-media .wiki-step-body { grid-template-columns: minmax(0, 0.85fr) minmax(0, 1.15fr); align-items: start; gap: 1.6rem; }
  .wiki-related-grid { grid-template-columns: 1fr 1fr; }
}
</style>
