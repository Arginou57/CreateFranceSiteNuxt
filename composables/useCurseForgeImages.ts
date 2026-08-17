export interface GalleryImage {
  url: string
  thumbnail?: string
  title?: string
  type: 'image' | 'gif'
}

export function useCurseForgeImages() {
  // Pas de lazy : la galerie doit être dans le HTML initial pour le SEO
  // (le cache serveur d'1h rend l'appel quasi instantané).
  const { data } = useFetch('/api/curseforge-images', {
    server: true,
  })

  const images = computed<GalleryImage[]>(() => {
    const val = data.value as any
    return val && Array.isArray(val.images) ? val.images : []
  })

  return { images }
}
