// vue-i18n options (locale messages are in i18n/locales/*.json)
export default defineI18nConfig(() => ({
  legacy: false,
  fallbackLocale: 'fr',
  // FAQ answers, notices and the wiki CTA contain trusted HTML from our own locale files (rendered with v-html)
  warnHtmlMessage: false,
}))
