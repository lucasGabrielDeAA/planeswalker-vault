<script setup lang="ts">
import { computed } from 'vue'
import { useCardsStore } from '@/stores/cards'
import { useI18n } from '@/i18n/useI18n'
import type { SortOrder } from '@/types/scryfall'

const cardsStore = useCardsStore()
const { t } = useI18n()

const colors = computed(() => [
  { code: 'W', label: t('filters.white'), bg: 'var(--mtg-w)', text: '#2c2500' },
  { code: 'U', label: t('filters.blue'), bg: 'var(--mtg-u)', text: '#ffffff' },
  { code: 'B', label: t('filters.black'), bg: 'var(--mtg-b)', text: '#0f172a' },
  { code: 'R', label: t('filters.red'), bg: 'var(--mtg-r)', text: '#ffffff' },
  { code: 'G', label: t('filters.green'), bg: 'var(--mtg-g)', text: '#ffffff' },
])

const cardTypes = computed(() => [
  { value: '', label: t('filters.allTypes') },
  { value: 'creature', label: t('filters.creature') },
  { value: 'instant', label: t('filters.instant') },
  { value: 'sorcery', label: t('filters.sorcery') },
  { value: 'enchantment', label: t('filters.enchantment') },
  { value: 'artifact', label: t('filters.artifact') },
  { value: 'planeswalker', label: t('filters.planeswalker') },
  { value: 'land', label: t('filters.land') },
])

const rarities = computed(() => [
  { value: '', label: t('filters.allRarities') },
  { value: 'common', label: t('filters.common') },
  { value: 'uncommon', label: t('filters.uncommon') },
  { value: 'rare', label: t('filters.rare') },
  { value: 'mythic', label: t('filters.mythic') },
])

const formats = computed(() => [
  { value: '', label: t('filters.allFormats') },
  { value: 'commander', label: t('filters.commander') },
  { value: 'standard', label: t('filters.standard') },
  { value: 'pioneer', label: t('filters.pioneer') },
  { value: 'modern', label: t('filters.modern') },
  { value: 'legacy', label: t('filters.legacy') },
  { value: 'vintage', label: t('filters.vintage') },
  { value: 'pauper', label: t('filters.pauper') },
])

const sortOrders = computed<{ value: SortOrder; label: string }[]>(() => [
  { value: 'edhrec', label: t('filters.sortEdhrec') },
  { value: 'name', label: t('filters.sortName') },
  { value: 'usd', label: t('filters.sortPrice') },
  { value: 'released', label: t('filters.sortReleased') },
  { value: 'rarity', label: t('filters.sortRarity') },
  { value: 'cmc', label: t('filters.sortCmc') },
  { value: 'power', label: t('filters.sortPower') },
  { value: 'toughness', label: t('filters.sortToughness') },
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
          <option value="at_least">{{ t('filters.colorAtLeast') }} (&gt;=)</option>
          <option value="exact">{{ t('filters.colorExact') }} (=)</option>
          <option value="at_most">{{ t('filters.colorAtMost') }} (&lt;=)</option>
        </select>
      </div>
    </div>

    <!-- Card Type Filter -->
    <div class="filter-group">
      <label class="group-label">{{ t('filters.cardType') }}</label>
      <select v-model="cardsStore.selectedType" class="filter-select" @change="handleApply">
        <option v-for="typeItem in cardTypes" :key="typeItem.value" :value="typeItem.value">
          {{ typeItem.label }}
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
          <option value="auto">{{ t('filters.dirAuto') }}</option>
          <option value="asc">{{ t('filters.dirAsc') }}</option>
          <option value="desc">{{ t('filters.dirDesc') }}</option>
        </select>
      </div>
    </div>

    <!-- Live Scryfall Query string view -->
    <div class="query-preview">
      <span class="preview-label">{{ t('filters.syntax') }}</span>
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
  width: 100%;
  box-sizing: border-box;
  min-width: 0;
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
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: var(--text-muted);
}

.color-picker {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.color-btn {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  font-weight: 800;
  font-size: 0.85rem;
  border: 2px solid transparent;
  display: flex;
  align-items: center;
  justify-content: center;
  transition:
    transform 0.15s ease,
    border-color 0.15s ease,
    box-shadow 0.15s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.4);
}
.color-btn:hover {
  transform: scale(1.1);
}
.color-btn.active {
  border-color: #ffffff;
  transform: scale(1.15);
  box-shadow: 0 0 10px rgba(229, 193, 88, 0.6);
}

.match-mode-selector {
  margin-top: 6px;
}
.match-mode-selector select {
  width: 100%;
  padding: 6px 10px;
  background: var(--bg-surface-elevated);
  border: 1px solid var(--border-glass);
  border-radius: var(--radius-sm);
  color: var(--text-muted);
  font-size: 0.78rem;
  outline: none;
}

.filter-select {
  width: 100%;
  padding: 8px 12px;
  background: var(--bg-surface-elevated);
  border: 1px solid var(--border-glass);
  border-radius: var(--radius-sm);
  color: var(--text-main);
  font-size: 0.85rem;
  outline: none;
  transition: border-color 0.2s ease;
}
.filter-select:focus {
  border-color: var(--primary-gold);
}

.sort-controls {
  display: flex;
  gap: 8px;
}
.dir-select {
  width: 110px;
  flex-shrink: 0;
}

.query-preview {
  margin-top: 8px;
  padding: 10px;
  background: rgba(0, 0, 0, 0.3);
  border-radius: var(--radius-sm);
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.preview-label {
  font-size: 0.7rem;
  color: var(--text-dim);
  text-transform: uppercase;
}
.query-code {
  font-family: monospace;
  font-size: 0.75rem;
  color: var(--primary-gold);
  word-break: break-all;
}
</style>
