import { useQuery } from './vueQuery'

export interface ExchangeRateData {
  bid: number
  pctChange: string | null
}

async function fetchAwesomeExchangeRate(): Promise<ExchangeRateData> {
  const res = await fetch('https://economia.awesomeapi.com.br/last/USD-BRL')
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  const data = await res.json()
  if (data.USDBRL) {
    const bid = parseFloat(data.USDBRL.bid)
    if (!isNaN(bid) && bid > 0) {
      return {
        bid,
        pctChange: data.USDBRL.pctChange || null,
      }
    }
  }
  throw new Error('Invalid exchange rate payload')
}

export function useExchangeRateQuery() {
  return useQuery<ExchangeRateData>({
    queryKey: ['currency', 'usd-brl'],
    queryFn: fetchAwesomeExchangeRate,
    staleTime: 1000 * 60 * 30, // 30 mins
  })
}
