<template>
  <WikiArticle v-if="view" :view="view" :lang="lang" />
</template>

<script setup lang="ts">
import type { WikiArticleView } from '~/utils/wiki'

const route = useRoute()
const { t, locale } = useI18n()
const lang: WikiLocale = locale.value === 'en' ? 'en' : 'fr'
const urlSlug = String(route.params.slug)

// French URL = French slug (file name), English URL = en.slugEn; anything else is a 404 (no redirect).
// The article is built on the server (/api/wiki/page): only this page's data travels, in the SSR payload.
const { data, error } = await useFetch<WikiArticleView>('/api/wiki/page', {
  query: { slug: urlSlug, lang },
  key: `wiki-page-${lang}-${urlSlug}`,
})
if (error.value || !data.value) {
  throw createError({ statusCode: 404, statusMessage: t('wiki.notFound'), fatal: true })
}
const view = data as Ref<WikiArticleView>
const page = view.value.page


const site = lang === 'en' ? 'https://create-france.com/en' : 'https://create-france.com/'
const inLanguage = t('lang.inLanguage')
const category = view.value.category
const poster = wikiAbs(page.cover)
// date de mise en ligne des vidéos, avec fuseau (Paris, heure d'hiver)
const uploadDate = `${page.datePublished}T12:00:00+01:00`

const { url } = useI18nSeo({
  paths: page.paths,
  title: page.title,
  description: page.description,
  ogType: 'article',
  ogImage: poster,
  ogImageWidth: 720,
  ogImageHeight: 720,
  ogImageAlt: page.name,
})

useSeoMeta({
  articlePublishedTime: page.datePublished,
  articleModifiedTime: page.dateModified,
})

const org = { '@type': 'Organization', '@id': 'https://create-france.com/#org', name: 'Create France', url: 'https://create-france.com/' }
const wikiHome = wikiAbs(wikiHomePath(lang))

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
            { '@type': 'ListItem', position: 2, name: t('wiki.wiki'), item: wikiHome },
            { '@type': 'ListItem', position: 3, name: category?.name || t('wiki.wiki'), item: `${wikiHome}#${category?.id || ''}` },
            { '@type': 'ListItem', position: 4, name: page.name, item: url },
          ],
        },
        {
          '@type': 'Article',
          '@id': `${url}#article`,
          headline: page.title,
          description: page.description,
          image: [poster],
          inLanguage,
          datePublished: page.datePublished,
          dateModified: page.dateModified,
          author: org,
          publisher: { ...org, logo: { '@type': 'ImageObject', url: 'https://create-france.com/favicon.png' } },
          mainEntityOfPage: url,
          isPartOf: { '@id': `${site}#site` },
          about: { '@type': 'Thing', name: t('wiki.about', { name: page.name }) },
          video: page.videos.map((v) => ({ '@id': `${url}#video-${v.id}` })),
        },
        ...page.videos.map((v) => ({
          '@type': 'VideoObject',
          '@id': `${url}#video-${v.id}`,
          name: v.name,
          description: v.description,
          thumbnailUrl: [wikiAbs(v.files.poster)],
          contentUrl: wikiAbs(v.files.mp4),
          uploadDate,
          duration: v.duration,
          inLanguage,
          isFamilyFriendly: true,
          publisher: org,
        })),
      ],
    }),
  }],
})
</script>
