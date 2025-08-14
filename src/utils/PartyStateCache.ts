type PartyData = {
  currentTime: number
  currentRate: number
  runAt: number
}

class PartyStateCache {
  private cache = new Map<string, { data: PartyData; lastUpdated: number }>()
  private ttl = 15 * 60_000 

  constructor() {
    setInterval(() => this.cleanup(), 5 * 60_000)
  }

  set(partyId: string, data: PartyData) {
    this.cache.set(partyId, {
      data,
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

    return entry.data
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
