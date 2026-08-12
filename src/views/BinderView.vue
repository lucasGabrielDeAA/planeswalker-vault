<script setup lang="ts">
import { ref } from 'vue'
import { useBinderStore } from '@/stores/binder'
import { useI18n } from '@/i18n/useI18n'
import CardCard from '@/components/CardCard.vue'

const binderStore = useBinderStore()
const { t, formatCurrency, usdRateVariationText, locale } = useI18n()

const showExportModal = ref(false)
const exportText = ref('')

function handleExport() {
  exportText.value = binderStore.items
    .map((e) => `${e.quantity} ${e.card.name}`)
    .join('\n')
  showExportModal.value = true
}

function copyExportText() {
  navigator.clipboard.writeText(exportText.value)
  alert(t('binder.copiedAlert'))
}
</script>

<template>
  <div class="binder-view-container fade-in">
    <!-- Header Metrics Banner -->
    <div class="binder-header glass-panel">
      <div class="header-info">
        <h1 class="gold-text">{{ t('binder.title') }}</h1>
        <p class="subtitle">{{ t('binder.subtitle') }}</p>
      </div>

      <div class="header-metrics">
        <div class="metric-card">
          <span class="metric-label">{{ t('binder.totalCards') }}</span>
          <span class="metric-value">{{ binderStore.totalCount }}</span>
        </div>
        <div class="metric-card">
          <span class="metric-label">{{ t('binder.estValue') }}</span>
          <span class="metric-value usd">{{ formatCurrency(binderStore.totalEstimatedUsd) }}</span>
          <span class="usd-rate-subtext">{{ usdRateVariationText }}</span>
        </div>
        <div class="header-actions">
          <button class="btn-primary" :disabled="binderStore.items.length === 0" @click="handleExport">
            {{ t('binder.exportList') }}
          </button>
          <button class="btn-secondary" :disabled="binderStore.items.length === 0" @click="binderStore.clearBinder">
            {{ t('binder.clear') }}
          </button>
        </div>
      </div>
    </div>

    <!-- Analytics Dashboard (Mana Curve & Color Breakdown) -->
    <div v-if="binderStore.items.length > 0" class="analytics-row">
      <!-- Mana Curve Bar Chart -->
      <div class="mana-curve-card glass-panel">
        <h3>{{ t('binder.manaCurve') }}</h3>
        <div class="curve-chart">
          <div v-for="(val, cmc) in binderStore.manaCurve" :key="cmc" class="curve-bar-wrapper">
            <span class="bar-count">{{ val }}</span>
            <div
              class="curve-bar"
              :style="{ height: `${Math.min(val * 24, 120)}px` }"
            />
            <span class="bar-label">{{ cmc }}</span>
          </div>
        </div>
      </div>

      <!-- Color Breakdown -->
      <div class="color-breakdown-card glass-panel">
        <h3>{{ t('binder.colorBreakdown') }}</h3>
        <div class="color-grid">
          <div v-for="(count, color) in binderStore.colorBreakdown" :key="color" class="color-stat">
            <span class="color-tag" :class="`color-${color.toLowerCase()}`">{{ color }}</span>
            <span class="color-count">{{ count }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Binder Cards List -->
    <div v-if="binderStore.items.length > 0" class="binder-cards-grid">
      <div v-for="entry in binderStore.items" :key="entry.card.id" class="binder-card-wrapper">
        <CardCard :card="entry.card" />

        <!-- Quantity Controls Overlay -->
        <div class="quantity-controls glass-panel">
          <button class="qty-btn" @click="binderStore.updateQuantity(entry.card.id, entry.quantity - 1)">-</button>
          <span class="qty-val">{{ t('binder.qty', { qty: entry.quantity }) }}</span>
          <button class="qty-btn" @click="binderStore.updateQuantity(entry.card.id, entry.quantity + 1)">+</button>
          <button class="remove-btn" title="Remove" @click="binderStore.removeCard(entry.card.id)">✕</button>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="empty-binder glass-panel">
      <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
      <h2>{{ t('binder.emptyTitle') }}</h2>
      <p>{{ t('binder.emptyText') }}</p>
    </div>

    <!-- Export Deck Modal -->
    <Teleport to="body">
      <div v-if="showExportModal" class="export-backdrop" @click.self="showExportModal = false">
        <div class="export-modal glass-panel">
          <h3>{{ t('binder.exportTitle') }}</h3>
          <textarea v-model="exportText" class="export-textarea" rows="12" readonly />
          <div class="modal-actions">
            <button class="btn-primary" @click="copyExportText">{{ t('binder.copyClipboard') }}</button>
            <button class="btn-secondary" @click="showExportModal = false">{{ t('binder.close') }}</button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
.binder-view-container {
  max-width: 1280px;
  margin: 0 auto;
  padding: 0 12px 40px 12px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.binder-header {
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

.header-metrics {
  display: flex;
  align-items: center;
  gap: 20px;
}

.metric-card {
  display: flex;
  flex-direction: column;
}

.metric-label {
  font-size: 0.75rem;
  color: var(--text-dim);
}

.metric-value {
  font-size: 1.2rem;
  font-weight: 800;
  color: var(--text-main);
}
.metric-value.usd {
  color: #4ade80;
}

.usd-rate-subtext {
  font-size: 0.7rem;
  color: var(--primary-gold);
  margin-top: 2px;
}

.header-actions {
  display: flex;
  gap: 10px;
}

.analytics-row {
  display: grid;
  grid-template-columns: 1fr 340px;
  gap: 20px;
}

@media (max-width: 800px) {
  .analytics-row {
    grid-template-columns: 1fr;
  }
}

.mana-curve-card,
.color-breakdown-card {
  padding: 18px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.mana-curve-card h3,
.color-breakdown-card h3 {
  font-size: 0.95rem;
  color: var(--text-muted);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.curve-chart {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  height: 160px;
  padding-top: 20px;
  border-bottom: 1px solid var(--border-glass);
}

.curve-bar-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  flex: 1;
}

.bar-count {
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--primary-gold);
}

.curve-bar {
  width: 20px;
  min-height: 4px;
  background: linear-gradient(180deg, var(--primary-gold) 0%, #ca9e28 100%);
  border-radius: 4px 4px 0 0;
  transition: height 0.3s ease;
}

.bar-label {
  font-size: 0.8rem;
  color: var(--text-dim);
}

.color-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px;
}

.color-stat {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: var(--bg-surface-elevated);
  padding: 8px 12px;
  border-radius: var(--radius-sm);
}

.color-tag {
  font-size: 0.85rem;
  font-weight: 600;
}

.color-count {
  font-weight: 800;
  color: var(--primary-gold);
}

.binder-cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
}

.binder-card-wrapper {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.quantity-controls {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 6px 12px;
  font-size: 0.85rem;
}

.qty-btn {
  width: 26px;
  height: 26px;
  background: var(--bg-surface-elevated);
  border: 1px solid var(--border-glass);
  color: var(--text-main);
  border-radius: 4px;
  font-weight: 700;
}
.qty-btn:hover {
  background: var(--primary-gold);
  color: #0b0d14;
}

.qty-val {
  font-weight: 700;
}

.remove-btn {
  color: #f87171;
  font-weight: 800;
}

.empty-binder {
  padding: 60px 20px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  color: var(--text-muted);
}

.export-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.8);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.export-modal {
  width: 100%;
  max-width: 500px;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.export-textarea {
  width: 100%;
  padding: 12px;
  background: var(--bg-surface-elevated);
  border: 1px solid var(--border-glass);
  border-radius: var(--radius-sm);
  color: var(--primary-gold);
  font-family: monospace;
  outline: none;
  resize: vertical;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
</style>
