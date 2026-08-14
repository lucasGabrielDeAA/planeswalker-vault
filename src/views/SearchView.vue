<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useCardsStore } from '@/stores/cards'
import { useI18n } from '@/i18n/useI18n'
import { useCardSearchQuery } from '@/queries/useScryfallQueries'
import SearchFilters from '@/components/SearchFilters.vue'
import CardCard from '@/components/CardCard.vue'

const cardsStore = useCardsStore()
const { t } = useI18n()

// TanStack Query for searching cards
const searchOptionsRef = computed(() => cardsStore.searchOptions)
const {
  data: searchResult,
  isLoading,
  isFetching,
  isError,
  error,
} = useCardSearchQuery(searchOptionsRef)

const cards = computed(() => searchResult.value?.data || [])

// Preserve last known total cards during page transitions so UI doesn't flicker
const lastKnownTotalCards = ref<number>(0)
watch(
  () => searchResult.value?.total_cards,
  (newTotal) => {
    if (typeof newTotal === 'number') {
      lastKnownTotalCards.value = newTotal
    }
  },
  { immediate: true },
)

// Reset last known total when search query/filters change
watch(
  () => cardsStore.fullQueryString,
  () => {
    lastKnownTotalCards.value = 0
  },
)

const totalCards = computed(() => searchResult.value?.total_cards ?? lastKnownTotalCards.value)
const PAGE_SIZE = 175
const totalPages = computed(() => {
  if (!totalCards.value) return 1
  return Math.max(1, Math.ceil(totalCards.value / PAGE_SIZE))
})
const hasMore = computed(() => searchResult.value?.has_more ?? false)
const errorMessage = computed(() => {
  if (!isError.value) return null
  return error.value?.message || 'Failed to fetch cards. Try refining your query.'
})

// Numbered page pills calculation
const visiblePages = computed<(number | string)[]>(() => {
  const total = totalPages.value
  const current = cardsStore.currentPage

  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1)
  }

  if (current <= 4) {
    return [1, 2, 3, 4, 5, '...', total]
  }

  if (current >= total - 3) {
    return [1, '...', total - 4, total - 3, total - 2, total - 1, total]
  }

  return [1, '...', current - 1, current, current + 1, '...', total]
})

const jumpPageInput = ref<number | ''>('')

function handleJumpPage() {
  if (typeof jumpPageInput.value !== 'number' || isNaN(jumpPageInput.value)) return
  const target = Math.max(1, Math.min(totalPages.value, Math.floor(jumpPageInput.value)))
  goToPage(target)
  jumpPageInput.value = ''
}

function goToPage(page: number) {
  if (page < 1 || page > totalPages.value || isLoading.value) return
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
          <span v-if="!isLoading && totalCards > 0" class="total-badge">
            {{ t('search.resultsCount', { count: totalCards.toLocaleString() }) }}
          </span>
          <span v-else-if="isLoading && totalCards > 0" class="total-badge loading-badge">
            {{ t('search.resultsCount', { count: totalCards.toLocaleString() }) }}
          </span>
        </div>

        <!-- Top Header Quick Navigation Controls -->
        <div v-if="cards.length > 0 || isLoading" class="header-pagination">
          <button
            class="header-nav-btn"
            :disabled="cardsStore.currentPage <= 1 || isLoading"
            :title="t('search.prev')"
            @click="goToPage(cardsStore.currentPage - 1)"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <polyline points="15 18 9 12 15 6"></polyline>
            </svg>
          </button>

          <div class="header-page-info" :class="{ 'is-loading': isLoading }">
            <span class="current-p">{{ cardsStore.currentPage }}</span>
            <span class="sep">/</span>
            <span class="total-p">{{ totalPages.toLocaleString() }}</span>
          </div>

          <button
            class="header-nav-btn"
            :disabled="!hasMore || cardsStore.currentPage >= totalPages || isLoading"
            :title="t('search.next')"
            @click="goToPage(cardsStore.currentPage + 1)"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </button>
        </div>
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

      <!-- Loading Skeletons (Instant feedback on initial load or page change) -->
      <div v-if="isLoading" class="cards-grid">
        <div v-for="i in 16" :key="i" class="card-skeleton glass-panel">
          <div class="skeleton-header">
            <div class="skeleton" style="height: 18px; width: 65%; border-radius: 4px" />
            <div class="skeleton" style="height: 18px; width: 18px; border-radius: 50%" />
          </div>
          <div class="skeleton-image skeleton" />
          <div class="skeleton-footer">
            <div class="skeleton" style="height: 14px; width: 35%; border-radius: 4px" />
            <div class="skeleton" style="height: 14px; width: 28%; border-radius: 4px" />
          </div>
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

      <!-- Full Bottom Smart Pagination Bar -->
      <div
        v-if="cards.length > 0 && !isLoading && totalPages > 1"
        class="pagination-bar glass-panel"
      >
        <div class="pagination-nav">
          <!-- First Page Button -->
          <button
            class="pagination-btn icon-btn"
            :disabled="cardsStore.currentPage <= 1 || isLoading"
            :title="t('search.first')"
            @click="goToPage(1)"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <polyline points="11 17 6 12 11 7"></polyline>
              <polyline points="18 17 13 12 18 7"></polyline>
            </svg>
            <span class="btn-text-desktop">{{ t('search.first') }}</span>
          </button>

          <!-- Prev Page Button -->
          <button
            class="pagination-btn"
            :disabled="cardsStore.currentPage <= 1 || isLoading"
            :title="t('search.prev')"
            @click="goToPage(cardsStore.currentPage - 1)"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <polyline points="15 18 9 12 15 6"></polyline>
            </svg>
            <span class="btn-text-desktop">{{ t('search.prev') }}</span>
          </button>

          <!-- Numbered Page Pills -->
          <div class="page-pills">
            <template v-for="(p, index) in visiblePages" :key="index">
              <span v-if="p === '...'" class="page-ellipsis">…</span>
              <button
                v-else
                class="page-pill"
                :class="{ active: p === cardsStore.currentPage }"
                :disabled="isLoading"
                @click="goToPage(Number(p))"
              >
                {{ p }}
              </button>
            </template>
          </div>

          <!-- Next Page Button -->
          <button
            class="pagination-btn"
            :disabled="!hasMore || cardsStore.currentPage >= totalPages || isLoading"
            :title="t('search.next')"
            @click="goToPage(cardsStore.currentPage + 1)"
          >
            <span class="btn-text-desktop">{{ t('search.next') }}</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </button>

          <!-- Last Page Button -->
          <button
            class="pagination-btn icon-btn"
            :disabled="!hasMore || cardsStore.currentPage >= totalPages || isLoading"
            :title="t('search.last')"
            @click="goToPage(totalPages)"
          >
            <span class="btn-text-desktop">{{ t('search.last') }}</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <polyline points="13 17 18 12 13 7"></polyline>
              <polyline points="6 17 11 12 6 7"></polyline>
            </svg>
          </button>
        </div>

        <!-- Quick Jump Form -->
        <form class="jump-form" @submit.prevent="handleJumpPage">
          <span class="jump-label">{{ t('search.jumpTo') }}</span>
          <input
            v-model.number="jumpPageInput"
            type="number"
            min="1"
            :max="totalPages"
            :placeholder="cardsStore.currentPage.toString()"
            class="jump-input"
            :disabled="isLoading"
          />
          <button type="submit" class="jump-btn" :disabled="!jumpPageInput || isLoading">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <line x1="5" y1="12" x2="19" y2="12"></line>
              <polyline points="12 5 19 12 12 19"></polyline>
            </svg>
          </button>
        </form>
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
  flex-wrap: wrap;
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
  transition: opacity 0.2s ease;
}

.loading-badge {
  opacity: 0.7;
}

/* Top Header Quick Pagination */
.header-pagination {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 8px;
}

.header-nav-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: var(--radius-full);
  color: var(--text-main);
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid transparent;
  transition: all 0.2s ease;
}

.header-nav-btn:hover:not(:disabled) {
  background: rgba(229, 193, 88, 0.2);
  color: var(--primary-gold);
  border-color: var(--border-glow);
  transform: scale(1.05);
}

.header-nav-btn:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}

.header-page-info {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.82rem;
  padding: 0 4px;
  transition: opacity 0.2s ease;
}

.header-page-info.is-loading {
  opacity: 0.6;
}

.current-p {
  font-weight: 700;
  color: var(--primary-gold);
}

.sep {
  color: var(--text-dim);
}

.total-p {
  color: var(--text-muted);
}

.cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
  min-width: 0;
  width: 100%;
}

/* Card Skeleton matching CardCard.vue */
.card-skeleton {
  display: flex;
  flex-direction: column;
  padding: 12px;
  border-radius: var(--radius-md);
  box-sizing: border-box;
  min-width: 0;
  height: 100%;
  border: 1px solid var(--border-glass);
}

.skeleton-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 44px;
  margin-bottom: 10px;
}

.skeleton-image {
  width: 100%;
  aspect-ratio: 488 / 680;
  border-radius: var(--radius-sm);
  margin-bottom: 10px;
}

.skeleton-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 24px;
  margin-top: auto;
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

/* Full Bottom Smart Pagination Bar */
.pagination-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 14px 20px;
  margin-top: 10px;
  flex-wrap: wrap;
}

.pagination-nav {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}

.pagination-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: var(--bg-surface-elevated);
  color: var(--text-main);
  border: 1px solid var(--border-glass);
  font-size: 0.82rem;
  font-weight: 600;
  padding: 6px 12px;
  border-radius: var(--radius-sm);
  transition: all 0.2s ease;
}

.pagination-btn:hover:not(:disabled) {
  background: rgba(229, 193, 88, 0.15);
  border-color: var(--border-glow);
  color: var(--primary-gold);
}

.pagination-btn:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}

.page-pills {
  display: flex;
  align-items: center;
  gap: 4px;
}

.page-pill {
  min-width: 34px;
  height: 34px;
  padding: 0 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-sm);
  background: var(--bg-surface-elevated);
  border: 1px solid var(--border-glass);
  color: var(--text-muted);
  font-size: 0.85rem;
  font-weight: 600;
  transition: all 0.2s ease;
}

.page-pill:hover:not(.active):not(:disabled) {
  background: rgba(255, 255, 255, 0.1);
  color: var(--text-main);
  border-color: rgba(255, 255, 255, 0.2);
}

.page-pill.active {
  background: linear-gradient(135deg, #e5c158 0%, #ca9e28 100%);
  color: #0b0d14;
  border-color: var(--primary-gold);
  font-weight: 800;
  box-shadow: 0 0 12px rgba(229, 193, 88, 0.35);
}

.page-pill:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-ellipsis {
  color: var(--text-dim);
  padding: 0 4px;
  font-weight: 700;
}

/* Jump to page form */
.jump-form {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-left: auto;
}

.jump-label {
  font-size: 0.8rem;
  color: var(--text-muted);
  white-space: nowrap;
}

.jump-input {
  width: 60px;
  height: 32px;
  background: var(--bg-surface-elevated);
  border: 1px solid var(--border-glass);
  border-radius: var(--radius-sm);
  color: var(--text-main);
  font-size: 0.85rem;
  font-weight: 600;
  text-align: center;
  outline: none;
  transition: border-color 0.2s ease;
}

.jump-input:focus {
  border-color: var(--primary-gold);
  box-shadow: 0 0 8px rgba(229, 193, 88, 0.25);
}

.jump-input:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Remove arrows from number input */
.jump-input::-webkit-outer-spin-button,
.jump-input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
.jump-input {
  -moz-appearance: textfield;
  appearance: textfield;
}

.jump-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: var(--bg-surface-elevated);
  border: 1px solid var(--border-glass);
  border-radius: var(--radius-sm);
  color: var(--primary-gold);
  transition: all 0.2s ease;
}

.jump-btn:hover:not(:disabled) {
  background: rgba(229, 193, 88, 0.2);
  border-color: var(--primary-gold);
  transform: translateX(2px);
}

.jump-btn:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}

@media (max-width: 680px) {
  .btn-text-desktop {
    display: none;
  }
  .pagination-bar {
    justify-content: center;
  }
  .jump-form {
    margin-left: 0;
    width: 100%;
    justify-content: center;
  }
}
</style>
