import { describe, it, expect, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createRouter, createWebHistory } from 'vue-router'
import { VueQueryPlugin, QueryClient } from '@/queries/vueQuery'
import Navbar from '@/components/Navbar.vue'
import { useCardsStore } from '@/stores/cards'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', name: 'search', component: { template: '<div>Search</div>' } },
    { path: '/sets', name: 'sets', component: { template: '<div>Sets</div>' } },
    { path: '/random', name: 'random', component: { template: '<div>Random</div>' } },
    { path: '/binder', name: 'binder', component: { template: '<div>Binder</div>' } },
  ],
})

describe('Navbar Clear Search Button', () => {
  let queryClient: QueryClient

  beforeEach(() => {
    setActivePinia(createPinia())
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    })
  })

  function createWrapper() {
    return mount(Navbar, {
      global: {
        plugins: [createPinia(), [VueQueryPlugin, { queryClient }], router],
      },
    })
  }

  it('does not show clear button when input is empty', () => {
    const wrapper = createWrapper()
    const clearBtn = wrapper.find('.clear-search-btn')
    expect(clearBtn.exists()).toBe(false)
  })

  it('shows clear button when input has text', async () => {
    const wrapper = createWrapper()
    const input = wrapper.find<HTMLInputElement>('.search-input')
    await input.setValue('The Ur-Dragon')
    const clearBtn = wrapper.find('.clear-search-btn')
    expect(clearBtn.exists()).toBe(true)
  })

  it('clears input and resets search request in store when clicked', async () => {
    const wrapper = createWrapper()
    const cardsStore = useCardsStore()

    // Simulate existing search in store
    cardsStore.searchQuery = 'The Ur-Dragon'
    cardsStore.executeSearch(1)

    const input = wrapper.find<HTMLInputElement>('.search-input')
    await input.setValue('The Ur-Dragon')

    const clearBtn = wrapper.find('.clear-search-btn')
    expect(clearBtn.exists()).toBe(true)

    await clearBtn.trigger('click')

    expect(input.element.value).toBe('')
    expect(cardsStore.searchQuery).toBe('')
    expect(wrapper.find('.clear-search-btn').exists()).toBe(false)
  })
})
