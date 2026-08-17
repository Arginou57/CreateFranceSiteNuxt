export default defineNuxtConfig({
  compatibilityDate: '2025-03-29',
  devtools: { enabled: false },

  modules: ['@nuxtjs/google-fonts'],

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

  app: {
    head: {
      htmlAttrs: { lang: 'fr' },
      title: 'Create France Serveur - Serveur Minecraft Communautaire',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        {
          name: 'description',
          content:
            'Serveur Minecraft communautaire propulsé par le mod Create. Construisez, automatisez, explorez — ensemble.',
        },
        {
          property: 'og:title',
          content: 'Create France Serveur - Serveur Minecraft Communautaire',
        },
        {
          property: 'og:description',
          content:
            'Serveur Minecraft communautaire propulsé par le mod Create. Construisez, automatisez, explorez — ensemble.',
        },
        { property: 'og:image', content: 'https://create-france.com/images/fond.png' },
        { property: 'og:type', content: 'website' },
        { property: 'og:url', content: 'https://create-france.com/' },
        { property: 'og:locale', content: 'fr_FR' },
        { name: 'twitter:card', content: 'summary_large_image' },
      ],
      link: [
        { rel: 'icon', type: 'image/png', href: '/favicon.png' },
        { rel: 'canonical', href: 'https://create-france.com/' },
      ],
      script: [
        {
          src: 'https://www.paypal.com/sdk/js?client-id=AS93E-_QKCB8stw2HU5dxk4c6WjAI_Qbyp8fa5iIoPbHEtXPfhLmpP4qPgccCVIw5k4PK10gGz78eopO&vault=true&intent=subscription',
          'data-sdk-integration-source': 'button-factory',
          defer: true,
        },
      ],
    },
  },
})
