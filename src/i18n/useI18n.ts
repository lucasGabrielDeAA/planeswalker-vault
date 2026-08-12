import { ref, computed } from 'vue'
import { en } from './locales/en'
import { ptBR } from './locales/pt-BR'
import { useExchangeRateQuery } from '@/queries/useExchangeRateQuery'

export type SupportedLocale = 'en' | 'pt-BR'

const STORAGE_KEY = 'magic_cards_locale'

// Get initial locale from localStorage or browser settings
function getInitialLocale(): SupportedLocale {
  const saved = localStorage.getItem(STORAGE_KEY)
  if (saved === 'en' || saved === 'pt-BR') return saved
  
  if (typeof navigator !== 'undefined' && navigator.language?.toLowerCase().startsWith('pt')) {
    return 'pt-BR'
  }
  return 'en'
}

const currentLocale = ref<SupportedLocale>(getInitialLocale())

const dictionaries = {
  en,
  'pt-BR': ptBR,
}

export function useI18n() {
  const { data: exchangeRateData, refetch: fetchExchangeRate } = useExchangeRateQuery()

  const usdToBrlRate = computed(() => exchangeRateData.value?.bid ?? 5.50)
  const usdPctChange = computed(() => exchangeRateData.value?.pctChange ?? null)
  function setLocale(locale: SupportedLocale) {
    currentLocale.value = locale
    localStorage.setItem(STORAGE_KEY, locale)
  }

  function toggleLocale() {
    setLocale(currentLocale.value === 'en' ? 'pt-BR' : 'en')
  }

  // Translation helper function t('section.key', { param: 'val' })
  function t(path: string, params?: Record<string, string | number>): string {
    const keys = path.split('.')
    let current: any = dictionaries[currentLocale.value]

    for (const key of keys) {
      if (current && typeof current === 'object' && key in current) {
        current = current[key]
      } else {
        // Fallback to English if key missing
        let fallback: any = dictionaries['en']
        for (const k of keys) {
          if (fallback && typeof fallback === 'object' && k in fallback) {
            fallback = fallback[k]
          } else {
            return path
          }
        }
        current = fallback
        break
      }
    }

    if (typeof current !== 'string') return path

    if (params) {
      return Object.entries(params).reduce((str, [pKey, pVal]) => {
        return str.replace(new RegExp(`\\{${pKey}\\}`, 'g'), String(pVal))
      }, current)
    }

    return current
  }

  // Text showing USD variation / conversion rate used for Reais
  const usdRateVariationText = computed(() => {
    const formattedRate = usdToBrlRate.value.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
    const variation = usdPctChange.value ? ` (${usdPctChange.value > '0' ? '+' : ''}${usdPctChange.value}%)` : ''
    
    if (currentLocale.value === 'pt-BR') {
      return `Cotação USD: 1 USD = R$ ${formattedRate}${variation}`
    }
    return `Exchange rate: 1 USD = R$ ${formattedRate}${variation}`
  })

  // Format currency based on current active locale ($ vs R$)
  function formatCurrency(val: string | number | null | undefined): string {
    if (val === null || val === undefined || val === '') return t('card.noPrice')

    const num = typeof val === 'string' ? parseFloat(val) : val
    if (isNaN(num)) return t('card.noPrice')

    if (currentLocale.value === 'pt-BR') {
      const brlValue = num * usdToBrlRate.value
      return brlValue.toLocaleString('pt-BR', {
        style: 'currency',
        currency: 'BRL',
      })
    }

    return num.toLocaleString('en-US', {
      style: 'currency',
      currency: 'USD',
    })
  }

  return {
    locale: computed(() => currentLocale.value),
    setLocale,
    toggleLocale,
    t,
    formatCurrency,
    usdToBrlRate: computed(() => usdToBrlRate.value),
    usdPctChange: computed(() => usdPctChange.value),
    usdRateVariationText,
    fetchExchangeRate,
  }
}
