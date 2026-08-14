import { ref, computed, watch, onUnmounted, inject, type App, type Ref } from 'vue'

export type QueryKey = readonly unknown[]

export interface QueryOptions<TData = any, TError = Error> {
  queryKey: QueryKey | Ref<QueryKey> | (() => QueryKey)
  queryFn: (context: { queryKey: QueryKey }) => Promise<TData>
  enabled?: boolean | Ref<boolean> | (() => boolean)
  staleTime?: number
  gcTime?: number
  refetchOnWindowFocus?: boolean
  retry?: boolean | number
}

export interface QueryResult<TData = any, TError = Error> {
  data: Ref<TData | undefined>
  isLoading: Ref<boolean>
  isFetching: Ref<boolean>
  isError: Ref<boolean>
  error: Ref<TError | null>
  refetch: () => Promise<TData | undefined>
}

interface CacheEntry<TData = any> {
  data: TData
  updatedAt: number
  promise?: Promise<TData>
}

export interface DefaultQueryOptions {
  staleTime?: number
  gcTime?: number
  refetchOnWindowFocus?: boolean
  retry?: boolean | number
}

export interface QueryClientConfig {
  defaultOptions?: {
    queries?: DefaultQueryOptions
  }
}

export class QueryClient {
  private cache = new Map<string, CacheEntry>()
  private defaultStaleTime: number

  constructor(options?: QueryClientConfig) {
    this.defaultStaleTime = options?.defaultOptions?.queries?.staleTime ?? 1000 * 60 * 5 // 5 mins
  }

  private serializeKey(key: QueryKey): string {
    return JSON.stringify(key)
  }

  getQueryData<TData = any>(queryKey: QueryKey): TData | undefined {
    const keyStr = this.serializeKey(queryKey)
    return this.cache.get(keyStr)?.data
  }

  setQueryData<TData = any>(queryKey: QueryKey, data: TData): void {
    const keyStr = this.serializeKey(queryKey)
    this.cache.set(keyStr, {
      data,
      updatedAt: Date.now(),
    })
  }

  async fetchQuery<TData = any>(queryKey: QueryKey, queryFn: (ctx: { queryKey: QueryKey }) => Promise<TData>, staleTime?: number): Promise<TData> {
    const keyStr = this.serializeKey(queryKey)
    const entry = this.cache.get(keyStr)
    const effectiveStaleTime = staleTime ?? this.defaultStaleTime

    if (entry && Date.now() - entry.updatedAt < effectiveStaleTime) {
      return entry.data
    }

    if (entry?.promise) {
      return entry.promise
    }

    const promise = queryFn({ queryKey })
    if (entry) entry.promise = promise

    try {
      const data = await promise
      this.cache.set(keyStr, {
        data,
        updatedAt: Date.now(),
      })
      return data
    } finally {
      const e = this.cache.get(keyStr)
      if (e) delete e.promise
    }
  }

  invalidateQueries(filters?: { queryKey?: QueryKey }): void {
    if (!filters?.queryKey) {
      this.cache.clear()
      return
    }
    const keyStr = this.serializeKey(filters.queryKey)
    this.cache.delete(keyStr)
  }
}

const QUERY_CLIENT_KEY = Symbol('VUE_QUERY_CLIENT')
const globalQueryClient = new QueryClient()

export const VueQueryPlugin = {
  install(app: App, options?: { queryClient?: QueryClient }) {
    const client = options?.queryClient ?? globalQueryClient
    app.provide(QUERY_CLIENT_KEY, client)
  },
}

export function useQuery<TData = any, TError = Error>(
  options: QueryOptions<TData, TError>
): QueryResult<TData, TError> {
  const queryClient = inject<QueryClient>(QUERY_CLIENT_KEY, globalQueryClient)

  const data = ref<TData | undefined>(undefined) as Ref<TData | undefined>
  const isLoading = ref<boolean>(true)
  const isFetching = ref<boolean>(false)
  const isError = ref<boolean>(false)
  const error = ref<TError | null>(null) as Ref<TError | null>

  const getResolvedKey = (): QueryKey => {
    if (typeof options.queryKey === 'function') {
      return options.queryKey()
    }
    if (options.queryKey && typeof options.queryKey === 'object' && 'value' in options.queryKey) {
      return (options.queryKey as Ref<QueryKey>).value
    }
    return options.queryKey as QueryKey
  }

  const getResolvedEnabled = (): boolean => {
    if (options.enabled === undefined) return true
    if (typeof options.enabled === 'function') return options.enabled()
    if (typeof options.enabled === 'object' && 'value' in options.enabled) {
      return Boolean((options.enabled as Ref<boolean>).value)
    }
    return Boolean(options.enabled)
  }

  async function executeFetch(force = false): Promise<TData | undefined> {
    const isEnabled = getResolvedEnabled()
    if (!isEnabled) {
      isLoading.value = false
      isFetching.value = false
      return undefined
    }

    const key = getResolvedKey()
    const existingData = queryClient.getQueryData<TData>(key)

    if (existingData !== undefined && !force) {
      data.value = existingData
      isLoading.value = false
      isFetching.value = false
      isError.value = false
      error.value = null
    } else {
      data.value = undefined
      isLoading.value = true
      error.value = null
    }

    isFetching.value = true

    try {
      const result = await queryClient.fetchQuery<TData>(
        key,
        options.queryFn,
        force ? 0 : options.staleTime
      )
      data.value = result
      isError.value = false
      error.value = null
      return result
    } catch (err: any) {
      isError.value = true
      error.value = err
    } finally {
      isLoading.value = false
      isFetching.value = false
    }
  }

  // Watch for key or enabled changes
  watch(
    [() => getResolvedKey(), () => getResolvedEnabled()],
    () => {
      executeFetch()
    },
    { immediate: true, deep: true }
  )

  return {
    data,
    isLoading,
    isFetching,
    isError,
    error,
    refetch: () => executeFetch(true),
  }
}
