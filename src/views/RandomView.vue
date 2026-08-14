<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from '@/i18n/useI18n'
import { useRandomCardQuery } from '@/queries/useScryfallQueries'
import CardDetails from '@/components/CardDetails.vue'

const filterQuery = ref('')
const { t } = useI18n()

// TanStack Vue Query for drawing random cards
const { data: card, isLoading, isFetching, refetch } = useRandomCardQuery(filterQuery)

function drawNextCard() {
  refetch()
}

const filtersOptions = computed(() => [
  { value: '', label: t('random.filterAny') },
  { value: 'is:commander', label: t('random.filterCommander') },
  { value: 'r:mythic', label: t('random.filterMythic') },
  { value: 'c:red', label: t('random.filterRed') },
  { value: 'c:blue', label: t('random.filterBlue') },
  { value: 't:creature', label: t('random.filterCreature') },
  { value: 't:planeswalker', label: t('random.filterPlaneswalker') },
])
</script>

<template>
  <div class="random-view-container fade-in">
    <div class="random-header glass-panel">
      <div>
        <h1 class="gold-text">{{ t('random.title') }}</h1>
        <p class="subtitle">{{ t('random.subtitle') }}</p>
      </div>

      <div class="draw-controls">
        <select v-model="filterQuery" class="filter-select" @change="drawNextCard">
          <option v-for="filter in filtersOptions" :key="filter.value" :value="filter.value">
            {{ filter.label }}
          </option>
        </select>

        <button class="btn-primary" :disabled="isLoading || isFetching" @click="drawNextCard">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67" />
          </svg>
          <span>{{ isLoading || isFetching ? t('random.loading') : t('random.button') }}</span>
        </button>
      </div>
    </div>

    <!-- Random Card Stage Display -->
    <div class="card-stage">
      <div v-if="isLoading || isFetching" class="drawing-skeleton glass-panel">
        <div class="skeleton-grid">
          <div class="skeleton-image-col">
            <div
              class="skeleton"
              style="width: 100%; aspect-ratio: 488/680; border-radius: 14px; max-width: 320px"
            />
            <div
              class="skeleton"
              style="
                width: 100%;
                height: 42px;
                border-radius: 8px;
                margin-top: 12px;
                max-width: 320px;
              "
            />
          </div>
          <div class="skeleton-details-col">
            <div class="skeleton" style="height: 36px; width: 60%; border-radius: 6px" />
            <div class="skeleton" style="height: 20px; width: 40%; border-radius: 4px" />
            <div class="skeleton" style="height: 36px; width: 100%; border-radius: 6px" />
            <div class="skeleton" style="height: 120px; width: 100%; border-radius: 8px" />
            <div class="skeleton" style="height: 90px; width: 100%; border-radius: 8px" />
          </div>
        </div>
      </div>
      <div v-else-if="card" class="drawn-card-wrapper glass-panel fade-in">
        <CardDetails :card="card" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.random-view-container {
  max-width: 1280px;
  width: 100%;
  margin: 0 auto;
  padding: 0 12px 40px 12px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.random-header {
  padding: 24px;
  display: flex;
  flex-direction: row;
  justify-content: space-between;
}

.subtitle {
  color: var(--text-muted);
  font-size: 0.9rem;
}

.draw-controls {
  display: flex;
  align-items: center;
  gap: 20px;
}

.filter-select {
  padding: 10px 14px;
  background: var(--bg-surface-elevated);
  border: 1px solid var(--border-glass);
  border-radius: var(--radius-sm);
  color: var(--text-main);
  font-size: 0.85rem;
  outline: none;
}

.card-stage {
  display: flex;
  justify-content: center;
  align-items: flex-start;
  min-height: 400px;
  width: 100%;
}

.drawn-card-wrapper {
  width: 100%;
  max-width: 960px;
  padding: 24px;
  box-sizing: border-box;
}

.drawing-skeleton {
  width: 100%;
  max-width: 960px;
  padding: 24px;
  box-sizing: border-box;
}

.skeleton-grid {
  display: grid;
  grid-template-columns: 320px 1fr;
  gap: 24px;
}

.skeleton-image-col {
  display: flex;
  flex-direction: column;
}

.skeleton-details-col {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

@media (max-width: 768px) {
  .skeleton-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 600px) {
  .draw-controls {
    flex-direction: column;
    width: 100%;
  }
  .filter-select {
    width: 100%;
  }
}
</style>
