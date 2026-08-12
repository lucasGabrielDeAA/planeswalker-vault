import { createRouter, createWebHistory } from 'vue-router'
import SearchView from '@/views/SearchView.vue'
import SetsView from '@/views/SetsView.vue'
import RandomView from '@/views/RandomView.vue'
import BinderView from '@/views/BinderView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'search',
      component: SearchView,
    },
    {
      path: '/sets',
      name: 'sets',
      component: SetsView,
    },
    {
      path: '/random',
      name: 'random',
      component: RandomView,
    },
    {
      path: '/binder',
      name: 'binder',
      component: BinderView,
    },
  ],
})

export default router
