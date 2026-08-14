<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from '@/i18n/useI18n'
import { useRandomCardQuery } from '@/queries/useScryfallQueries'
import CardCard from '@/components/CardCard.vue'

const filterQuery = ref('')
const { t } = useI18n()

// TanStack Vue Query for drawing random cards
const { data: card, isLoading, isFetching, refetch } = useRandomCardQuery(filterQuery)

function drawNextCard() {
  refetch()
}
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
          <option value="">Any Card</option>
          <option value="is:commander">Commander Legal Only</option>
          <option value="r:mythic">Mythic Rares Only</option>
          <option value="c:red">Red Spells Only</option>
          <option value="c:blue">Blue Spells Only</option>
          <option value="t:creature">Creatures Only</option>
          <option value="t:planeswalker">Planeswalkers Only</option>
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
        <div class="skeleton" style="width: 280px; aspect-ratio: 488/680; border-radius: 14px" />
      </div>
      <div v-else-if="card" class="drawn-card-wrapper fade-in">
        <CardCard :card="card" style="width: 280px" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.random-view-container {
  max-width: 580px;
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
  flex-direction: column;
  flex-wrap: wrap;
}

.subtitle {
  color: var(--text-muted);
  font-size: 0.9rem;
}

.draw-controls {
  display: flex;
  gap: 12px;
  margin: 12px auto;
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
  align-items: center;
  min-height: 400px;
}

.drawing-skeleton {
  padding: 16px;
}

@media (max-width: 600px) {
  .draw-controls {
    flex-direction: column;
    width: 100%;
  }
  .filter-select,
  .btn-primary {
    width: 100%;
  }
}
</style>
