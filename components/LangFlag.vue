<template>
  <!-- inline SVG flags: sharp everywhere, unlike emoji flags which Windows shows as two letters -->
  <svg v-if="code === 'fr'" class="lang-flag" viewBox="0 0 3 2" width="21" height="14" aria-hidden="true" focusable="false">
    <rect width="1" height="2" x="0" fill="#0055A4" />
    <rect width="1" height="2" x="1" fill="#FFFFFF" />
    <rect width="1" height="2" x="2" fill="#EF4135" />
  </svg>
  <svg v-else class="lang-flag" viewBox="0 0 60 30" width="21" height="14" preserveAspectRatio="none" aria-hidden="true" focusable="false">
    <!-- Union Jack, simplified (no clip paths, so several flags on one page never share ids) -->
    <rect width="60" height="30" fill="#012169" />
    <path d="M0,0 L60,30 M60,0 L0,30" stroke="#FFFFFF" stroke-width="6" />
    <path d="M0,0 L60,30 M60,0 L0,30" stroke="#C8102E" stroke-width="2" />
    <path d="M30,0 v30 M0,15 h60" stroke="#FFFFFF" stroke-width="10" />
    <path d="M30,0 v30 M0,15 h60" stroke="#C8102E" stroke-width="6" />
  </svg>
</template>

<script setup lang="ts">
defineProps<{ code: 'fr' | 'en' }>()
</script>

<style scoped>
.lang-flag { display: block; flex: none; border-radius: 2px; box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.18); }
</style>
