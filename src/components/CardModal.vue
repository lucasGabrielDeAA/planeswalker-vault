<script setup lang="ts">
import { computed } from 'vue'
import { useCardsStore } from '@/stores/cards'
import CardDetails from './CardDetails.vue'

const cardsStore = useCardsStore()
const card = computed(() => cardsStore.activeCard)

function handleClose() {
  cardsStore.closeCardModal()
}
</script>

<template>
  <Teleport to="body">
    <div v-if="cardsStore.isModalOpen && card" class="modal-backdrop" @click.self="handleClose">
      <div class="modal-content glass-panel fade-in">
        <!-- Close Button -->
        <button class="close-btn" @click="handleClose" title="Close modal">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
          >
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>

        <!-- Card Details Content -->
        <CardDetails :card="card" />
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
  box-shadow:
    var(--shadow-md),
    0 0 40px rgba(0, 0, 0, 0.9);
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
  background: var(--primary-gold);
  color: #0b0d14;
}
</style>
