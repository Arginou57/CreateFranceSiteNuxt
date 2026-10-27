<template>
  <div class="app-root">
    <GearCanvas />
    <Navbar />
    <NuxtPage />
    <FloatingButtons />
    <AppFooter />
  </div>
</template>

<script setup lang="ts">
const { locale, t } = useI18n()
const home = computed(() => (locale.value === 'en' ? 'https://create-france.com/en' : 'https://create-france.com/'))

useHead({
  htmlAttrs: { lang: computed(() => (locale.value === 'en' ? 'en' : 'fr')) },
  script: [
    // who we are, for Google: name, logo, Discord / CurseForge links (brand panel and sitelinks), in the page language
    {
      key: 'ld-site',
      type: 'application/ld+json',
      innerHTML: computed(() => JSON.stringify({
        '@context': 'https://schema.org',
        '@graph': [
          {
            '@type': 'Organization',
            '@id': 'https://create-france.com/#org',
            name: 'Create France',
            url: 'https://create-france.com/',
            logo: 'https://create-france.com/favicon.png',
            description: t('seo.orgDescription'),
            sameAs: [
              'https://discord.gg/JW7XQKPpVC',
              'https://www.curseforge.com/minecraft/modpacks/serveur-create-france-communauty-friends-coop',
            ],
          },
          {
            '@type': 'WebSite',
            '@id': `${home.value}#site`,
            name: 'Create France',
            alternateName: t('seo.siteAlternateName'),
            url: home.value,
            inLanguage: t('lang.inLanguage'),
            publisher: { '@id': 'https://create-france.com/#org' },
          },
        ],
      })),
    },
  ],
})
</script>

<style>
/* the full-width section backgrounds (e.g. .serveur-section::before, -50vw on each side) made phones lay the page out
   wider than the screen (750 px at 500 px), pushing the burger and the language flag off-screen: clip them here */
.app-root { overflow-x: clip; }
</style>
