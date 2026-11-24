<template>
  <main class="wiki-home">
    <nav class="wiki-crumbs" :aria-label="t('wiki.breadcrumb')">
      <ol>
        <li><NuxtLink :to="localePath('/')">{{ t('wiki.home') }}</NuxtLink></li>
        <li aria-current="page">{{ t('wiki.wiki') }}</li>
      </ol>
    </nav>

    <header class="wiki-home-head">
      <p class="wiki-kicker">{{ t('wiki.kicker') }}</p>
      <h1>{{ t('wiki.h1') }}</h1>
      <p class="wiki-lead" v-html="t('wiki.lead', { count: pages.length })" />
      <WikiSearch class="wiki-home-search" size="lg" :initial="initialQ" shortcut />
    </header>

    <!-- one tab per mod (sticky): only the chosen mod is shown, every link stays in the HTML for search engines -->
    <WikiModBar :lang="lang" :active="activeMod" />

    <section
      v-for="m in tree"
      v-show="m.id === activeMod"
      :id="`mod-${m.id}`"
      :key="m.id"
      class="wiki-mod"
      :aria-labelledby="`mod-${m.id}-title`"
    >
      <header class="wiki-mod-head">
        <img :src="wikiItemIcon(m.icon)!" alt="" width="72" height="72" loading="lazy">
        <div>
          <h2 :id="`mod-${m.id}-title`">{{ m.name }} <small>v{{ m.version }}</small></h2>
          <p>{{ m.description }}</p>
        </div>
      </header>

      <div v-if="startOf(m).length" class="wiki-start">
        <h3 class="wiki-sub">{{ t('wiki.start') }}</h3>
        <ol>
          <li v-for="(s, i) in startOf(m)" :key="s.page.slug">
            <NuxtLink :to="s.page.path" class="wiki-start-step">
              <span class="wiki-start-num">{{ i + 1 }}</span>
              <img :src="wikiItemIcon(s.page.blockId)!" alt="" width="40" height="40" loading="lazy">
              <span class="wiki-start-txt">
                <small>{{ s.label }}</small>
                <strong>{{ s.page.name }}</strong>
              </span>
            </NuxtLink>
          </li>
        </ol>
      </div>

      <!-- category tiles: filter the pages below -->
      <template v-if="m.cats.length > 1">
        <h3 class="wiki-sub">{{ t('wiki.categories') }}</h3>
        <div class="wiki-tiles">
          <NuxtLink :to="{ query: { mod: m.id } }" class="wiki-tile" :class="{ active: !activeCat }" replace>
            <span class="wiki-tile-all" aria-hidden="true">✦</span>
            <strong>{{ t('wiki.allPages') }}</strong>
            <small>{{ m.count }}</small>
          </NuxtLink>
          <NuxtLink
            v-for="c in m.cats"
            :key="c.id"
            :to="{ query: { mod: m.id, cat: c.id } }"
            class="wiki-tile"
            :class="{ active: activeCat === c.id }"
            replace
          >
            <img v-if="c.icon" :src="wikiItemIcon(c.icon)!" alt="" width="40" height="40" loading="lazy">
            <strong>{{ c.name }}</strong>
            <small>{{ c.pages.length }}</small>
          </NuxtLink>
        </div>
      </template>

      <div
        v-for="c in m.cats"
        v-show="!activeCat || activeCat === c.id || m.cats.length === 1"
        :id="c.id"
        :key="c.id"
        class="wiki-catblock"
      >
        <h3>
          <img v-if="c.icon" :src="wikiItemIcon(c.icon)!" alt="" width="32" height="32" loading="lazy">
          <span>{{ c.id === m.id ? t('wiki.allPages') : c.name }}</span>
          <small>{{ t('wiki.pageCount', { n: c.pages.length }) }}</small>
        </h3>
        <p>{{ c.description }}</p>
        <ul class="wiki-pagecards">
          <li v-for="p in c.pages" :key="p.slug">
            <NuxtLink :to="p.path" class="wiki-pagecard">
              <img :src="wikiItemIcon(p.blockId)!" alt="" width="44" height="44" loading="lazy">
              <span>
                <strong>{{ p.name }}</strong>
                <small>{{ p.description }}</small>
              </span>
            </NuxtLink>
          </li>
        </ul>
      </div>
    </section>

    <!-- how the wiki is organised, in three steps -->
    <section class="wiki-howto" aria-labelledby="wiki-howto-title">
      <h2 id="wiki-howto-title" class="wiki-sub">{{ t('wiki.howto.title') }}</h2>
      <div class="wiki-howto-grid">
        <div v-for="(step, i) in howto" :key="i" class="wiki-card wiki-howto-step">
          <span class="wiki-howto-num" aria-hidden="true">{{ i + 1 }}</span>
          <div>
            <strong>{{ step.title }}</strong>
            <p v-html="step.text" />
          </div>
        </div>
      </div>
    </section>

    <section class="wiki-latest" aria-labelledby="wiki-latest-title">
      <h2 id="wiki-latest-title">{{ t('wiki.latest') }}</h2>
      <div class="wiki-latest-grid">
        <NuxtLink v-for="p in latest" :key="p.slug" :to="p.path" class="wiki-card wiki-feature">
          <img :src="poster(p)" :alt="t('wiki.posterAlt', { name: p.name })" width="720" height="720" loading="lazy" decoding="async">
          <span class="wiki-feature-body">
            <small>{{ catName(p.category) }}</small>
            <strong>{{ p.name }}</strong>
          </span>
        </NuxtLink>
      </div>
    </section>

    <WikiCta :lead="t('wiki.homeCtaLead')" />
  </main>
</template>

<script setup lang="ts">
import type { WikiPageView, WikiTreeMod } from '~/utils/wiki'

const { t, tm, rt, locale } = useI18n()
const localePath = useLocalePath()
const route = useRoute()
const lang: WikiLocale = locale.value === 'en' ? 'en' : 'fr'

// only the pages that exist in this language (a page without "en.slugEn" stays French-only)
const pages = wikiPagesIn(lang)
const tree = wikiTree(lang)
const catName = (id: string) => getWikiCategory(id, lang)?.name
const poster = (p: WikiPageView) => wikiCover(p)

// chosen mod / category, from the URL (?mod=cbc&cat=...), so a tab can be linked and survives a reload
const activeMod = computed(() => {
  const q = route.query.mod
  return typeof q === 'string' && tree.some((m) => m.id === q) ? q : tree[0]?.id
})
const activeCat = computed(() => {
  const q = route.query.cat
  const m = tree.find((x) => x.id === activeMod.value)
  return typeof q === 'string' && m?.cats.some((c) => c.id === q) ? q : null
})

// old anchors (/wiki#cinetique, /wiki#mod-cbc) open the right tab
onMounted(() => {
  const h = decodeURIComponent(location.hash.slice(1))
  if (!h || route.query.mod) return
  const modId = h.startsWith('mod-') ? h.slice(4) : wikiCategories.find((c) => c.id === h)?.mod
  if (!modId || !tree.some((m) => m.id === modId)) return
  const cat = h.startsWith('mod-') ? undefined : h
  navigateTo({ query: { mod: modId, ...(cat && cat !== modId ? { cat } : {}) }, hash: location.hash }, { replace: true })
})
const initialQ = typeof route.query.q === 'string' ? route.query.q : ''

const howto = (tm('wiki.howto.steps') as unknown as { title: unknown; text: unknown }[]).map((s) => ({
  title: rt(s.title as any),
  text: rt(s.text as any),
}))

/** beginner path of a mod, with the pages that exist in this language */
function startOf(m: WikiTreeMod) {
  return m.start
    .map((s) => ({ label: s.label, page: pages.find((p) => p.slug === s.slug) }))
    .filter((s): s is { label: string; page: WikiPageView } => !!s.page)
}

// the 6 most recently updated pages (newest first, then by name)
const latest = [...pages]
  .sort((a, b) => b.dateModified.localeCompare(a.dateModified) || b.datePublished.localeCompare(a.datePublished))
  .slice(0, 6)

const title = t('wiki.seoTitle')
const description = t('wiki.seoDescription')
const site = lang === 'en' ? 'https://create-france.com/en' : 'https://create-france.com/'
const ogImage = wikiAbs(pages[0] ? poster(pages[0]) : '/images/fond.png')

const { url } = useI18nSeo({
  paths: { fr: '/wiki', en: '/en/wiki' },
  title,
  description,
  ogImage,
  ogImageWidth: 720,
  ogImageHeight: 720,
  ogImageAlt: title,
})

useHead({
  script: [{
    key: 'ld-page',
    type: 'application/ld+json',
    innerHTML: JSON.stringify({
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: t('wiki.home'), item: site },
            { '@type': 'ListItem', position: 2, name: t('wiki.wiki'), item: url },
          ],
        },
        {
          '@type': 'CollectionPage',
          '@id': `${url}#page`,
          name: title,
          description,
          url,
          inLanguage: t('lang.inLanguage'),
          isPartOf: { '@id': `${site}#site` },
          hasPart: pages.map((p) => ({ '@type': 'Article', headline: p.title, url: wikiAbs(p.path) })),
        },
      ],
    }),
  }],
})
</script>

<style scoped>
.sr-only { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; }
.wiki-home { position: relative; z-index: 2; max-width: 1100px; margin: 0 auto; padding: 5.5rem 1rem 1rem; }
.wiki-crumbs ol { list-style: none; display: flex; gap: 0.3rem; font-size: 0.78rem; color: var(--text-muted); }
.wiki-crumbs li + li::before { content: '›'; margin-right: 0.3rem; }
.wiki-crumbs a { color: var(--text-secondary); text-decoration: none; }
.wiki-crumbs [aria-current] { color: var(--terre-cuite-light); }

.wiki-home-head { margin: 1.4rem 0 1.4rem; }
.wiki-kicker { font-family: 'Orbitron', sans-serif; font-size: 0.7rem; letter-spacing: 1.5px; text-transform: uppercase; color: var(--sauge); margin-bottom: 0.4rem; }
.wiki-home-head h1 { font-family: 'Orbitron', sans-serif; color: var(--terre-cuite); font-weight: 900; font-size: clamp(1.7rem, 6vw, 2.7rem); line-height: 1.15; margin-bottom: 0.9rem; }
.wiki-lead { color: var(--text-primary); font-size: 1rem; line-height: 1.75; font-weight: 300; max-width: 780px; }
.wiki-lead :deep(strong) { color: var(--mandarine-light); font-weight: 600; }
.wiki-home-search { margin-top: 1.3rem; max-width: 720px; }

.wiki-card { background: var(--glass); border: 1px solid var(--glass-border); border-radius: 14px; backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); }

.wiki-sub { font-family: 'Orbitron', sans-serif; color: var(--terre-cuite-light); font-size: 0.85rem; letter-spacing: 0.6px; margin: 0 0 0.7rem; }

.wiki-mod { scroll-margin-top: 8rem; margin: 1.6rem 0 2.6rem; }
.wiki-mod-head {
  display: flex; gap: 1.1rem; align-items: center; margin-bottom: 1.4rem; padding: 1.1rem 1.2rem; border-radius: 16px;
  background: linear-gradient(135deg, rgba(212, 118, 78, 0.16), rgba(242, 166, 90, 0.04)); border: 1px solid rgba(212, 118, 78, 0.25);
}
.wiki-mod-head img { width: 72px; height: 72px; flex: none; }
.wiki-mod-head h2 { font-family: 'Orbitron', sans-serif; color: var(--terre-cuite); font-size: clamp(1.25rem, 4vw, 1.7rem); }
.wiki-mod-head h2 small { font-family: 'Poppins', sans-serif; font-size: 0.75rem; color: var(--text-muted); font-weight: 400; margin-left: 0.4rem; }
.wiki-mod-head p { color: var(--text-secondary); font-size: 0.9rem; line-height: 1.6; margin-top: 0.25rem; }

.wiki-start { margin-bottom: 1.8rem; }
.wiki-start ol { list-style: none; display: grid; gap: 0.5rem; grid-template-columns: minmax(0, 1fr); }
.wiki-start-step {
  display: flex; align-items: center; gap: 0.6rem; padding: 0.45rem 0.7rem 0.45rem 0.5rem; border-radius: 11px; text-decoration: none;
  background: rgba(255, 255, 255, 0.03); border: 1px solid rgba(212, 118, 78, 0.22); transition: border-color 0.2s;
}
.wiki-start-step:hover { border-color: rgba(212, 118, 78, 0.55); }
.wiki-start-num { font-family: 'Orbitron', sans-serif; font-size: 0.75rem; color: var(--terre-cuite-light); width: 1.1rem; text-align: center; flex: none; }
.wiki-start-step img { width: 40px; height: 40px; flex: none; }
.wiki-start-txt { display: flex; flex-direction: column; min-width: 0; }
.wiki-start-txt small { color: var(--text-muted); font-size: 0.7rem; }
.wiki-start-txt strong { color: var(--text-primary); font-size: 0.86rem; font-weight: 600; }

.wiki-tiles { display: grid; gap: 0.5rem; grid-template-columns: repeat(2, minmax(0, 1fr)); margin-bottom: 1.6rem; }
.wiki-tile {
  display: flex; align-items: center; gap: 0.55rem; padding: 0.55rem 0.7rem; border-radius: 11px; text-decoration: none;
  background: var(--glass); border: 1px solid var(--glass-border); transition: border-color 0.2s, background 0.2s;
}
.wiki-tile:hover { border-color: rgba(212, 118, 78, 0.45); }
.wiki-tile.active { background: rgba(212, 118, 78, 0.2); border-color: var(--terre-cuite); }
.wiki-tile img { width: 40px; height: 40px; flex: none; }
.wiki-tile-all { width: 40px; height: 40px; flex: none; display: flex; align-items: center; justify-content: center; color: var(--mandarine); font-size: 1.3rem; }
.wiki-tile strong { color: var(--text-primary); font-size: 0.84rem; font-weight: 600; line-height: 1.25; }
.wiki-tile small { margin-left: auto; color: var(--text-muted); font-size: 0.72rem; }
.wiki-tile.active strong { color: var(--mandarine-light); }

.wiki-catblock { scroll-margin-top: 8rem; margin-bottom: 2rem; }
.wiki-catblock h3 {
  display: flex; align-items: center; gap: 0.55rem; font-family: 'Orbitron', sans-serif; color: var(--terre-cuite); font-size: 1rem;
  padding-bottom: 0.45rem; border-bottom: 1px solid var(--border); margin-bottom: 0.5rem;
}
.wiki-catblock h3 img { width: 32px; height: 32px; }
.wiki-catblock h3 small { margin-left: auto; font-family: 'Poppins', sans-serif; font-size: 0.72rem; color: var(--text-muted); font-weight: 400; }
.wiki-catblock > p { color: var(--text-secondary); font-size: 0.82rem; line-height: 1.55; margin-bottom: 0.8rem; }
.wiki-pagecards { list-style: none; display: grid; gap: 0.55rem; grid-template-columns: minmax(0, 1fr); }
.wiki-pagecard {
  display: flex; gap: 0.7rem; align-items: flex-start; height: 100%; padding: 0.65rem 0.75rem; border-radius: 12px; text-decoration: none;
  background: var(--glass); border: 1px solid var(--glass-border); transition: border-color 0.2s, transform 0.2s;
}
.wiki-pagecard:hover { border-color: rgba(212, 118, 78, 0.45); transform: translateY(-2px); }
.wiki-pagecard img { width: 44px; height: 44px; flex: none; }
.wiki-pagecard span { display: flex; flex-direction: column; gap: 0.15rem; min-width: 0; }
.wiki-pagecard strong { color: var(--text-primary); font-size: 0.9rem; font-weight: 600; }
.wiki-pagecard small {
  color: var(--text-muted); font-size: 0.74rem; line-height: 1.45;
  display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden;
}

.wiki-howto { margin: 1rem 0 2rem; }
.wiki-howto-grid { display: grid; gap: 0.7rem; grid-template-columns: minmax(0, 1fr); }
.wiki-howto-step { display: flex; gap: 0.8rem; padding: 0.85rem 1rem; align-items: flex-start; }
.wiki-howto-num {
  flex: none; width: 1.8rem; height: 1.8rem; border-radius: 50%; display: flex; align-items: center; justify-content: center;
  font-family: 'Orbitron', sans-serif; font-size: 0.8rem; font-weight: 700; color: #1C1816; background: var(--terre-cuite);
}
.wiki-howto-step strong { color: var(--text-primary); font-size: 0.9rem; }
.wiki-howto-step p { color: var(--text-secondary); font-size: 0.8rem; line-height: 1.55; margin-top: 0.15rem; }
.wiki-howto-step :deep(kbd) { font-family: inherit; font-size: 0.72rem; border: 1px solid rgba(255, 255, 255, 0.2); border-radius: 4px; padding: 0 0.3rem; }
.wiki-howto-step :deep(em) { color: var(--mandarine-light); font-style: normal; }

.wiki-latest { margin-top: 1rem; }
.wiki-latest h2 { font-family: 'Orbitron', sans-serif; color: var(--terre-cuite-light); font-size: 0.85rem; letter-spacing: 0.6px; margin-bottom: 0.7rem; }
.wiki-latest-grid { display: grid; gap: 0.8rem; grid-template-columns: repeat(2, minmax(0, 1fr)); }
.wiki-feature { display: flex; flex-direction: column; overflow: hidden; text-decoration: none; transition: transform 0.2s, border-color 0.3s; }
.wiki-feature:hover { transform: translateY(-3px); border-color: rgba(212, 118, 78, 0.35); }
.wiki-feature img { width: 100%; height: auto; aspect-ratio: 1 / 1; object-fit: cover; display: block; }
.wiki-feature-body { padding: 0.6rem 0.8rem 0.8rem; display: flex; flex-direction: column; gap: 0.15rem; }
.wiki-feature-body small { font-size: 0.66rem; text-transform: uppercase; letter-spacing: 1px; color: var(--sauge); }
.wiki-feature-body strong { font-family: 'Orbitron', sans-serif; color: var(--terre-cuite-light); font-size: 0.82rem; }

@media (min-width: 640px) {
  .wiki-howto-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); }
  .wiki-start ol { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .wiki-tiles { grid-template-columns: repeat(3, minmax(0, 1fr)); }
  .wiki-pagecards { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .wiki-latest-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); }
}
@media (min-width: 960px) {
  .wiki-home { padding: 6.5rem 2rem 2rem; }
  .wiki-start ol { grid-template-columns: repeat(4, minmax(0, 1fr)); }
  .wiki-tiles { grid-template-columns: repeat(6, minmax(0, 1fr)); }
  .wiki-tiles .wiki-tile { flex-direction: column; text-align: center; gap: 0.3rem; padding: 0.7rem 0.4rem; }
  .wiki-tiles .wiki-tile small { margin-left: 0; }
  .wiki-pagecards { grid-template-columns: repeat(3, minmax(0, 1fr)); }
  .wiki-latest-grid { grid-template-columns: repeat(6, minmax(0, 1fr)); }
}
</style>
