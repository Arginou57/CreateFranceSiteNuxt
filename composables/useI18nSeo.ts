// Multilingual SEO of a page: title/description, canonical of the current language, hreflang fr / en / x-default (= fr),
// og:url, og:locale (+ alternate). `paths` are the URL paths of the same page in each language (null = not translated).
// The language switcher computes the same paths with alternatesFor() (utils/alternates.ts).
const SITE = 'https://create-france.com'
const DEFAULT_IMAGE = SITE + '/images/og-image.jpg'

export interface I18nPaths { fr: string; en: string | null }

export function useI18nSeo(opts: {
  paths: I18nPaths
  title: string
  description: string
  ogType?: 'website' | 'article'
  ogImage?: string
  ogImageWidth?: number
  ogImageHeight?: number
  ogImageAlt?: string
}) {
  const { locale, t } = useI18n()
  const lang = locale.value === 'en' ? 'en' : 'fr'
  const self = (lang === 'en' ? opts.paths.en : opts.paths.fr) || opts.paths.fr
  const url = SITE + self

  const link: Record<string, string>[] = [
    { rel: 'canonical', href: url },
    { rel: 'alternate', hreflang: 'fr', href: SITE + opts.paths.fr },
  ]
  if (opts.paths.en) link.push({ rel: 'alternate', hreflang: 'en', href: SITE + opts.paths.en })
  link.push({ rel: 'alternate', hreflang: 'x-default', href: SITE + opts.paths.fr })

  const meta: Record<string, string>[] = []
  if (opts.paths.en) {
    meta.push({ property: 'og:locale:alternate', content: lang === 'en' ? 'fr_FR' : 'en_US', key: 'og:locale:alternate' })
  }

  useHead({ link, meta })

  useSeoMeta({
    title: opts.title,
    description: opts.description,
    ogTitle: opts.title,
    ogDescription: opts.description,
    ogType: opts.ogType || 'website',
    ogUrl: url,
    ogLocale: t('lang.ogLocale'),
    twitterTitle: opts.title,
    twitterDescription: opts.description,
    ogImage: opts.ogImage || DEFAULT_IMAGE,
    ogImageWidth: opts.ogImage ? opts.ogImageWidth : 1200,
    ogImageHeight: opts.ogImage ? opts.ogImageHeight : 630,
    twitterImage: opts.ogImage || DEFAULT_IMAGE,
    ogImageAlt: opts.ogImageAlt || t('seo.ogImageAlt'),
  })

  return { url, lang }
}
