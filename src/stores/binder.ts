import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import type { ScryfallCard } from '@/types/scryfall'

export interface BinderEntry {
  card: ScryfallCard
  quantity: number
  addedAt: string
}

const STORAGE_KEY = 'scryfall_mtg_binder_v1'

export const useBinderStore = defineStore('binder', () => {
  const items = ref<BinderEntry[]>(loadFromStorage())

  function loadFromStorage(): BinderEntry[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        return JSON.parse(raw)
      }
    } catch (e) {
      console.error('Failed to load binder from localStorage', e)
    }
    return []
  }

  // Persist changes to localStorage
  watch(
    items,
    (val) => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(val))
      } catch (e) {
        console.error('Failed to save binder to localStorage', e)
      }
    },
    { deep: true }
  )

  function isSaved(cardId: string): boolean {
    return items.value.some((entry) => entry.card.id === cardId)
  }

  function toggleSave(card: ScryfallCard) {
    const existingIndex = items.value.findIndex((entry) => entry.card.id === card.id)
    if (existingIndex >= 0) {
      items.value.splice(existingIndex, 1)
    } else {
      items.value.push({
        card,
        quantity: 1,
        addedAt: new Date().toISOString(),
      })
    }
  }

  function updateQuantity(cardId: string, quantity: number) {
    const entry = items.value.find((e) => e.card.id === cardId)
    if (entry) {
      if (quantity <= 0) {
        removeCard(cardId)
      } else {
        entry.quantity = quantity
      }
    }
  }

  function removeCard(cardId: string) {
    const idx = items.value.findIndex((e) => e.card.id === cardId)
    if (idx >= 0) {
      items.value.splice(idx, 1)
    }
  }

  function clearBinder() {
    items.value = []
  }

  // Computed metrics
  const totalCount = computed(() => {
    return items.value.reduce((acc, curr) => acc + curr.quantity, 0)
  })

  const totalEstimatedUsd = computed(() => {
    let total = 0
    for (const entry of items.value) {
      const priceStr = entry.card.prices?.usd || entry.card.prices?.usd_foil
      if (priceStr) {
        const val = parseFloat(priceStr)
        if (!isNaN(val)) {
          total += val * entry.quantity
        }
      }
    }
    return total
  })

  const manaCurve = computed(() => {
    // 0 to 7+ CMCs
    const curve: Record<string, number> = {
      '0': 0,
      '1': 0,
      '2': 0,
      '3': 0,
      '4': 0,
      '5': 0,
      '6': 0,
      '7+': 0,
    }

    for (const entry of items.value) {
      // Exclude lands from mana curve
      if (entry.card.type_line?.toLowerCase().includes('land')) continue

      const cmc = Math.floor(entry.card.cmc || 0)
      const key = cmc >= 7 ? '7+' : cmc.toString()
      curve[key] = (curve[key] ?? 0) + entry.quantity
    }
    return curve
  })

  const colorBreakdown = computed(() => {
    const breakdown: Record<string, number> = {
      W: 0,
      U: 0,
      B: 0,
      R: 0,
      G: 0,
      Colorless: 0,
      Multi: 0,
    }

    for (const entry of items.value) {
      const colors = entry.card.colors || []
      if (colors.length === 0) {
        breakdown.Colorless = (breakdown.Colorless ?? 0) + entry.quantity
      } else if (colors.length > 1) {
        breakdown.Multi = (breakdown.Multi ?? 0) + entry.quantity
      } else {
        const c = colors[0]
        if (c && breakdown[c] !== undefined) {
          breakdown[c] = (breakdown[c] ?? 0) + entry.quantity
        }
      }
    }
    return breakdown
  })

  function getItemQuantity(cardId: string): number {
    const entry = items.value.find((e) => e.card.id === cardId)
    return entry ? entry.quantity : 0
  }

  return {
    items,
    isSaved,
    getItemQuantity,
    toggleSave,
    updateQuantity,
    removeCard,
    clearBinder,
    totalCount,
    totalEstimatedUsd,
    manaCurve,
    colorBreakdown,
  }
})
