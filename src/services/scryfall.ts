import type {
  ScryfallCard,
  ScryfallList,
  ScryfallSet,
  ScryfallRuling,
  ScryfallCatalog,
  CardSearchOptions,
  ScryfallError,
} from '@/types/scryfall'

const BASE_URL = 'https://api.scryfall.com'

// Delay queue to respect Scryfall rate limits (50-100ms per request)
let lastRequestTime = 0
const MIN_REQUEST_INTERVAL_MS = 60

async function rateLimitedFetch(url: string, init?: RequestInit): Promise<Response> {
  const now = Date.now()
  const timeSinceLast = now - lastRequestTime
  if (timeSinceLast < MIN_REQUEST_INTERVAL_MS) {
    await new Promise((resolve) => setTimeout(resolve, MIN_REQUEST_INTERVAL_MS - timeSinceLast))
  }
  lastRequestTime = Date.now()

  const response = await fetch(url, {
    ...init,
    headers: {
      Accept: 'application/json;q=0.9,*/*;q=0.8',
      ...(init?.headers || {}),
    },
  })

  if (!response.ok) {
    let errorData: ScryfallError | null = null
    try {
      errorData = await response.json()
    } catch {
      // JSON parse failed
    }
    const message = errorData?.details || `Scryfall API error (${response.status}: ${response.statusText})`
    const err = new Error(message) as Error & { status?: number; scryfallError?: ScryfallError }
    err.status = response.status
    if (errorData) err.scryfallError = errorData
    throw err
  }

  return response
}

export class ScryfallService {
  /**
   * Search cards based on search options or query string
   */
  static async searchCards(options: CardSearchOptions | string): Promise<ScryfallList<ScryfallCard>> {
    const searchParams = new URLSearchParams()
    if (typeof options === 'string') {
      searchParams.set('q', options)
    } else {
      searchParams.set('q', options.q)
      if (options.page) searchParams.set('page', options.page.toString())
      if (options.order) searchParams.set('order', options.order)
      if (options.dir) searchParams.set('dir', options.dir)
      if (options.unique) searchParams.set('unique', options.unique)
      if (options.include_extras) searchParams.set('include_extras', 'true')
      if (options.include_multilingual) searchParams.set('include_multilingual', 'true')
      if (options.include_variations) searchParams.set('include_variations', 'true')
    }

    const res = await rateLimitedFetch(`${BASE_URL}/cards/search?${searchParams.toString()}`)
    return res.json()
  }

  /**
   * Autocomplete card names for live search suggestions
   */
  static async autocompleteCards(query: string): Promise<string[]> {
    if (!query || query.trim().length < 2) return []
    const searchParams = new URLSearchParams({ q: query.trim() })
    const res = await rateLimitedFetch(`${BASE_URL}/cards/autocomplete?${searchParams.toString()}`)
    const catalog: ScryfallCatalog = await res.json()
    return catalog.data || []
  }

  /**
   * Get a single card by its Scryfall ID
   */
  static async getCardById(id: string): Promise<ScryfallCard> {
    const res = await rateLimitedFetch(`${BASE_URL}/cards/${id}`)
    return res.json()
  }

  /**
   * Get official rulings for a card ID
   */
  static async getCardRulings(id: string): Promise<ScryfallRuling[]> {
    const res = await rateLimitedFetch(`${BASE_URL}/cards/${id}/rulings`)
    const list: ScryfallList<ScryfallRuling> = await res.json()
    return list.data || []
  }

  /**
   * Get a random card, optionally filtered by a query string (e.g. q=is:commander)
   */
  static async getRandomCard(q?: string): Promise<ScryfallCard> {
    const url = q ? `${BASE_URL}/cards/random?q=${encodeURIComponent(q)}` : `${BASE_URL}/cards/random`
    const res = await rateLimitedFetch(url)
    return res.json()
  }

  /**
   * Fetch all Magic sets
   */
  static async getSets(): Promise<ScryfallSet[]> {
    const res = await rateLimitedFetch(`${BASE_URL}/sets`)
    const list: ScryfallList<ScryfallSet> = await res.json()
    return list.data || []
  }

  /**
   * Fetch details for a specific set by code
   */
  static async getSetByCode(code: string): Promise<ScryfallSet> {
    const res = await rateLimitedFetch(`${BASE_URL}/sets/${code.toLowerCase()}`)
    return res.json()
  }

  /**
   * Get prints/variations of a card by oracle ID
   */
  static async getPrintsByOracleId(oracleId: string): Promise<ScryfallCard[]> {
    const res = await rateLimitedFetch(
      `${BASE_URL}/cards/search?q=oracleid:${oracleId}&unique=prints`
    )
    const list: ScryfallList<ScryfallCard> = await res.json()
    return list.data || []
  }
}
