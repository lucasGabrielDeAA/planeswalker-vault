import { computed, type Ref } from 'vue'
import { useQuery } from './vueQuery'
import { ScryfallService } from '@/services/scryfall'
import type { CardSearchOptions, ScryfallCard, ScryfallList, ScryfallRuling, ScryfallSet } from '@/types/scryfall'

export function useCardSearchQuery(options: Ref<CardSearchOptions | string>) {
  return useQuery<ScryfallList<ScryfallCard>>({
    queryKey: computed(() => {
      const opts = options.value
      if (typeof opts === 'string') {
        return ['cards', 'search', opts]
      }
      return ['cards', 'search', opts.q, opts.page, opts.order, opts.dir]
    }),
    queryFn: () => ScryfallService.searchCards(options.value),
    staleTime: 1000 * 60 * 5, // 5 mins
  })
}

export function useCardAutocompleteQuery(query: Ref<string>) {
  return useQuery<string[]>({
    queryKey: computed(() => ['cards', 'autocomplete', query.value.trim()]),
    queryFn: () => ScryfallService.autocompleteCards(query.value),
    enabled: computed(() => query.value.trim().length >= 2),
    staleTime: 1000 * 60 * 10, // 10 mins
  })
}

export function useCardRulingsQuery(cardId: Ref<string | undefined>) {
  return useQuery<ScryfallRuling[]>({
    queryKey: computed(() => ['cards', 'rulings', cardId.value]),
    queryFn: () => ScryfallService.getCardRulings(cardId.value!),
    enabled: computed(() => Boolean(cardId.value)),
    staleTime: 1000 * 60 * 30, // 30 mins
  })
}

export function useCardPrintsQuery(oracleId: Ref<string | undefined>) {
  return useQuery<ScryfallCard[]>({
    queryKey: computed(() => ['cards', 'prints', oracleId.value]),
    queryFn: () => ScryfallService.getPrintsByOracleId(oracleId.value!),
    enabled: computed(() => Boolean(oracleId.value)),
    staleTime: 1000 * 60 * 15, // 15 mins
  })
}

export function useSetsQuery() {
  return useQuery<ScryfallSet[]>({
    queryKey: ['sets'],
    queryFn: () => ScryfallService.getSets(),
    staleTime: 1000 * 60 * 60, // 1 hour
  })
}

export function useRandomCardQuery(queryFilter: Ref<string>) {
  return useQuery<ScryfallCard>({
    queryKey: computed(() => ['cards', 'random', queryFilter.value]),
    queryFn: () => ScryfallService.getRandomCard(queryFilter.value || undefined),
    staleTime: 0, // Fresh draw on every trigger
  })
}
