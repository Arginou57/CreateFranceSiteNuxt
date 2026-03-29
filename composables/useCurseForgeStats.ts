export function useCurseForgeStats() {
  const downloads = ref('16 147+')

  const { data } = useFetch('/api/curseforge-downloads', {
    server: true,
    lazy: true,
  })

  watch(data, (val) => {
    if (val && (val as any).downloads) {
      const count = (val as any).downloads as number
      downloads.value = count.toLocaleString('fr-FR') + '+'
    }
  }, { immediate: true })

  return { downloads }
}
