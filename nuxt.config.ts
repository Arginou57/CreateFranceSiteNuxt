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
      title: 'Create France — Serveur Minecraft Create 1.21.1 français',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        {
          name: 'description',
          content:
            'Rejoins Create France, le serveur Minecraft français moddé Create 6 (1.21.1) : trains, usines, Aeronautics. Launcher gratuit · IP play.createfrance.fr',
        },
        {
          property: 'og:title',
          content: 'Create France — Serveur Minecraft Create 1.21.1 français',
        },
        {
          property: 'og:description',
          content:
            'Rejoins Create France, le serveur Minecraft français moddé Create 6 (1.21.1) : trains, usines, Aeronautics. Launcher gratuit · IP play.createfrance.fr',
        },
        { property: 'og:image', content: 'https://create-france.com/images/fond.png' },
        { property: 'og:type', content: 'website' },
        { property: 'og:url', content: 'https://create-france.com/' },
        { property: 'og:locale', content: 'fr_FR' },
        { name: 'twitter:card', content: 'summary_large_image' },
      ],
      link: [
        { rel: 'icon', type: 'image/png', href: '/favicon.png' },
        { rel: 'icon', href: '/favicon.ico', sizes: 'any' },
        { rel: 'apple-touch-icon', href: '/apple-touch-icon.png' },
        { rel: 'canonical', href: 'https://create-france.com/' },
      ],
      script: [
        // who we are, for Google: name, logo, Discord / CurseForge links (brand panel and sitelinks)
        {
          type: 'application/ld+json',
          innerHTML: JSON.stringify({
            '@context': 'https://schema.org',
            '@graph': [
              {
                '@type': 'Organization',
                '@id': 'https://create-france.com/#org',
                name: 'Create France',
                url: 'https://create-france.com/',
                logo: 'https://create-france.com/favicon.png',
                sameAs: [
                  'https://discord.gg/JW7XQKPpVC',
                  'https://www.curseforge.com/minecraft/modpacks/serveur-create-france-communauty-friends-coop',
                ],
              },
              {
                '@type': 'WebSite',
                '@id': 'https://create-france.com/#site',
                name: 'Create France',
                alternateName: 'Create France — serveur Minecraft Create',
                url: 'https://create-france.com/',
                inLanguage: 'fr-FR',
                publisher: { '@id': 'https://create-france.com/#org' },
              },
            ],
          }),
        },
        {
          src: 'https://www.paypal.com/sdk/js?client-id=AS93E-_QKCB8stw2HU5dxk4c6WjAI_Qbyp8fa5iIoPbHEtXPfhLmpP4qPgccCVIw5k4PK10gGz78eopO&vault=true&intent=subscription',
          'data-sdk-integration-source': 'button-factory',
          defer: true,
        },
      ],
    },
  },
})
