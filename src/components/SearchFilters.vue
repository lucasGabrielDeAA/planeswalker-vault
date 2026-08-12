<script setup lang="ts">
import { computed } from 'vue'
import { useCardsStore } from '@/stores/cards'
import { useI18n } from '@/i18n/useI18n'
import type { SortOrder } from '@/types/scryfall'

const cardsStore = useCardsStore()
const { t } = useI18n()

const colors = [
  { code: 'W', label: 'White', bg: 'var(--mtg-w)', text: '#2c2500' },
  { code: 'U', label: 'Blue', bg: 'var(--mtg-u)', text: '#ffffff' },
  { code: 'B', label: 'Black', bg: 'var(--mtg-b)', text: '#0f172a' },
  { code: 'R', label: 'Red', bg: 'var(--mtg-r)', text: '#ffffff' },
  { code: 'G', label: 'Green', bg: 'var(--mtg-g)', text: '#ffffff' },
]

const cardTypes = computed(() => [
  { value: '', label: t('filters.allTypes') },
  { value: 'creature', label: 'Creature' },
  { value: 'instant', label: 'Instant' },
  { value: 'sorcery', label: 'Sorcery' },
  { value: 'enchantment', label: 'Enchantment' },
  { value: 'artifact', label: 'Artifact' },
  { value: 'planeswalker', label: 'Planeswalker' },
  { value: 'land', label: 'Land' },
])

const rarities = computed(() => [
  { value: '', label: t('filters.allRarities') },
  { value: 'common', label: 'Common' },
  { value: 'uncommon', label: 'Uncommon' },
  { value: 'rare', label: 'Rare' },
  { value: 'mythic', label: 'Mythic' },
])

const formats = computed(() => [
  { value: '', label: t('filters.allFormats') },
  { value: 'commander', label: 'Commander' },
  { value: 'standard', label: 'Standard' },
  { value: 'pioneer', label: 'Pioneer' },
  { value: 'modern', label: 'Modern' },
  { value: 'legacy', label: 'Legacy' },
  { value: 'vintage', label: 'Vintage' },
  { value: 'pauper', label: 'Pauper' },
])

const sortOrders = computed<{ value: SortOrder; label: string }[]>(() => [
  { value: 'edhrec', label: 'EDHREC Rank' },
  { value: 'name', label: 'Name' },
  { value: 'usd', label: 'Price' },
  { value: 'released', label: 'Release Date' },
  { value: 'rarity', label: 'Rarity' },
  { value: 'cmc', label: 'Mana Value (CMC)' },
  { value: 'power', label: 'Power' },
  { value: 'toughness', label: 'Toughness' },
])

function handleApply() {
  cardsStore.executeSearch(1)
}

function handleReset() {
  cardsStore.resetFilters()
}
</script>

<template>
  <aside class="filters-panel glass-panel">
    <div class="panel-header">
      <h3>{{ t('filters.title') }}</h3>
      <button class="reset-btn" @click="handleReset">{{ t('filters.reset') }}</button>
    </div>

    <!-- Color Identity Filter -->
    <div class="filter-group">
      <label class="group-label">{{ t('filters.colors') }}</label>
      <div class="color-picker">
        <button
          v-for="c in colors"
          :key="c.code"
          class="color-btn"
          :class="{ active: cardsStore.selectedColors.includes(c.code) }"
          :style="{ backgroundColor: c.bg, color: c.text }"
          :title="c.label"
          @click="cardsStore.toggleColor(c.code)"
        >
          {{ c.code }}
        </button>
      </div>

      <!-- Color Match Mode -->
      <div v-if="cardsStore.selectedColors.length > 0" class="match-mode-selector">
        <select v-model="cardsStore.colorMatchType" @change="handleApply">
          <option value="at_least">{{ t('filters.colorAtLeast') }} (>=)</option>
          <option value="exact">{{ t('filters.colorExact') }} (=)</option>
          <option value="at_most">{{ t('filters.colorAtMost') }} (<=)</option>
        </select>
      </div>
    </div>

    <!-- Card Type Filter -->
    <div class="filter-group">
      <label class="group-label">{{ t('filters.cardType') }}</label>
      <select v-model="cardsStore.selectedType" class="filter-select" @change="handleApply">
        <option v-for="t in cardTypes" :key="t.value" :value="t.value">
          {{ t.label }}
        </option>
      </select>
    </div>

    <!-- Rarity Filter -->
    <div class="filter-group">
      <label class="group-label">{{ t('filters.rarity') }}</label>
      <select v-model="cardsStore.selectedRarity" class="filter-select" @change="handleApply">
        <option v-for="r in rarities" :key="r.value" :value="r.value">
          {{ r.label }}
        </option>
      </select>
    </div>

    <!-- Format Legality Filter -->
    <div class="filter-group">
      <label class="group-label">{{ t('filters.format') }}</label>
      <select v-model="cardsStore.selectedFormat" class="filter-select" @change="handleApply">
        <option v-for="f in formats" :key="f.value" :value="f.value">
          {{ f.label }}
        </option>
      </select>
    </div>

    <!-- Sort Order & Direction -->
    <div class="filter-group">
      <label class="group-label">{{ t('filters.sortOrder') }}</label>
      <div class="sort-controls">
        <select v-model="cardsStore.sortOrder" class="filter-select" @change="handleApply">
          <option v-for="s in sortOrders" :key="s.value" :value="s.value">
            {{ s.label }}
          </option>
        </select>
        <select v-model="cardsStore.sortDir" class="filter-select dir-select" @change="handleApply">
          <option value="auto">Auto</option>
          <option value="asc">Ascending</option>
          <option value="desc">Descending</option>
        </select>
      </div>
    </div>

    <!-- Live Scryfall Query string view -->
    <div class="query-preview">
      <span class="preview-label">Scryfall Syntax:</span>
      <code class="query-code">{{ cardsStore.fullQueryString }}</code>
    </div>
  </aside>
</template>

<style scoped>
.filters-panel {
  padding: 18px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid var(--border-glass);
  padding-bottom: 10px;
  min-height: 38px;
}

.panel-header h3 {
  font-family: var(--font-serif);
  font-size: 0.92rem;
  color: var(--primary-gold);
  white-space: nowrap;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.reset-btn {
  font-size: 0.78rem;
  color: var(--text-dim);
  transition: color 0.2s ease;
  white-space: nowrap;
  flex-shrink: 0;
}
.reset-btn:hover {
  color: var(--primary-gold);
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.group-label {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.color-picker {
  display: flex;
  gap: 6px;
}

.color-btn {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  font-weight: 800;
  font-size: 0.85rem;
  opacity: 0.4;
  border: 2px solid transparent;
  transition: all 0.2s ease;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.4);
}
.color-btn.active {
  opacity: 1;
  border-color: var(--primary-gold);
  transform: scale(1.1);
  box-shadow: 0 0 12px var(--border-glow);
}

.match-mode-selector select,
.filter-select {
  width: 100%;
  padding: 8px 12px;
  background: var(--bg-surface-elevated);
  color: var(--text-main);
  border: 1px solid var(--border-glass);
  border-radius: var(--radius-sm);
  font-size: 0.85rem;
  outline: none;
  transition: border-color 0.2s ease;
}
.filter-select:focus {
  border-color: var(--primary-gold);
}

.sort-controls {
  display: flex;
  gap: 6px;
}

.dir-select {
  width: 110px;
}

.query-preview {
  margin-top: 8px;
  padding: 10px;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid var(--border-glass);
  border-radius: var(--radius-sm);
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.preview-label {
  font-size: 0.7rem;
  color: var(--text-dim);
}

.query-code {
  font-size: 0.75rem;
  color: var(--primary-gold);
  word-break: break-all;
}
</style>
