<template>
  <div>
    <HeroBento />
    <ServerFeatures />
    <GallerySection />
    <GradesSection />
    <ServerFaq />
  </div>
</template>

<script setup lang="ts">
const { t } = useI18n()

useI18nSeo({
  paths: { fr: '/', en: '/en' },
  title: t('seo.home.title'),
  description: t('seo.home.description'),
})
</script>
