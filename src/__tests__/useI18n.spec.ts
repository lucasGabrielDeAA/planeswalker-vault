import { describe, it, expect, beforeEach } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import { useI18n } from '@/i18n/useI18n'

describe('useI18n formatDate', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    localStorage.clear()
  })

  it('formats dates in English format (MM/DD/YYYY) when locale is en', () => {
    const { setLocale, formatDate } = useI18n()
    setLocale('en')

    expect(formatDate('2023-11-17')).toBe('11/17/2023')
    expect(formatDate('2007-05-04')).toBe('05/04/2007')
  })

  it('formats dates in Brazilian Portuguese format (DD/MM/YYYY) when locale is pt-BR', () => {
    const { setLocale, formatDate } = useI18n()
    setLocale('pt-BR')

    expect(formatDate('2023-11-17')).toBe('17/11/2023')
    expect(formatDate('2007-05-04')).toBe('04/05/2007')
  })

  it('handles empty or null values gracefully', () => {
    const { formatDate } = useI18n()
    expect(formatDate(null)).toBe('')
    expect(formatDate(undefined)).toBe('')
    expect(formatDate('')).toBe('')
  })
})
