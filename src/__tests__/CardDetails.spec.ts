import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { VueQueryPlugin, QueryClient } from '@/queries/vueQuery'
import CardDetails from '@/components/CardDetails.vue'
import { useI18n } from '@/i18n/useI18n'
import type { ScryfallCard } from '@/types/scryfall'

const mockCard: ScryfallCard = {
  id: 'card-123',
  oracle_id: 'oracle-123',
  name: 'Black Lotus',
  mana_cost: '{0}',
  cmc: 0,
  type_line: 'Artifact',
  oracle_text: '{T}, Sacrifice Black Lotus: Add three mana of any one color.',
  set: 'lea',
  set_name: 'Limited Edition Alpha',
  collector_number: '232',
  rarity: 'rare',
  image_uris: {
    small: 'https://cards.scryfall.io/small.jpg',
    normal: 'https://cards.scryfall.io/normal.jpg',
    large: 'https://cards.scryfall.io/large.jpg',
  },
  prices: {
    usd: '10000.00',
    usd_foil: null,
    eur: '9500.00',
    tix: null,
  },
  purchase_uris: {
    tcgplayer: 'https://www.tcgplayer.com/product/123',
    cardmarket: 'https://www.cardmarket.com/product/123',
  },
  legalities: {
    vintage: 'restricted',
    commander: 'banned',
    legacy: 'banned',
    modern: 'not_legal',
    standard: 'not_legal',
    pioneer: 'not_legal',
    pauper: 'not_legal',
    historic: 'not_legal',
    alchemy: 'not_legal',
    timeless: 'restricted',
  },
} as unknown as ScryfallCard

describe('CardDetails.vue Purchase Links & Internationalization', () => {
  let queryClient: QueryClient

  beforeEach(() => {
    setActivePinia(createPinia())
    localStorage.clear()
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    })
  })

  function createWrapper() {
    return mount(CardDetails, {
      props: {
        card: mockCard,
      },
      global: {
        plugins: [createPinia(), [VueQueryPlugin, { queryClient }]],
      },
    })
  }

  it('renders LigaMagic button when locale is pt-BR', async () => {
    const { setLocale } = useI18n()
    setLocale('pt-BR')

    const wrapper = createWrapper()
    const buyLinks = wrapper.findAll('.buy-link')

    expect(buyLinks.length).toBe(1)
    expect(buyLinks[0]!.text()).toContain('Comprar na LigaMagic')
    expect(buyLinks[0]!.attributes('href')).toBe(
      'https://www.ligamagic.com.br/?view=cards/search&card=Black%20Lotus',
    )
  })

  it('renders TCGplayer and Cardmarket buttons when locale is en', async () => {
    const { setLocale } = useI18n()
    setLocale('en')

    const wrapper = createWrapper()
    const buyLinks = wrapper.findAll('.buy-link')

    expect(buyLinks.length).toBe(2)
    expect(buyLinks[0]!.text()).toBe('Buy on TCGplayer')
    expect(buyLinks[0]!.attributes('href')).toBe('https://www.tcgplayer.com/product/123')
    expect(buyLinks[1]!.text()).toBe('Buy on Cardmarket')
    expect(buyLinks[1]!.attributes('href')).toBe('https://www.cardmarket.com/product/123')
  })
})
