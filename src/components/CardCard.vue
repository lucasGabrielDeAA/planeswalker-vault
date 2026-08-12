<script setup lang="ts">
import { ref, computed } from 'vue'
import type { ScryfallCard } from '@/types/scryfall'
import { useCardsStore } from '@/stores/cards'
import { useBinderStore } from '@/stores/binder'
import { useI18n } from '@/i18n/useI18n'
import ManaSymbol from './ManaSymbol.vue'

const props = defineProps<{
  card: ScryfallCard
}>()

const cardsStore = useCardsStore()
const binderStore = useBinderStore()
const { t, formatCurrency } = useI18n()

const isFlipped = ref(false)

// Check if card is double-sided / transformable
const isDoubleSided = computed(() => {
  return Boolean(
    props.card.card_faces &&
    props.card.card_faces.length > 1 &&
    props.card.card_faces[0]?.image_uris,
  )
})

// Current visible face image URL
const currentImageUrl = computed(() => {
  if (isDoubleSided.value && props.card.card_faces) {
    const face = isFlipped.value ? props.card.card_faces[1] : props.card.card_faces[0]
    return face?.image_uris?.normal || face?.image_uris?.small || ''
  }
  return props.card.image_uris?.normal || props.card.image_uris?.small || ''
})

// Current face title & mana cost
const cardTitle = computed(() => {
  if (isDoubleSided.value && props.card.card_faces) {
    const faceName = isFlipped.value
      ? props.card.card_faces[1]?.name
      : props.card.card_faces[0]?.name
    return faceName || props.card.name
  }
  return props.card.name
})

const cardManaCost = computed(() => {
  if (isDoubleSided.value && props.card.card_faces) {
    const cost = isFlipped.value
      ? props.card.card_faces[1]?.mana_cost
      : props.card.card_faces[0]?.mana_cost
    return cost || ''
  }
  return props.card.mana_cost || ''
})

const isSavedInBinder = computed(() => binderStore.isSaved(props.card.id))

const binderQuantity = computed(() => binderStore.getItemQuantity(props.card.id))

function handleToggleSave(e: Event) {
  e.stopPropagation()
  binderStore.toggleSave(props.card)
}

function handleFlip(e: Event) {
  e.stopPropagation()
  isFlipped.value = !isFlipped.value
}

function handleOpenModal() {
  cardsStore.openCardModal(props.card)
}
</script>

<template>
  <div class="card-item glass-panel" @click="handleOpenModal">
    <!-- Foil shimmer glow effect if foil finish -->
    <div v-if="card.foil" class="foil-overlay"></div>

    <!-- Top Card Header -->
    <div class="card-header">
      <div class="card-title-group">
        <h3 class="card-name" :title="cardTitle">{{ cardTitle }}</h3>
        <ManaSymbol :cost="cardManaCost" />
      </div>
      <button
        class="save-btn"
        :class="{ active: isSavedInBinder }"
        :title="
          isSavedInBinder ? t('card.inBinder', { qty: binderQuantity }) : t('card.addToBinder')
        "
        @click="handleToggleSave"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          :fill="isSavedInBinder ? '#e5c158' : 'none'"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <polygon
            points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"
          />
        </svg>
      </button>
    </div>

    <!-- Card Image Container -->
    <div class="image-wrapper">
      <img
        v-if="currentImageUrl"
        :src="currentImageUrl"
        :alt="cardTitle"
        class="card-img"
        loading="lazy"
      />
      <div v-else class="card-img-placeholder">
        <span>{{ cardTitle }}</span>
      </div>

      <!-- Flip Double Sided Button -->
      <button v-if="isDoubleSided" class="flip-btn" title="Flip card face" @click="handleFlip">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <polyline points="17 1 21 5 17 9"></polyline>
          <path d="M3 11V9a4 4 0 0 1 4-4h14"></path>
          <polyline points="7 23 3 19 7 15"></polyline>
          <path d="M21 13v2a4 4 0 0 1-4 4H3"></path>
        </svg>
        <span>Flip</span>
      </button>
    </div>

    <!-- Footer Meta: Set, Price, Rarity -->
    <div class="card-footer">
      <div class="set-info">
        <span class="set-code">{{ card.set.toUpperCase() }}</span>
        <span class="rarity-tag" :class="`rarity-${card.rarity}`">{{ card.rarity }}</span>
      </div>
      <div class="price-tag">
        <span v-if="card.prices?.usd" class="usd-price">{{ formatCurrency(card.prices.usd) }}</span>
        <span v-else-if="card.prices?.usd_foil" class="foil-price"
          >{{ formatCurrency(card.prices.usd_foil) }} (F)</span
        >
        <span v-else class="no-price">{{ t('card.noPrice') }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.card-item {
  position: relative;
  display: flex;
  flex-direction: column;
  border-radius: var(--radius-md);
  padding: 12px;
  cursor: pointer;
  transition:
    transform 0.25s cubic-bezier(0.4, 0, 0.2, 1),
    box-shadow 0.25s ease,
    border-color 0.25s ease;
  overflow: hidden;
  height: 100%;
  box-sizing: border-box;
}

.card-item:hover {
  transform: translateY(-6px) scale(1.02);
  box-shadow:
    0 12px 32px rgba(0, 0, 0, 0.8),
    0 0 20px rgba(229, 193, 88, 0.25);
  border-color: var(--border-glow);
}

/* Foil overlay shimmer */
.foil-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  background: linear-gradient(
    135deg,
    rgba(255, 0, 0, 0.06) 0%,
    rgba(255, 255, 0, 0.06) 20%,
    rgba(0, 255, 0, 0.06) 40%,
    rgba(0, 255, 255, 0.06) 60%,
    rgba(0, 0, 255, 0.06) 80%,
    rgba(255, 0, 255, 0.06) 100%
  );
  z-index: 1;
  opacity: 0.7;
}

.card-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 8px;
  height: 44px;
  margin-bottom: 10px;
  z-index: 2;
  overflow: hidden;
  flex-shrink: 0;
}

.card-title-group {
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  gap: 2px;
  overflow: hidden;
  height: 100%;
  flex: 1;
}

.card-name {
  font-size: 0.95rem;
  font-weight: 700;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: var(--text-main);
  line-height: 1.2;
}

.save-btn {
  color: var(--text-muted);
  padding: 4px;
  border-radius: var(--radius-sm);
  transition: all 0.2s ease;
  flex-shrink: 0;
}
.save-btn:hover {
  color: var(--primary-gold);
  transform: scale(1.15);
}
.save-btn.active {
  color: var(--primary-gold);
}

.image-wrapper {
  position: relative;
  width: 100%;
  aspect-ratio: 488 / 680;
  border-radius: var(--radius-sm);
  overflow: hidden;
  background: rgba(0, 0, 0, 0.4);
  z-index: 2;
  margin-bottom: 10px;
  flex-shrink: 0;
}

.card-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  transition: transform 0.3s ease;
}

.card-img-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: 20px;
  text-align: center;
  font-size: 0.9rem;
  color: var(--text-muted);
}

.flip-btn {
  position: absolute;
  bottom: 8px;
  right: 8px;
  display: flex;
  align-items: center;
  gap: 4px;
  background: rgba(19, 22, 34, 0.85);
  backdrop-filter: blur(8px);
  color: var(--text-main);
  border: 1px solid var(--border-glass);
  padding: 4px 10px;
  border-radius: var(--radius-full);
  font-size: 0.75rem;
  font-weight: 600;
  transition: all 0.2s ease;
}
.flip-btn:hover {
  background: var(--primary-gold);
  color: #0b0d14;
}

.card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  z-index: 2;
  font-size: 0.8rem;
  margin-top: auto;
  height: 24px;
  flex-shrink: 0;
}

.set-info {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
}

.set-code {
  font-weight: 700;
  color: var(--text-muted);
}

.rarity-tag {
  text-transform: capitalize;
  font-size: 0.7rem;
  font-weight: 600;
}
.rarity-common {
  color: var(--rarity-common);
}
.rarity-uncommon {
  color: var(--rarity-uncommon);
}
.rarity-rare {
  color: var(--rarity-rare);
}
.rarity-mythic {
  color: var(--rarity-mythic);
}

.price-tag {
  font-weight: 700;
  text-align: right;
  white-space: nowrap;
  flex-shrink: 0;
  min-width: 85px;
}
.usd-price {
  color: #4ade80;
}
.foil-price {
  color: #c084fc;
}
.no-price {
  color: var(--text-dim);
}
</style>
