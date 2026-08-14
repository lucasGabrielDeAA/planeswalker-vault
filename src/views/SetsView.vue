<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useCardsStore } from '@/stores/cards'
import { useI18n } from '@/i18n/useI18n'
import { useSetsQuery } from '@/queries/useScryfallQueries'
import type { ScryfallSet } from '@/types/scryfall'

const router = useRouter()
const cardsStore = useCardsStore()
const { t, formatDate } = useI18n()

const searchFilter = ref('')
const selectedSetType = ref('')

// TanStack Vue Query for sets
const { data: setsData, isLoading } = useSetsQuery()

const sets = computed(() => setsData.value || [])

const setTypes = computed(() => [
  { value: '', label: t('sets.allTypes') },
  { value: 'expansion', label: t('sets.typeExpansion') },
  { value: 'core', label: t('sets.typeCore') },
  { value: 'commander', label: t('sets.typeCommander') },
  { value: 'masters', label: t('sets.typeMasters') },
  { value: 'box', label: t('sets.typeBox') },
  { value: 'draft_innovation', label: t('sets.typeDraftInnovation') },
  { value: 'promo', label: t('sets.typePromo') },
])

const filteredSets = computed(() => {
  return sets.value.filter((s) => {
    // Type match
    if (selectedSetType.value && s.set_type !== selectedSetType.value) {
      return false
    }
    // Search match (code or name)
    if (searchFilter.value.trim()) {
      const q = searchFilter.value.toLowerCase().trim()
      return s.name.toLowerCase().includes(q) || s.code.toLowerCase().includes(q)
    }
    return true
  })
})

function selectSet(set: ScryfallSet) {
  cardsStore.searchQuery = `e:${set.code}`
  cardsStore.executeSearch(1)
  router.push({ name: 'search' })
}
</script>

<template>
  <div class="sets-view-container fade-in">
    <div class="sets-header glass-panel">
      <div>
        <h1 class="gold-text">{{ t('sets.title') }}</h1>
        <p class="subtitle">{{ t('sets.subtitle') }}</p>
      </div>

      <div class="sets-controls">
        <input
          v-model="searchFilter"
          type="text"
          :placeholder="t('sets.searchPlaceholder')"
          class="set-search-input"
        />
        <select v-model="selectedSetType" class="set-type-select">
          <option v-for="typeOption in setTypes" :key="typeOption.value" :value="typeOption.value">
            {{ typeOption.label }}
          </option>
        </select>
      </div>
    </div>

    <!-- Loading Skeleton -->
    <div v-if="isLoading" class="sets-grid">
      <div v-for="i in 12" :key="i" class="set-card-skeleton glass-panel">
        <div class="skeleton" style="height: 24px; width: 40px; margin-bottom: 8px" />
        <div class="skeleton" style="height: 20px; width: 80%; margin-bottom: 6px" />
        <div class="skeleton" style="height: 16px; width: 50%" />
      </div>
    </div>

    <!-- Sets Grid -->
    <div v-else-if="filteredSets.length > 0" class="sets-grid">
      <div
        v-for="set in filteredSets"
        :key="set.id"
        class="set-card glass-panel"
        @click="selectSet(set)"
      >
        <div class="set-card-header">
          <img :src="set.icon_svg_uri" :alt="set.name" class="set-icon" loading="lazy" />
          <span class="set-code-badge">{{ set.code.toUpperCase() }}</span>
        </div>

        <h3 class="set-name" :title="set.name">{{ set.name }}</h3>

        <div class="set-meta">
          <span class="set-type-badge">{{ set.set_type.replace('_', ' ') }}</span>
          <span class="card-count">{{ t('sets.total', { total: set.card_count }) }}</span>
        </div>

        <div v-if="set.released_at" class="release-date">
          {{ t('sets.releaseDate') }}: {{ formatDate(set.released_at) }}
        </div>
      </div>
    </div>

    <div v-else class="empty-sets glass-panel">
      <p>{{ t('sets.noSetsFound') }}</p>
    </div>
  </div>
</template>

<style scoped>
.sets-view-container {
  max-width: 1280px;
  width: 100%;
  margin: 0 auto;
  padding: 0 12px 40px 12px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.sets-header {
  padding: 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  flex-wrap: wrap;
}

.subtitle {
  color: var(--text-muted);
  font-size: 0.9rem;
  margin-top: 4px;
}

.sets-controls {
  display: flex;
  gap: 12px;
}

.set-search-input,
.set-type-select {
  padding: 10px 14px;
  background: var(--bg-surface-elevated);
  border: 1px solid var(--border-glass);
  border-radius: var(--radius-sm);
  color: var(--text-main);
  font-size: 0.85rem;
  outline: none;
}

.set-search-input {
  width: 260px;
}

.sets-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 16px;
}

.set-card {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  cursor: pointer;
  transition: all 0.2s ease;
}
.set-card:hover {
  transform: translateY(-4px);
  border-color: var(--border-glow);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.6);
}

.set-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.set-icon {
  width: 24px;
  height: 24px;
  filter: invert(1);
}

.set-code-badge {
  background: var(--bg-surface-elevated);
  padding: 2px 6px;
  border-radius: 4px;
  font-family: monospace;
  font-weight: 700;
  font-size: 0.75rem;
  color: var(--primary-gold);
}

.set-name {
  font-size: 1rem;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.set-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 0.8rem;
  color: var(--text-muted);
}

.set-type-badge {
  text-transform: capitalize;
}

.release-date {
  font-size: 0.75rem;
  color: var(--text-dim);
}

.empty-sets {
  padding: 40px;
  text-align: center;
  color: var(--text-muted);
}
</style>
