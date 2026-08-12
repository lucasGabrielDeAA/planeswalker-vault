<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  cost?: string
}>()

interface SymbolToken {
  raw: string
  clean: string
  bgClass: string
  symbolText: string
}

const symbols = computed<SymbolToken[]>(() => {
  if (!props.cost) return []
  // Matches {W}, {U}, {2}, {W/P}, {X}, {T}, etc.
  const regex = /\{([^}]+)\}/g
  const matches: SymbolToken[] = []
  let match: RegExpExecArray | null

  while ((match = regex.exec(props.cost)) !== null) {
    const raw = match[0]
    const clean = (match[1] || '').toUpperCase()

    let bgClass = 'sym-generic'
    if (clean === 'W') bgClass = 'sym-w'
    else if (clean === 'U') bgClass = 'sym-u'
    else if (clean === 'B') bgClass = 'sym-b'
    else if (clean === 'R') bgClass = 'sym-r'
    else if (clean === 'G') bgClass = 'sym-g'
    else if (clean === 'C') bgClass = 'sym-c'
    else if (clean === 'T') bgClass = 'sym-tap'
    else if (clean.includes('/')) bgClass = 'sym-hybrid'

    matches.push({
      raw,
      clean,
      bgClass,
      symbolText: clean,
    })
  }

  return matches
})
</script>

<template>
  <span v-if="symbols.length > 0" class="mana-container">
    <span
      v-for="(sym, idx) in symbols"
      :key="idx"
      class="mana-badge"
      :class="sym.bgClass"
      :title="sym.raw"
    >
      {{ sym.symbolText }}
    </span>
  </span>
</template>

<style scoped>
.mana-container {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  flex-wrap: wrap;
  vertical-align: middle;
}

.mana-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  font-size: 0.7rem;
  font-weight: 800;
  color: #0b0d14;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.4);
  user-select: none;
  font-family: var(--font-sans);
  line-height: 1;
}

.sym-w {
  background: radial-gradient(circle, #fffde6 0%, #e6d385 100%);
  color: #2c2500;
  border: 1px solid #c9b048;
}

.sym-u {
  background: radial-gradient(circle, #60a5fa 0%, #1d4ed8 100%);
  color: #ffffff;
  border: 1px solid #1e40af;
}

.sym-b {
  background: radial-gradient(circle, #475569 0%, #0f172a 100%);
  color: #e2e8f0;
  border: 1px solid #334155;
}

.sym-r {
  background: radial-gradient(circle, #f87171 0%, #b91c1c 100%);
  color: #ffffff;
  border: 1px solid #991b1b;
}

.sym-g {
  background: radial-gradient(circle, #4ade80 0%, #15803d 100%);
  color: #ffffff;
  border: 1px solid #166534;
}

.sym-c {
  background: radial-gradient(circle, #cbd5e1 0%, #64748b 100%);
  color: #0f172a;
  border: 1px solid #475569;
}

.sym-tap {
  background: #334155;
  color: #f8fafc;
  border: 1px solid #64748b;
  font-style: italic;
}

.sym-generic {
  background: radial-gradient(circle, #e2e8f0 0%, #94a3b8 100%);
  color: #0f172a;
  border: 1px solid #64748b;
}

.sym-hybrid {
  background: linear-gradient(135deg, #e5c158 0%, #3b82f6 100%);
  color: #ffffff;
  border: 1px solid #ca9e28;
}
</style>
