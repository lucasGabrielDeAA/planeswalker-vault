<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useCardsStore } from '@/stores/cards'
import { useBinderStore } from '@/stores/binder'
import { useI18n } from '@/i18n/useI18n'
import { useCardRulingsQuery, useCardPrintsQuery } from '@/queries/useScryfallQueries'
import ManaSymbol from './ManaSymbol.vue'

const cardsStore = useCardsStore()
const binderStore = useBinderStore()
const { t, formatCurrency, usdRateVariationText, locale } = useI18n()

const activeTab = ref<'details' | 'rulings' | 'prints'>('details')
const activeFaceIndex = ref(0)

const card = computed(() => cardsStore.activeCard)
const isSaved = computed(() => (card.value ? binderStore.isSaved(card.value.id) : false))
const binderQuantity = computed(() => (card.value ? binderStore.getItemQuantity(card.value.id) : 0))

// Reactive IDs for TanStack Query
const cardIdRef = computed(() => (cardsStore.isModalOpen && card.value ? card.value.id : undefined))
const oracleIdRef = computed(() => (cardsStore.isModalOpen && card.value ? card.value.oracle_id : undefined))

// TanStack Query hooks for card rulings and prints
const { data: rulingsData, isLoading: isLoadingRulings } = useCardRulingsQuery(cardIdRef)
const { data: printsData, isLoading: isLoadingPrints } = useCardPrintsQuery(oracleIdRef)

const rulings = computed(() => rulingsData.value || [])
const prints = computed(() => printsData.value || [])

// Check double sided faces
const faces = computed(() => {
  if (!card.value) return []
  if (
    card.value.card_faces &&
    card.value.card_faces.length > 0 &&
    card.value.card_faces[0]?.image_uris
  ) {
    return card.value.card_faces
  }
  return []
})

const currentFace = computed(() => {
  if (faces.value.length > 0) {
    return faces.value[activeFaceIndex.value] || null
  }
  return null
})

const displayImage = computed(() => {
  if (currentFace.value?.image_uris) {
    return currentFace.value.image_uris.large || currentFace.value.image_uris.normal || ''
  }
  return card.value?.image_uris?.large || card.value?.image_uris?.normal || ''
})

const displayTitle = computed(() => currentFace.value?.name || card.value?.name || '')
const displayManaCost = computed(() => currentFace.value?.mana_cost || card.value?.mana_cost || '')
const displayTypeLine = computed(() => currentFace.value?.type_line || card.value?.type_line || '')
const displayOracleText = computed(() => currentFace.value?.oracle_text || card.value?.oracle_text || '')
const displayFlavorText = computed(() => currentFace.value?.flavor_text || card.value?.flavor_text || '')
const displayPowerToughness = computed(() => {
  const p = currentFace.value?.power || card.value?.power
  const t = currentFace.value?.toughness || card.value?.toughness
  if (p !== undefined && t !== undefined) return `${p} / ${t}`
  if (currentFace.value?.loyalty || card.value?.loyalty) return `Loyalty: ${currentFace.value?.loyalty || card.value?.loyalty}`
  if (currentFace.value?.defense || card.value?.defense) return `Defense: ${currentFace.value?.defense || card.value?.defense}`
  return null
})

// Reset tab & face index when active card changes
watch(
  () => cardsStore.activeCard,
  () => {
    activeFaceIndex.value = 0
    activeTab.value = 'details'
  }
)

function handleClose() {
  cardsStore.closeCardModal()
}

function toggleBinder() {
  if (card.value) {
    binderStore.toggleSave(card.value)
  }
}

// Key legalities list
const legalitiesList = computed(() => {
  if (!card.value?.legalities) return []
  const map = card.value.legalities
  const formats = [
    { key: 'standard', name: 'Standard' },
    { key: 'pioneer', name: 'Pioneer' },
    { key: 'modern', name: 'Modern' },
    { key: 'legacy', name: 'Legacy' },
    { key: 'vintage', name: 'Vintage' },
    { key: 'commander', name: 'Commander' },
    { key: 'pauper', name: 'Pauper' },
    { key: 'historic', name: 'Historic' },
    { key: 'alchemy', name: 'Alchemy' },
    { key: 'timeless', name: 'Timeless' },
  ]

  return formats.map((f) => {
    const status = (map as any)[f.key] || 'not_legal'
    return {
      name: f.name,
      status: status.replace('_', ' '),
      rawStatus: status,
    }
  })
})
</script>

<template>
  <Teleport to="body">
    <div v-if="cardsStore.isModalOpen && card" class="modal-backdrop" @click.self="handleClose">
      <div class="modal-content glass-panel fade-in">
        <!-- Close Button -->
        <button class="close-btn" @click="handleClose" title="Close modal">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>

        <div class="modal-grid">
          <!-- Left Column: High-Res Card Image & Face Controls -->
          <div class="image-column">
            <div class="modal-image-wrapper">
              <img :src="displayImage" :alt="displayTitle" class="modal-card-img" />
            </div>

            <!-- Face switcher if double sided -->
            <div v-if="faces.length > 1" class="face-switcher">
              <button
                v-for="(face, idx) in faces"
                :key="idx"
                class="face-btn"
                :class="{ active: activeFaceIndex === idx }"
                @click="activeFaceIndex = idx"
              >
                Face {{ idx + 1 }}: {{ face.name }}
              </button>
            </div>

            <!-- Action buttons: Save to Binder -->
            <button class="btn-primary binder-toggle-btn" @click="toggleBinder">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" :fill="isSaved ? '#0b0d14' : 'none'" stroke="currentColor" stroke-width="2">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
              <span>{{ isSaved ? t('card.inBinder', { qty: binderQuantity }) : t('card.addToBinder') }}</span>
            </button>
          </div>

          <!-- Right Column: Card Details, Tabs, Text, Rulings & Prices -->
          <div class="details-column">
            <div class="card-modal-header">
              <div class="header-main">
                <h2 class="card-modal-title">{{ displayTitle }}</h2>
                <ManaSymbol :cost="displayManaCost" />
              </div>
              <p class="type-line">{{ displayTypeLine }}</p>
              <div class="set-rarity-row">
                <span class="set-name-badge">{{ card.set_name }} ({{ card.set.toUpperCase() }}) #{{ card.collector_number }}</span>
                <span class="rarity-badge" :class="`rarity-${card.rarity}`">{{ card.rarity }}</span>
              </div>
            </div>

            <!-- Modal Navigation Tabs -->
            <div class="modal-tabs">
              <button
                class="tab-btn"
                :class="{ active: activeTab === 'details' }"
                @click="activeTab = 'details'"
              >
                {{ t('card.detailsTab') }}
              </button>
              <button
                class="tab-btn"
                :class="{ active: activeTab === 'rulings' }"
                @click="activeTab = 'rulings'"
              >
                {{ t('card.rulingsTab') }} ({{ rulings.length }})
              </button>
              <button
                class="tab-btn"
                :class="{ active: activeTab === 'prints' }"
                @click="activeTab = 'prints'"
              >
                Printings ({{ prints.length }})
              </button>
            </div>

            <!-- Tab 1: Details (Oracle text, P/T, Legalities, Prices) -->
            <div v-if="activeTab === 'details'" class="tab-content">
              <!-- Oracle Text -->
              <div v-if="displayOracleText" class="oracle-box">
                <p class="oracle-text">{{ displayOracleText }}</p>
                <p v-if="displayFlavorText" class="flavor-text"><em>{{ displayFlavorText }}</em></p>
              </div>

              <!-- Power / Toughness / Loyalty -->
              <div v-if="displayPowerToughness" class="pt-box">
                <span class="pt-badge">{{ displayPowerToughness }}</span>
              </div>

              <!-- Artist Info -->
              <p class="artist-info">Illustrated by <strong>{{ currentFace?.artist || card.artist }}</strong></p>

              <!-- Prices & Purchase Links -->
              <div class="prices-section">
                <div class="prices-header-group">
                  <h4>{{ t('card.prices') }}</h4>
                  <span class="usd-rate-tag">{{ usdRateVariationText }}</span>
                </div>
                <div class="prices-grid">
                  <div class="price-card">
                    <span class="price-label">{{ t('card.usdRegular') }}</span>
                    <span class="price-value">{{ formatCurrency(card.prices?.usd) }}</span>
                  </div>
                  <div class="price-card">
                    <span class="price-label">{{ t('card.usdFoil') }}</span>
                    <span class="price-value foil">{{ formatCurrency(card.prices?.usd_foil) }}</span>
                  </div>
                  <div class="price-card">
                    <span class="price-label">{{ t('card.eur') }}</span>
                    <span class="price-value">{{ card.prices?.eur ? `€${card.prices.eur}` : '—' }}</span>
                  </div>
                  <div class="price-card">
                    <span class="price-label">{{ t('card.tix') }}</span>
                    <span class="price-value">{{ card.prices?.tix ? `${card.prices.tix}` : '—' }}</span>
                  </div>
                </div>

                <div v-if="card.purchase_uris" class="purchase-links">
                  <a v-if="card.purchase_uris.tcgplayer" :href="card.purchase_uris.tcgplayer" target="_blank" rel="noopener" class="buy-link">Buy on TCGplayer</a>
                  <a v-if="card.purchase_uris.cardmarket" :href="card.purchase_uris.cardmarket" target="_blank" rel="noopener" class="buy-link">Buy on Cardmarket</a>
                </div>
              </div>

              <!-- Format Legalities Grid -->
              <div class="legalities-section">
                <h4>Format Legalities</h4>
                <div class="legalities-grid">
                  <div v-for="leg in legalitiesList" :key="leg.name" class="leg-item">
                    <span class="leg-name">{{ leg.name }}</span>
                    <span class="pill-badge" :class="`pill-${leg.rawStatus}`">{{ leg.status }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Tab 2: Official Rulings -->
            <div v-else-if="activeTab === 'rulings'" class="tab-content">
              <div v-if="isLoadingRulings" class="rulings-loading">
                <div class="skeleton" style="height: 40px; margin-bottom: 8px;" />
                <div class="skeleton" style="height: 40px;" />
              </div>
              <div v-else-if="rulings.length === 0" class="empty-tab">
                No rulings found for this card.
              </div>
              <div v-else class="rulings-list">
                <div v-for="(rule, idx) in rulings" :key="idx" class="ruling-item">
                  <span class="ruling-date">{{ rule.published_at }}</span>
                  <p class="ruling-comment">{{ rule.comment }}</p>
                </div>
              </div>
            </div>

            <!-- Tab 3: Printings / Variations -->
            <div v-else-if="activeTab === 'prints'" class="tab-content">
              <div v-if="isLoadingPrints" class="prints-loading">
                <div class="skeleton" style="height: 50px;" />
              </div>
              <div v-else class="prints-grid">
                <div
                  v-for="p in prints"
                  :key="p.id"
                  class="print-item"
                  :class="{ current: p.id === card.id }"
                  @click="cardsStore.openCardModal(p)"
                >
                  <span class="print-set">{{ p.set_name }} ({{ p.set.toUpperCase() }})</span>
                  <span class="print-rarity" :class="`rarity-${p.rarity}`">#{{ p.collector_number }} • {{ p.rarity }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(5, 7, 12, 0.85);
  backdrop-filter: blur(12px);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.modal-content {
  position: relative;
  width: 100%;
  max-width: 960px;
  max-height: 90vh;
  overflow-y: auto;
  padding: 24px;
  background: var(--bg-surface);
  border: 1px solid var(--border-glass);
  box-shadow: var(--shadow-md), 0 0 40px rgba(0, 0, 0, 0.9);
}

.close-btn {
  position: absolute;
  top: 16px;
  right: 16px;
  color: var(--text-muted);
  background: var(--bg-surface-elevated);
  border: 1px solid var(--border-glass);
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  z-index: 10;
}
.close-btn:hover {
  color: var(--text-main);
  background: var(--primary-gold);
  color: #0b0d14;
}

.modal-grid {
  display: grid;
  grid-template-columns: 320px 1fr;
  gap: 24px;
}

@media (max-width: 768px) {
  .modal-grid {
    grid-template-columns: 1fr;
  }
}

.image-column {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.modal-image-wrapper {
  width: 100%;
  border-radius: var(--radius-md);
  overflow: hidden;
  box-shadow: var(--shadow-md);
}

.modal-card-img {
  width: 100%;
  height: auto;
  display: block;
}

.face-switcher {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.face-btn {
  padding: 8px 12px;
  background: var(--bg-surface-elevated);
  color: var(--text-muted);
  border: 1px solid var(--border-glass);
  border-radius: var(--radius-sm);
  font-size: 0.85rem;
  text-align: left;
  transition: all 0.2s ease;
}
.face-btn.active,
.face-btn:hover {
  color: var(--primary-gold);
  border-color: var(--primary-gold);
  background: rgba(229, 193, 88, 0.1);
}

.binder-toggle-btn {
  width: 100%;
}

.details-column {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.card-modal-title {
  font-family: var(--font-serif);
  font-size: 1.5rem;
  color: var(--text-main);
}

.header-main {
  display: flex;
  align-items: center;
  gap: 12px;
}

.type-line {
  font-size: 0.95rem;
  color: var(--text-muted);
  font-weight: 500;
  margin-top: 4px;
}

.set-rarity-row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 6px;
  font-size: 0.8rem;
}

.set-name-badge {
  color: var(--text-dim);
}

.rarity-badge {
  text-transform: capitalize;
  font-weight: 700;
}

.modal-tabs {
  display: flex;
  gap: 8px;
  border-bottom: 1px solid var(--border-glass);
  padding-bottom: 8px;
}

.tab-btn {
  padding: 6px 14px;
  border-radius: var(--radius-sm);
  color: var(--text-muted);
  font-weight: 600;
  font-size: 0.85rem;
  transition: all 0.2s ease;
}
.tab-btn.active {
  background: var(--bg-surface-elevated);
  color: var(--primary-gold);
  border: 1px solid var(--border-glass);
}

.tab-content {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.oracle-box {
  background: var(--bg-surface-elevated);
  border: 1px solid var(--border-glass);
  padding: 14px;
  border-radius: var(--radius-sm);
  white-space: pre-line;
  line-height: 1.6;
}

.flavor-text {
  margin-top: 10px;
  color: var(--text-muted);
  border-top: 1px dashed var(--border-glass);
  padding-top: 8px;
  font-size: 0.9rem;
}

.pt-box {
  display: flex;
  justify-content: flex-end;
}

.pt-badge {
  background: var(--bg-surface-elevated);
  border: 1px solid var(--border-glow);
  color: var(--primary-gold);
  padding: 6px 16px;
  border-radius: var(--radius-sm);
  font-weight: 800;
  font-size: 1.1rem;
}

.artist-info {
  font-size: 0.85rem;
  color: var(--text-dim);
}

.prices-section h4,
.legalities-section h4 {
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: var(--text-muted);
  margin-bottom: 0;
}

.prices-header-group {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 8px;
  flex-wrap: wrap;
}

.usd-rate-tag {
  font-size: 0.75rem;
  color: var(--primary-gold);
  background: rgba(229, 193, 88, 0.1);
  border: 1px solid rgba(229, 193, 88, 0.25);
  padding: 2px 8px;
  border-radius: var(--radius-sm);
  font-weight: 600;
}

.prices-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
}

.price-card {
  background: var(--bg-surface-elevated);
  padding: 8px 12px;
  border-radius: var(--radius-sm);
  display: flex;
  flex-direction: column;
}

.price-label {
  font-size: 0.7rem;
  color: var(--text-dim);
}

.price-value {
  font-size: 0.95rem;
  font-weight: 700;
  color: #4ade80;
}
.price-value.foil {
  color: #c084fc;
}

.purchase-links {
  display: flex;
  gap: 10px;
  margin-top: 10px;
}

.buy-link {
  font-size: 0.8rem;
  padding: 6px 12px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid var(--border-glass);
  border-radius: var(--radius-sm);
  color: var(--text-main);
  transition: all 0.2s ease;
}
.buy-link:hover {
  background: var(--bg-surface-elevated);
  border-color: var(--primary-gold);
  color: var(--primary-gold);
}

.legalities-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
}

.leg-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: var(--bg-surface-elevated);
  padding: 6px 10px;
  border-radius: var(--radius-sm);
}

.leg-name {
  font-size: 0.85rem;
  font-weight: 500;
}

.rulings-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  max-height: 350px;
  overflow-y: auto;
}

.ruling-item {
  background: var(--bg-surface-elevated);
  padding: 10px 14px;
  border-radius: var(--radius-sm);
  border-left: 3px solid var(--primary-gold);
}

.ruling-date {
  font-size: 0.75rem;
  color: var(--text-dim);
}

.ruling-comment {
  font-size: 0.85rem;
  margin-top: 2px;
  color: var(--text-main);
}

.empty-tab {
  padding: 20px;
  text-align: center;
  color: var(--text-muted);
}

.prints-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 8px;
  max-height: 350px;
  overflow-y: auto;
}

.print-item {
  background: var(--bg-surface-elevated);
  border: 1px solid var(--border-glass);
  padding: 10px;
  border-radius: var(--radius-sm);
  cursor: pointer;
  display: flex;
  flex-direction: column;
  transition: all 0.2s ease;
}
.print-item:hover,
.print-item.current {
  border-color: var(--primary-gold);
  background: rgba(229, 193, 88, 0.08);
}

.print-set {
  font-weight: 600;
  font-size: 0.85rem;
}

.print-rarity {
  font-size: 0.75rem;
  margin-top: 2px;
}
</style>
