export function normalizeTitle(rawTitle: string): string {
  const stopwords = [
    "full hd", "hd", "4k", "trailer", "official", "movie", "live", "complete",
    "completo", "filme", "oficial", "ao vivo",
    "completa", "película", "en vivo",
    "film", "officiel", "complet", "en direct",
    "vollständig", "offiziell"
  ]

  const pattern = new RegExp(`\\b(${stopwords.join('|')})\\b`, 'gi')

  return rawTitle
    .replace(/\s*-\s*(YouTube|Dailymotion|Vimeo|Netflix|Prime Video|Disney\+?)$/i, '')
    .replace(pattern, '')
    .replace(/[^\wÀ-ÿ\s]/g, '')
    .replace(/\s{2,}/g, ' ')
    .trim()
}
