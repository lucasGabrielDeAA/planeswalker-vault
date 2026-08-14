<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useCardsStore } from '@/stores/cards'
import { useBinderStore } from '@/stores/binder'
import { useI18n } from '@/i18n/useI18n'
import { useCardAutocompleteQuery } from '@/queries/useScryfallQueries'

const router = useRouter()
const route = useRoute()
const cardsStore = useCardsStore()
const binderStore = useBinderStore()
const { t, locale, setLocale } = useI18n()

const searchInputRef = ref<HTMLInputElement | null>(null)
const inputQuery = ref('')
const isFocused = ref(false)

// Keep inputQuery in sync if store's search query changes externally (e.g., reset filters)
watch(
  () => cardsStore.searchQuery,
  (newVal) => {
    if (newVal !== inputQuery.value) {
      inputQuery.value = newVal
    }
  }
)

// TanStack Vue Query for card autocomplete suggestions
const { data: autocompleteData } = useCardAutocompleteQuery(inputQuery)

const suggestions = computed(() => autocompleteData.value || [])
const showSuggestions = computed(() => isFocused.value && suggestions.value.length > 0)

function handleSearchSubmit() {
  if (!inputQuery.value.trim()) return
  isFocused.value = false
  cardsStore.searchQuery = inputQuery.value.trim()
  cardsStore.executeSearch(1)

  if (route.name !== 'search') {
    router.push({ name: 'search' })
  }
}

function clearSearch() {
  inputQuery.value = ''
  isFocused.value = false
  if (cardsStore.searchQuery) {
    cardsStore.searchQuery = ''
    cardsStore.executeSearch(1)
  }
  searchInputRef.value?.focus()
}

function selectSuggestion(item: string) {
  inputQuery.value = item
  isFocused.value = false
  handleSearchSubmit()
}

function hideSuggestions() {
  setTimeout(() => {
    isFocused.value = false
  }, 150)
}
</script>

<template>
  <header class="navbar glass-panel">
    <div class="nav-container">
      <!-- Logo Branding -->
      <RouterLink to="/" class="brand-logo">
        <svg class="brand-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
        </svg>
        <span class="brand-name gold-text">{{ t('nav.brandName') }}</span>
      </RouterLink>

      <!-- Global Live Search Bar with Autocomplete -->
      <div class="search-box">
        <div class="search-input-wrapper">
          <svg class="search-icon" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input
            ref="searchInputRef"
            v-model="inputQuery"
            type="text"
            :placeholder="t('nav.searchPlaceholder')"
            class="search-input"
            @keyup.enter="handleSearchSubmit"
            @focus="isFocused = true"
            @blur="hideSuggestions"
          />
          <button
            v-if="inputQuery"
            type="button"
            class="clear-search-btn"
            :title="t('nav.clearSearch')"
            :aria-label="t('nav.clearSearch')"
            @mousedown.prevent
            @click="clearSearch"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <!-- Autocomplete Suggestions Dropdown -->
        <ul v-if="showSuggestions" class="suggestions-dropdown glass-panel">
          <li
            v-for="(item, idx) in suggestions"
            :key="idx"
            class="suggestion-item"
            @mousedown="selectSuggestion(item)"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <span>{{ item }}</span>
          </li>
        </ul>
      </div>

      <!-- Navigation Links & Language Toggle -->
      <div class="nav-right-group">
        <nav class="nav-links">
          <RouterLink to="/" class="nav-item">{{ t('nav.search') }}</RouterLink>
          <RouterLink to="/sets" class="nav-item">{{ t('nav.sets') }}</RouterLink>
          <RouterLink to="/random" class="nav-item">{{ t('nav.random') }}</RouterLink>
          <RouterLink to="/binder" class="nav-item binder-link">
            <span>{{ t('nav.binder') }}</span>
            <span v-if="binderStore.totalCount > 0" class="binder-badge">
              {{ binderStore.totalCount }}
            </span>
          </RouterLink>
        </nav>

        <!-- Language Selector Toggle Switch -->
        <div class="lang-selector-switch">
          <button
            class="lang-btn"
            :class="{ active: locale === 'en' }"
            title="English"
            @click="setLocale('en')"
          >
            🇺🇸 EN
          </button>
          <button
            class="lang-btn"
            :class="{ active: locale === 'pt-BR' }"
            title="Português Brasileiro"
            @click="setLocale('pt-BR')"
          >
            🇧🇷 PT-BR
          </button>
        </div>
      </div>
    </div>
  </header>
</template>

<style scoped>
.navbar {
  position: sticky;
  top: 12px;
  margin: 12px auto;
  width: calc(100% - 24px);
  max-width: 1280px;
  z-index: 100;
  padding: 10px 20px;
  min-height: 64px;
  display: flex;
  align-items: center;
  box-sizing: border-box;
}

.nav-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  width: 100%;
  min-width: 0;
}

.brand-logo {
  display: flex;
  align-items: center;
  gap: 10px;
  text-decoration: none;
  flex-shrink: 0;
}

.brand-icon {
  width: 28px;
  height: 28px;
  color: var(--primary-gold);
  flex-shrink: 0;
}

.brand-name {
  font-family: var(--font-serif);
  font-size: 1.25rem;
  font-weight: 900;
  white-space: nowrap;
}

.search-box {
  position: relative;
  width: 320px;
  max-width: 360px;
  flex: 1 1 180px;
  min-width: 150px;
}

.search-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: 12px;
  color: var(--text-dim);
  pointer-events: none;
}

.search-input {
  width: 100%;
  padding: 9px 36px 9px 38px;
  background: var(--bg-surface-elevated);
  border: 1px solid var(--border-glass);
  border-radius: var(--radius-full);
  color: var(--text-main);
  font-size: 0.85rem;
  outline: none;
  transition: all 0.2s ease;
}
.search-input:focus {
  border-color: var(--primary-gold);
  box-shadow: 0 0 12px var(--border-glow);
}

.clear-search-btn {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.12);
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-muted);
  cursor: pointer;
  padding: 0;
  transition: all 0.2s ease;
}

.clear-search-btn:hover {
  background: rgba(229, 193, 88, 0.25);
  color: var(--primary-gold);
  transform: translateY(-50%) scale(1.08);
}

.clear-search-btn:active {
  transform: translateY(-50%) scale(0.95);
  background: rgba(229, 193, 88, 0.4);
}

.suggestions-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  margin-top: 6px;
  list-style: none;
  padding: 6px;
  z-index: 200;
  max-height: 280px;
  overflow-y: auto;
  background: var(--bg-surface);
}

.suggestion-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 12px;
  border-radius: var(--radius-sm);
  cursor: pointer;
  font-size: 0.85rem;
  color: var(--text-muted);
  transition: all 0.15s ease;
}
.suggestion-item:hover {
  background: var(--bg-surface-elevated);
  color: var(--primary-gold);
}

.nav-right-group {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
}

.nav-links {
  display: flex;
  align-items: center;
  gap: 4px;
}

.nav-item {
  color: var(--text-muted);
  font-size: 0.85rem;
  font-weight: 600;
  padding: 6px 8px;
  border-radius: var(--radius-sm);
  transition: all 0.2s ease;
  white-space: nowrap;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
.nav-item:hover,
.nav-item.router-link-active {
  color: var(--primary-gold);
  background: rgba(229, 193, 88, 0.08);
}

.binder-link {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.binder-badge {
  background: var(--primary-gold);
  color: #0b0d14;
  font-size: 0.75rem;
  font-weight: 800;
  padding: 2px 8px;
  border-radius: var(--radius-full);
}

/* Language selector toggle switch */
.lang-selector-switch {
  display: inline-flex;
  align-items: center;
  background: var(--bg-surface-elevated);
  border: 1px solid var(--border-glass);
  border-radius: var(--radius-full);
  padding: 2px;
  flex-shrink: 0;
}

.lang-btn {
  background: transparent;
  border: none;
  color: var(--text-dim);
  font-size: 0.75rem;
  font-weight: 700;
  padding: 4px 10px;
  border-radius: var(--radius-full);
  cursor: pointer;
  transition: all 0.2s ease;
  min-width: 62px;
  text-align: center;
}

.lang-btn:hover {
  color: var(--text-main);
}

.lang-btn.active {
  background: var(--primary-gold);
  color: #0b0d14;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
}

@media (max-width: 960px) {
  .nav-container {
    flex-wrap: wrap;
  }
  .search-box {
    order: 3;
    width: 100%;
    max-width: 100%;
    flex: 1 1 100%;
  }
}
</style>
