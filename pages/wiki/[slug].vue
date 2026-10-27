<template>
  <WikiArticle :page="page" />
</template>

<script setup lang="ts">
import type { WikiPage } from '~/utils/wiki'

const route = useRoute()
const found = getWikiPage(String(route.params.slug))
if (!found) {
  throw createError({ statusCode: 404, statusMessage: 'Page du wiki introuvable', fatal: true })
}
const page = found as WikiPage
const category = getWikiCategory(page.category)
const url = wikiAbs(`/wiki/${page.slug}`)
const firstVideo = page.videos[0]
const poster = wikiAbs(firstVideo ? wikiVideoFiles(page.slug, firstVideo.id).poster : '/images/fond.png')
// date de mise en ligne des vidéos, avec fuseau (Paris, heure d'hiver)
const uploadDate = `${page.datePublished}T12:00:00+01:00`

useSeoMeta({
  title: page.title,
  description: page.description,
  ogTitle: page.title,
  ogDescription: page.description,
  ogType: 'article',
  ogUrl: url,
  ogImage: poster,
  ogImageWidth: 720,
  ogImageHeight: 720,
  ogImageAlt: page.name,
  twitterCard: 'summary_large_image',
  twitterTitle: page.title,
  twitterDescription: page.description,
  twitterImage: poster,
  articlePublishedTime: page.datePublished,
  articleModifiedTime: page.dateModified,
})

const org = { '@type': 'Organization', '@id': 'https://create-france.com/#org', name: 'Create France', url: 'https://create-france.com/' }

useHead({
  link: [{ rel: 'canonical', href: url }],
  script: [{
    type: 'application/ld+json',
    innerHTML: JSON.stringify({
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'BreadcrumbList',
          itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'Accueil', item: 'https://create-france.com/' },
            { '@type': 'ListItem', position: 2, name: 'Wiki', item: wikiAbs('/wiki') },
            { '@type': 'ListItem', position: 3, name: category?.name || 'Wiki', item: wikiAbs(`/wiki#${page.category}`) },
            { '@type': 'ListItem', position: 4, name: page.name, item: url },
          ],
        },
        {
          '@type': 'Article',
          '@id': `${url}#article`,
          headline: page.title,
          description: page.description,
          image: [poster],
          inLanguage: 'fr-FR',
          datePublished: page.datePublished,
          dateModified: page.dateModified,
          author: org,
          publisher: { ...org, logo: { '@type': 'ImageObject', url: 'https://create-france.com/favicon.png' } },
          mainEntityOfPage: url,
          about: { '@type': 'Thing', name: `${page.name} (mod Create pour Minecraft)` },
          video: page.videos.map((v) => ({ '@id': `${url}#video-${v.id}` })),
        },
        ...page.videos.map((v) => {
          const f = wikiVideoFiles(page.slug, v.id)
          return {
            '@type': 'VideoObject',
            '@id': `${url}#video-${v.id}`,
            name: v.name,
            description: v.description,
            thumbnailUrl: [wikiAbs(f.poster)],
            contentUrl: wikiAbs(f.mp4),
            uploadDate,
            duration: v.duration,
            inLanguage: 'fr-FR',
            isFamilyFriendly: true,
            publisher: org,
          }
        }),
      ],
    }),
  }],
})
</script>
