import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia } from 'pinia'
import { VueQueryPlugin, QueryClient } from '@/queries/vueQuery'
import router from '@/router'
import App from '../App.vue'

describe('App', () => {
  it('mounts properly', () => {
    const queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    })
    const wrapper = mount(App, {
      global: {
        plugins: [createPinia(), [VueQueryPlugin, { queryClient }], router],
      },
    })
    expect(wrapper.exists()).toBe(true)
  })
})
