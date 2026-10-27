import { fileURLToPath } from 'node:url'

export default defineNuxtConfig({
  compatibilityDate: '2025-03-29',
  devtools: { enabled: false },

  modules: ['@nuxtjs/google-fonts', '@nuxtjs/i18n'],

  googleFonts: {
    families: {
      Orbitron: [400, 700, 900],
      Poppins: [300, 400, 500, 600, 700],
    },
    display: 'swap',
  },

  css: ['~/assets/css/main.css'],

  runtimeConfig: {
    // Clé API CurseForge (console.curseforge.com) — surchargée par
    // la variable d'environnement NUXT_CURSEFORGE_API_KEY sur le serveur.
    curseforgeApiKey: '',
  },

  // Bilingue : français par défaut sans préfixe (/, /wiki/presse-mecanique), anglais sous /en (/en, /en/wiki/mechanical-press).
  // Pas de détection de la langue du navigateur ni de redirection : Google crawle sans langue, chaque URL reste stable.
  // Le titre, la description, la canonical, les hreflang et og:locale sont posés page par page (composables/useI18nSeo.ts),
  // <html lang> et les données structurées du site dans app.vue.
  i18n: {
    baseUrl: 'https://create-france.com',
    strategy: 'prefix_except_default',
    defaultLocale: 'fr',
    locales: [
      { code: 'fr', language: 'fr-FR', name: 'Français', file: 'fr.json' },
      { code: 'en', language: 'en', name: 'English', file: 'en.json' },
    ],
    langDir: 'locales',
    detectBrowserLanguage: false,
    trailingSlash: false,
    vueI18n: './i18n.config.ts',
    // messages with HTML (FAQ, notices) are rendered with v-html: allow HTML in locale files
    compilation: { strictMessage: false, escapeHtml: false },
    bundle: { optimizeTranslationDirective: false },
  },

  // sitemap generated from content/wiki/*.json by server/routes/sitemap.xml.ts
  nitro: {
    serverAssets: [{ baseName: 'wiki', dir: fileURLToPath(new URL('./content/wiki', import.meta.url)) }],
  },

  app: {
    head: {
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { property: 'og:site_name', content: 'Create France' },
        { name: 'twitter:card', content: 'summary_large_image' },
      ],
      link: [
        { rel: 'icon', type: 'image/png', href: '/favicon.png' },
        { rel: 'icon', href: '/favicon.ico', sizes: 'any' },
        { rel: 'apple-touch-icon', href: '/apple-touch-icon.png' },
      ],
    },
  },
})
