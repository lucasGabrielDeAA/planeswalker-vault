<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useCardsStore } from '@/stores/cards'
import { useBinderStore } from '@/stores/binder'
import { useI18n } from '@/i18n/useI18n'
import { useCardRulingsQuery, useCardPrintsQuery } from '@/queries/useScryfallQueries'
import type { ScryfallCard, ScryfallLegalities } from '@/types/scryfall'
import ManaSymbol from './ManaSymbol.vue'

const props = defineProps<{
  card: ScryfallCard
}>()

const cardsStore = useCardsStore()
const binderStore = useBinderStore()
const { t, locale, formatCurrency, formatDate, usdRateVariationText } = useI18n()

const activeTab = ref<'details' | 'rulings' | 'prints'>('details')
const activeFaceIndex = ref(0)

const isSaved = computed(() => (props.card ? binderStore.isSaved(props.card.id) : false))
const binderQuantity = computed(() =>
  props.card ? binderStore.getItemQuantity(props.card.id) : 0,
)

// Reactive IDs for TanStack Query
const cardIdRef = computed(() => props.card?.id)
const oracleIdRef = computed(() => props.card?.oracle_id)

// TanStack Query hooks for card rulings and prints
const { data: rulingsData, isLoading: isLoadingRulings } = useCardRulingsQuery(cardIdRef)
const { data: printsData, isLoading: isLoadingPrints } = useCardPrintsQuery(oracleIdRef)

const rulings = computed(() => rulingsData.value || [])
const prints = computed(() => printsData.value || [])

// Check double sided faces
const faces = computed(() => {
  if (!props.card) return []
  if (
    props.card.card_faces &&
    props.card.card_faces.length > 0 &&
    props.card.card_faces[0]?.image_uris
  ) {
    return props.card.card_faces
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
  return props.card?.image_uris?.large || props.card?.image_uris?.normal || ''
})

const displayTitle = computed(() => currentFace.value?.name || props.card?.name || '')
const displayManaCost = computed(
  () => currentFace.value?.mana_cost || props.card?.mana_cost || '',
)
const displayTypeLine = computed(
  () => currentFace.value?.type_line || props.card?.type_line || '',
)
const displayOracleText = computed(
  () => currentFace.value?.oracle_text || props.card?.oracle_text || '',
)
const displayFlavorText = computed(
  () => currentFace.value?.flavor_text || props.card?.flavor_text || '',
)
const displayPowerToughness = computed(() => {
  const power = currentFace.value?.power || props.card?.power
  const toughness = currentFace.value?.toughness || props.card?.toughness
  if (power !== undefined && toughness !== undefined) return `${power} / ${toughness}`
  const loyaltyVal = currentFace.value?.loyalty || props.card?.loyalty
  if (loyaltyVal) return t('card.loyalty', { val: loyaltyVal })
  const defenseVal = currentFace.value?.defense || props.card?.defense
  if (defenseVal) return t('card.defense', { val: defenseVal })
  return null
})

// Reset tab & face index when active card changes
watch(
  () => props.card?.id,
  () => {
    activeFaceIndex.value = 0
    activeTab.value = 'details'
  },
)

function toggleBinder() {
  if (props.card) {
    binderStore.toggleSave(props.card)
  }
}

// Key legalities list
const legalitiesList = computed(() => {
  if (!props.card?.legalities) return []
  const map = props.card.legalities
  const formats: Array<{ key: keyof ScryfallLegalities; nameKey: string }> = [
    { key: 'standard', nameKey: 'filters.standard' },
    { key: 'pioneer', nameKey: 'filters.pioneer' },
    { key: 'modern', nameKey: 'filters.modern' },
    { key: 'legacy', nameKey: 'filters.legacy' },
    { key: 'vintage', nameKey: 'filters.vintage' },
    { key: 'commander', nameKey: 'filters.commander' },
    { key: 'pauper', nameKey: 'filters.pauper' },
    { key: 'historic', nameKey: 'Historic' },
    { key: 'alchemy', nameKey: 'Alchemy' },
    { key: 'timeless', nameKey: 'Timeless' },
  ]

  const statusMap: Record<string, string> = {
    legal: t('card.legal'),
    not_legal: t('card.notLegal'),
    restricted: t('card.restricted'),
    banned: t('card.banned'),
  }

  return formats.map((f) => {
    const rawStatus = map[f.key] || 'not_legal'
    const name = f.nameKey.startsWith('filters.') ? t(f.nameKey) : f.nameKey
    return {
      name,
      status: statusMap[rawStatus] || rawStatus.replace('_', ' '),
      rawStatus,
    }
  })
})
</script>

<template>
  <div class="card-details-grid">
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
          {{ t('card.face', { num: idx + 1, name: face.name }) }}
        </button>
      </div>

      <!-- Action buttons: Save to Binder -->
      <button class="btn-primary binder-toggle-btn" @click="toggleBinder">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          :fill="isSaved ? '#0b0d14' : 'none'"
          stroke="currentColor"
          stroke-width="2"
        >
          <polygon
            points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"
          />
        </svg>
        <span>{{
          isSaved ? t('card.inBinder', { qty: binderQuantity }) : t('card.addToBinder')
        }}</span>
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
          <span class="set-name-badge"
            >{{ card.set_name }} ({{ card.set.toUpperCase() }}) #{{
              card.collector_number
            }}</span
          >
          <span class="rarity-badge" :class="`rarity-${card.rarity}`">{{ card.rarity }}</span>
        </div>
      </div>

      <!-- Navigation Tabs -->
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
          {{ t('card.printsTab', { count: prints.length }) }}
        </button>
      </div>

      <!-- Tab 1: Details (Oracle text, P/T, Legalities, Prices) -->
      <div v-if="activeTab === 'details'" class="tab-content">
        <!-- Oracle Text -->
        <div v-if="displayOracleText" class="oracle-box">
          <p class="oracle-text">{{ displayOracleText }}</p>
          <p v-if="displayFlavorText" class="flavor-text">
            <em>{{ displayFlavorText }}</em>
          </p>
        </div>

        <!-- Power / Toughness / Loyalty -->
        <div v-if="displayPowerToughness" class="pt-box">
          <span class="pt-badge">{{ displayPowerToughness }}</span>
        </div>

        <!-- Artist Info -->
        <p class="artist-info">
          {{ t('card.artist') }}: <strong>{{ currentFace?.artist || card.artist }}</strong>
        </p>

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
              <span class="price-value foil">{{
                formatCurrency(card.prices?.usd_foil)
              }}</span>
            </div>
            <div class="price-card">
              <span class="price-label">{{ t('card.eur') }}</span>
              <span class="price-value">{{
                card.prices?.eur ? `€${card.prices.eur}` : '—'
              }}</span>
            </div>
            <div class="price-card">
              <span class="price-label">{{ t('card.tix') }}</span>
              <span class="price-value">{{
                card.prices?.tix ? `${card.prices.tix}` : '—'
              }}</span>
            </div>
          </div>

          <!-- Purchase links: LigaMagic for pt-BR, TCGplayer & Cardmarket for EN -->
          <div class="purchase-links">
            <a
              v-if="locale === 'pt-BR'"
              :href="`https://www.ligamagic.com.br/?view=cards/search&card=${encodeURIComponent(card.name)}`"
              target="_blank"
              rel="noopener"
              class="buy-link"
            >
              {{ t('card.buyLigamagic') }}
            </a>
            <template v-else-if="card.purchase_uris">
              <a
                v-if="card.purchase_uris.tcgplayer"
                :href="card.purchase_uris.tcgplayer"
                target="_blank"
                rel="noopener"
                class="buy-link"
              >
                {{ t('card.buyTcgplayer') }}
              </a>
              <a
                v-if="card.purchase_uris.cardmarket"
                :href="card.purchase_uris.cardmarket"
                target="_blank"
                rel="noopener"
                class="buy-link"
              >
                {{ t('card.buyCardmarket') }}
              </a>
            </template>
          </div>
        </div>

        <!-- Format Legalities Grid -->
        <div class="legalities-section">
          <h4>{{ t('card.legalitiesTitle') }}</h4>
          <div class="legalities-grid">
            <div v-for="leg in legalitiesList" :key="leg.name" class="leg-item">
              <span class="leg-name">{{ leg.name }}</span>
              <span class="pill-badge" :class="`pill-${leg.rawStatus}`">{{
                leg.status
              }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Tab 2: Official Rulings -->
      <div v-else-if="activeTab === 'rulings'" class="tab-content">
        <div v-if="isLoadingRulings" class="rulings-loading">
          <div class="skeleton" style="height: 40px; margin-bottom: 8px" />
          <div class="skeleton" style="height: 40px" />
        </div>
        <div v-else-if="rulings.length === 0" class="empty-tab">
          {{ t('card.noRulings') }}
        </div>
        <div v-else class="rulings-list">
          <div v-for="(rule, idx) in rulings" :key="idx" class="ruling-item">
            <span class="ruling-date">{{ formatDate(rule.published_at) }}</span>
            <p class="ruling-comment">{{ rule.comment }}</p>
          </div>
        </div>
      </div>

      <!-- Tab 3: Printings / Variations -->
      <div v-else-if="activeTab === 'prints'" class="tab-content">
        <div v-if="isLoadingPrints" class="prints-loading">
          <div class="skeleton" style="height: 50px" />
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
            <span class="print-rarity" :class="`rarity-${p.rarity}`"
              >#{{ p.collector_number }} • {{ p.rarity }}</span
            >
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.card-details-grid {
  display: grid;
  grid-template-columns: 320px 1fr;
  gap: 24px;
  width: 100%;
}

@media (max-width: 768px) {
  .card-details-grid {
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
