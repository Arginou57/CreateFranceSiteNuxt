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
      <p class="wiki-lead" v-html="t('wiki.lead')" />
    </header>

    <section class="wiki-featured" aria-labelledby="wiki-featured-title">
      <h2 id="wiki-featured-title">{{ t('wiki.featured') }}</h2>
      <div class="wiki-featured-grid">
        <NuxtLink v-for="p in pages" :key="p.slug" :to="p.path" class="wiki-card wiki-feature">
          <img :src="poster(p)" :alt="t('wiki.posterAlt', { name: p.name })" width="720" height="720" loading="lazy" decoding="async">
          <span class="wiki-feature-body">
            <small>{{ catName(p.category) }}</small>
            <strong>{{ p.name }}</strong>
            <span>{{ p.description }}</span>
          </span>
        </NuxtLink>
      </div>
    </section>

    <section class="wiki-cats" aria-labelledby="wiki-cats-title">
      <h2 id="wiki-cats-title">{{ t('wiki.categories') }}</h2>
      <div class="wiki-cats-grid">
        <div v-for="c in categories" :id="c.id" :key="c.id" class="wiki-card wiki-cat" :class="{ soon: !byCat(c.id).length }">
          <h3>{{ c.name }}</h3>
          <p>{{ c.description }}</p>
          <ul v-if="byCat(c.id).length">
            <li v-for="p in byCat(c.id)" :key="p.slug"><NuxtLink :to="p.path">{{ p.name }}</NuxtLink></li>
          </ul>
          <span v-else class="wiki-soon">{{ t('wiki.soon') }}</span>
        </div>
      </div>
    </section>

    <WikiCta :lead="t('wiki.homeCtaLead')" />
  </main>
</template>

<script setup lang="ts">
import type { WikiPageView } from '~/utils/wiki'

const { t, locale } = useI18n()
const localePath = useLocalePath()
const lang: WikiLocale = locale.value === 'en' ? 'en' : 'fr'

// only the pages that exist in this language (a page without "en.slugEn" stays French-only)
const pages = wikiPagesIn(lang)
const categories = wikiCategories.map((c) => getWikiCategory(c.id, lang)!)
const byCat = (id: string) => pages.filter((p) => p.category === id)
const catName = (id: string) => getWikiCategory(id, lang)?.name
const poster = (p: WikiPageView) => wikiCover(p)

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
.wiki-home { position: relative; z-index: 2; max-width: 1040px; margin: 0 auto; padding: 5.5rem 1rem 1rem; }
.wiki-crumbs ol { list-style: none; display: flex; gap: 0.3rem; font-size: 0.78rem; color: var(--text-muted); }
.wiki-crumbs li + li::before { content: '›'; margin-right: 0.3rem; }
.wiki-crumbs a { color: var(--text-secondary); text-decoration: none; }
.wiki-crumbs [aria-current] { color: var(--terre-cuite-light); }

.wiki-home-head { margin: 1.4rem 0 2rem; }
.wiki-kicker { font-family: 'Orbitron', sans-serif; font-size: 0.7rem; letter-spacing: 1.5px; text-transform: uppercase; color: var(--sauge); margin-bottom: 0.4rem; }
.wiki-home-head h1 { font-family: 'Orbitron', sans-serif; color: var(--terre-cuite); font-weight: 900; font-size: clamp(1.7rem, 6vw, 2.7rem); line-height: 1.15; margin-bottom: 0.9rem; }
.wiki-lead { color: var(--text-primary); font-size: 1rem; line-height: 1.75; font-weight: 300; max-width: 760px; }
.wiki-lead :deep(strong) { color: var(--mandarine-light); font-weight: 600; }

.wiki-card { background: var(--glass); border: 1px solid var(--glass-border); border-radius: 14px; backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); }

.wiki-featured h2, .wiki-cats h2 { font-family: 'Orbitron', sans-serif; color: var(--terre-cuite); font-size: 1.15rem; margin-bottom: 1rem; }
.wiki-featured-grid { display: grid; gap: 1rem; grid-template-columns: minmax(0, 1fr); margin-bottom: 2.6rem; }
.wiki-feature { display: flex; flex-direction: column; overflow: hidden; text-decoration: none; transition: transform 0.2s, border-color 0.3s; }
.wiki-feature:hover { transform: translateY(-3px); border-color: rgba(212, 118, 78, 0.35); }
.wiki-feature img { width: 100%; height: auto; aspect-ratio: 1 / 1; object-fit: cover; display: block; }
.wiki-feature-body { padding: 0.9rem 1rem 1.1rem; display: flex; flex-direction: column; gap: 0.25rem; }
.wiki-feature-body small { font-size: 0.7rem; text-transform: uppercase; letter-spacing: 1px; color: var(--sauge); }
.wiki-feature-body strong { font-family: 'Orbitron', sans-serif; color: var(--terre-cuite-light); font-size: 1rem; }
.wiki-feature-body span { color: var(--text-secondary); font-size: 0.85rem; line-height: 1.55; }

.wiki-cats-grid { display: grid; gap: 0.9rem; grid-template-columns: minmax(0, 1fr); }
.wiki-cat { padding: 1rem 1.1rem; scroll-margin-top: 5rem; }
.wiki-cat h3 { font-family: 'Orbitron', sans-serif; color: var(--terre-cuite); font-size: 0.95rem; margin-bottom: 0.45rem; }
.wiki-cat p { color: var(--text-secondary); font-size: 0.84rem; line-height: 1.6; }
.wiki-cat ul { list-style: none; margin-top: 0.7rem; display: flex; flex-wrap: wrap; gap: 0.5rem; }
.wiki-cat li a {
  display: inline-block; padding: 0.3rem 0.7rem; border-radius: 8px; text-decoration: none; font-size: 0.8rem; font-weight: 500;
  color: #1C1816; background: linear-gradient(135deg, var(--terre-cuite), var(--mandarine));
}
.wiki-cat.soon { opacity: 0.72; }
.wiki-soon {
  display: inline-block; margin-top: 0.7rem; font-size: 0.72rem; color: var(--text-muted); border: 1px dashed rgba(255, 255, 255, 0.15);
  padding: 0.2rem 0.6rem; border-radius: 6px;
}

@media (min-width: 640px) {
  .wiki-featured-grid { grid-template-columns: repeat(3, 1fr); }
  .wiki-cats-grid { grid-template-columns: repeat(2, 1fr); }
}
@media (min-width: 960px) {
  .wiki-home { padding: 6.5rem 2rem 2rem; }
  .wiki-cats-grid { grid-template-columns: repeat(3, 1fr); }
}
</style>
