import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { ScryfallCard, SortOrder, SortDirection, CardSearchOptions } from '@/types/scryfall'

export const useCardsStore = defineStore('cards', () => {
  const searchQuery = ref('')
  const currentPage = ref(1)

  // Filters
  const sortOrder = ref<SortOrder>('edhrec')
  const sortDir = ref<SortDirection>('auto')
  const selectedColors = ref<string[]>([])
  const colorMatchType = ref<'exact' | 'at_least' | 'at_most'>('at_least')
  const selectedType = ref<string>('')
  const selectedRarity = ref<string>('')
  const selectedFormat = ref<string>('')

  // Modal inspection target
  const activeCard = ref<ScryfallCard | null>(null)
  const isModalOpen = ref(false)

  // Build composite Scryfall query string from raw query + UI filter selections
  const fullQueryString = computed(() => {
    const parts: string[] = []
    
    if (searchQuery.value.trim()) {
      parts.push(searchQuery.value.trim())
    }

    // Color filter
    if (selectedColors.value.length > 0) {
      const colorsStr = selectedColors.value.join('')
      if (colorMatchType.value === 'exact') {
        parts.push(`c:${colorsStr}`)
      } else if (colorMatchType.value === 'at_least') {
        parts.push(`c>=${colorsStr}`)
      } else {
        parts.push(`c<=${colorsStr}`)
      }
    }

    // Type filter
    if (selectedType.value) {
      parts.push(`t:${selectedType.value}`)
    }

    // Rarity filter
    if (selectedRarity.value) {
      parts.push(`r:${selectedRarity.value}`)
    }

    // Format legalities
    if (selectedFormat.value) {
      parts.push(`f:${selectedFormat.value}`)
    }

    return parts.join(' ') || 'game:paper'
  })

  // Reactive options payload for TanStack Vue Query
  const searchOptions = computed<CardSearchOptions>(() => ({
    q: fullQueryString.value,
    page: currentPage.value,
    order: sortOrder.value,
    dir: sortDir.value,
  }))

  function executeSearch(page = 1) {
    currentPage.value = page
  }

  function toggleColor(color: string) {
    const idx = selectedColors.value.indexOf(color)
    if (idx >= 0) {
      selectedColors.value.splice(idx, 1)
    } else {
      selectedColors.value.push(color)
    }
    executeSearch(1)
  }

  function resetFilters() {
    searchQuery.value = ''
    selectedColors.value = []
    selectedType.value = ''
    selectedRarity.value = ''
    selectedFormat.value = ''
    sortOrder.value = 'edhrec'
    sortDir.value = 'auto'
    executeSearch(1)
  }

  function openCardModal(card: ScryfallCard) {
    activeCard.value = card
    isModalOpen.value = true
  }

  function closeCardModal() {
    isModalOpen.value = false
    activeCard.value = null
  }

  return {
    searchQuery,
    currentPage,
    sortOrder,
    sortDir,
    selectedColors,
    colorMatchType,
    selectedType,
    selectedRarity,
    selectedFormat,
    fullQueryString,
    searchOptions,
    activeCard,
    isModalOpen,
    executeSearch,
    toggleColor,
    resetFilters,
    openCardModal,
    closeCardModal,
  }
})
