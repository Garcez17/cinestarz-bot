type PartyData = {
  currentTime: number
  currentRate: number
  paused: boolean
  runAt: number // timestamp enviado pelo host, em ms
}

class PartyStateCache {
  private cache = new Map<string, { data: PartyData; lastUpdated: number }>()
  private ttl = 60_000 // 1 minuto

  constructor() {
    setInterval(() => this.cleanup(), 30_000)
  }

  set(partyId: string, data: PartyData) {
    // Armazena exatamente o que vem do front
    this.cache.set(partyId, {
      data: { ...data },
      lastUpdated: Date.now(),
    })
  }

  get(partyId: string): PartyData | null {
    const entry = this.cache.get(partyId)
    if (!entry) return null

    const now = Date.now()
    if (now - entry.lastUpdated > this.ttl) {
      this.cache.delete(partyId)
      return null
    }

    // Retorna os dados crus, sem alterar currentTime
    return { ...entry.data }
  }

  cleanup() {
    const now = Date.now()
    for (const [partyId, entry] of this.cache.entries()) {
      if (now - entry.lastUpdated > this.ttl) {
        this.cache.delete(partyId)
      }
    }
  }
}

export const partyCache = new PartyStateCache()
