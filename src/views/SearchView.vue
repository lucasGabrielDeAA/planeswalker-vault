<script setup lang="ts">
import { computed } from 'vue'
import { useCardsStore } from '@/stores/cards'
import { useI18n } from '@/i18n/useI18n'
import { useCardSearchQuery } from '@/queries/useScryfallQueries'
import SearchFilters from '@/components/SearchFilters.vue'
import CardCard from '@/components/CardCard.vue'

const cardsStore = useCardsStore()
const { t } = useI18n()

// TanStack Query for searching cards
const searchOptionsRef = computed(() => cardsStore.searchOptions)
const { data: searchResult, isLoading, isError, error } = useCardSearchQuery(searchOptionsRef)

const cards = computed(() => searchResult.value?.data || [])
const totalCards = computed(() => searchResult.value?.total_cards || cards.value.length)
const hasMore = computed(() => searchResult.value?.has_more ?? false)
const errorMessage = computed(() => {
  if (!isError.value) return null
  return error.value?.message || 'Failed to fetch cards. Try refining your query.'
})

function goToPage(page: number) {
  if (page < 1) return
  cardsStore.executeSearch(page)
  window.scrollTo({ top: 0, behavior: 'smooth' })
}
</script>

<template>
  <div class="search-view-container fade-in">
    <!-- Filters Sidebar -->
    <div class="sidebar">
      <SearchFilters />
    </div>

    <!-- Main Results Content Area -->
    <main class="main-content">
      <!-- Results Header Stats & Status -->
      <div class="results-header glass-panel">
        <div class="stats-group">
          <h2>{{ t('search.title') }}</h2>
          <span v-if="!isLoading" class="total-badge">
            {{ t('search.resultsCount', { count: totalCards.toLocaleString() }) }}
          </span>
        </div>
        <span class="page-indicator">
          {{ t('search.page', { current: cardsStore.currentPage, total: '...' }) }}
        </span>
      </div>

      <!-- Error Alert Box -->
      <div v-if="errorMessage" class="error-box glass-panel">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="8" x2="12" y2="12"></line>
          <line x1="12" y1="16" x2="12.01" y2="16"></line>
        </svg>
        <div class="error-msg">
          <h4>{{ t('search.noResultsTitle') }}</h4>
          <p>{{ errorMessage }}</p>
        </div>
      </div>

      <!-- Loading Skeletons -->
      <div v-if="isLoading" class="cards-grid">
        <div v-for="i in 12" :key="i" class="card-skeleton glass-panel">
          <div class="skeleton" style="height: 20px; width: 60%; margin-bottom: 8px" />
          <div class="skeleton" style="aspect-ratio: 488/680; width: 100%" />
        </div>
      </div>

      <!-- Cards Grid -->
      <div v-else-if="cards.length > 0" class="cards-grid">
        <CardCard v-for="card in cards" :key="card.id" :card="card" />
      </div>

      <!-- Empty State -->
      <div v-else-if="!errorMessage" class="empty-state glass-panel">
        <p>{{ t('search.noResultsText') }}</p>
      </div>

      <!-- Pagination Bar -->
      <div v-if="cards.length > 0 && !isLoading" class="pagination-bar">
        <button
          class="btn-secondary"
          :disabled="cardsStore.currentPage <= 1"
          @click="goToPage(cardsStore.currentPage - 1)"
        >
          {{ t('search.prev') }}
        </button>
        <span class="page-current">Page {{ cardsStore.currentPage }}</span>
        <button
          class="btn-secondary"
          :disabled="!hasMore"
          @click="goToPage(cardsStore.currentPage + 1)"
        >
          {{ t('search.next') }}
        </button>
      </div>
    </main>
  </div>
</template>

<style scoped>
.search-view-container {
  display: grid;
  grid-template-columns: 280px minmax(0, 1fr);
  gap: 20px;
  max-width: 1280px;
  width: 100%;
  margin: 0 auto;
  padding: 0 12px 40px 12px;
  box-sizing: border-box;
}

@media (max-width: 900px) {
  .search-view-container {
    grid-template-columns: minmax(0, 1fr);
  }
}

.sidebar {
  display: flex;
  flex-direction: column;
  min-width: 0;
  width: 100%;
}

.main-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
  min-width: 0;
  width: 100%;
}

.results-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 20px;
  min-height: 54px;
  gap: 12px;
}

.stats-group {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
}

.stats-group h2 {
  font-family: var(--font-serif);
  font-size: 1.15rem;
  color: var(--text-main);
  white-space: nowrap;
}

.total-badge {
  background: var(--bg-surface-elevated);
  border: 1px solid var(--border-glass);
  color: var(--primary-gold);
  font-size: 0.8rem;
  font-weight: 700;
  padding: 2px 10px;
  border-radius: var(--radius-full);
  white-space: nowrap;
}

.page-indicator {
  font-size: 0.85rem;
  color: var(--text-muted);
  white-space: nowrap;
}

.cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
  min-width: 0;
  width: 100%;
}

.card-skeleton {
  padding: 12px;
}

.error-box {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  border-color: rgba(239, 68, 68, 0.4);
  background: rgba(239, 68, 68, 0.05);
  color: #f87171;
}

.empty-state {
  padding: 40px;
  text-align: center;
  color: var(--text-muted);
}

.pagination-bar {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  margin-top: 20px;
}

.page-current {
  font-weight: 700;
  color: var(--primary-gold);
}
</style>
