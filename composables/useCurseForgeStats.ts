export function useCurseForgeStats() {
  const { locale } = useI18n()
  const fmt = () => (locale.value === 'en' ? 'en-US' : 'fr-FR')
  const downloads = ref((16147).toLocaleString(fmt()) + '+')

  const { data } = useFetch('/api/curseforge-downloads', {
    server: true,
    lazy: true,
  })

  watch(data, (val) => {
    if (val && (val as any).downloads) {
      const count = (val as any).downloads as number
      downloads.value = count.toLocaleString(fmt()) + '+'
    }
  }, { immediate: true })

  return { downloads }
}
