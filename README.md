# Planeswalker Vault - Magic: The Gathering Scryfall Explorer

**Planeswalker Vault** is a modern, high-performance web application built with **Vue 3**, **TypeScript**, **Vite**, **Pinia**, and **TanStack Query** for exploring over 100,000+ Magic: The Gathering cards powered by the official **Scryfall API**.

---

## ✨ Features

- 🔍 **Advanced Card Search**: Full Scryfall search syntax support (`c:blue t:creature r:mythic`), filter controls, live autocomplete search bar, and instant pagination.
- 🌐 **i18n Multi-Language Support**: Instant toggle between **English (`EN`)** and **Brazilian Portuguese (`PT-BR`)**.
- 💵 **Real-Time Currency Conversion (R$)**: Converts card market prices to Brazilian Reais (`R$`) using live USD/BRL exchange rates and daily variation percentages from **AwesomeAPI**.
- ⚡ **TanStack Query Caching**: Powered by `@tanstack/vue-query` for automatic data caching, background refetching, debounced suggestions, and zero redundant API calls.
- 🃏 **Interactive Card Modal**: High-res card renderings, double-sided card flip toggle, format legalities, printings, market prices, and official rulings.
- 📁 **Saved Binder & Analytics**: Save cards to a personal binder (`localStorage`), analyze Mana Curve (CMC) & Color Breakdown charts, and export deck lists.
- 📚 **Expansion Sets Explorer**: Browse all official Magic expansion sets and view card releases by set code.
- 🎲 **Random Card Generator**: Summon random cards from across the multiverse filtered by legalities and colors.

---

## 🛠️ Technology Stack & Dependencies

### Core Architecture

- **Framework**: Vue 3 (Composition API with `<script setup>`) — `src/App.vue`
- **Language**: TypeScript (Strict type checking via `vue-tsc`) — `tsconfig.json`
- **Build Tool**: Vite (Fast HMR & bundling) — `vite.config.ts`
- **State Management**: Pinia — `src/stores/cards.ts`
- **Data Fetching & Caching**: TanStack Query (`@tanstack/vue-query`) — `src/queries/useScryfallQueries.ts`
- **Routing**: Vue Router — `src/router/index.ts`

### External APIs

- **[Scryfall API](https://scryfall.com/docs/api)**: Card data, syntax search, set information, rulings, and printings.
- **[AwesomeAPI (Economy API)](https://economia.awesomeapi.com.br/last/USD-BRL)**: Real-time USD to BRL exchange rate and daily percentage variation.

### Testing & Code Quality

- **Unit Testing**: Vitest & `@vue/test-utils` — `src/__tests__/App.spec.ts`
- **Type Checking**: `vue-tsc`
- **Linting & Formatting**: ESLint, Oxlint, and Prettier

---

## 🚀 Cloning the Repository

To clone and run this project locally from GitHub:

```sh
# Clone the repository
git clone https://github.com/lucasGabrielDeAA/mtg-explorer.git

# Navigate into the project directory
cd mtg-explorer
```

---

## ⚙️ Installation & Development

### 1. Install Dependencies

```sh
npm install
```

### 2. Start Development Server

Starts Vite dev server with Hot Module Replacement (HMR):

```sh
npm run dev
```

Open your browser at `http://localhost:5173`.

---

## 🧪 Testing & Verification Commands

### Run Unit Tests

Executes unit test suite powered by **Vitest**:

```sh
npm run test:unit
```

### Run Type Checker

Runs `vue-tsc` to verify TypeScript types across all `.ts` files and `.vue` templates:

```sh
npm run type-check
```

### Run Linters

Checks code style and errors using ESLint and Oxlint:

```sh
npm run lint
```

### Format Code

Formats code using Prettier:

```sh
npm run format
```

### Production Build

Compiles, type-checks, and bundles the application for production:

```sh
npm run build
```

### Preview Production Build

Locally preview the built app:

```sh
npm run preview
```

---

## 📁 Project Structure

```
mtg-explorer/
├── src/
│   ├── assets/           # Global styles and design tokens
│   ├── components/       # Reusable Vue components (CardCard, CardModal, Navbar, SearchFilters, ManaSymbol)
│   ├── i18n/             # i18n composables, USD/BRL currency conversion, and locale dictionaries (en, pt-BR)
│   ├── queries/          # TanStack Vue Query composables (useScryfallQueries, useExchangeRateQuery)
│   ├── router/           # Vue Router page routes
│   ├── services/         # Scryfall API service wrapper with rate-limiting
│   ├── stores/           # Pinia stores (cards, binder)
│   ├── types/            # TypeScript interface definitions (ScryfallCard, ScryfallSet, etc.)
│   ├── views/            # Page views (SearchView, SetsView, RandomView, BinderView)
│   ├── App.vue           # Root app layout component
│   └── main.ts           # App bootstrap & TanStack Query plugin registration
├── index.html            # Application entry HTML
├── package.json          # Dependencies & scripts
└── tsconfig.json         # TypeScript configuration
```
