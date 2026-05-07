<script setup lang="ts">
import type { Category, JobFilters } from '../types'

const filters = defineModel<JobFilters>({ required: true })
defineProps<{ categories: Category[] }>()
const emit = defineEmits<{ (event: 'change'): void }>()

const workModes = [
  { value: '', label: 'Mindegyik' },
  { value: 'onsite', label: 'Irodai' },
  { value: 'hybrid', label: 'Hibrid' },
  { value: 'remote', label: 'Remote' }
]
</script>

<template>
  <form class="panel filters" @submit.prevent @input="emit('change')" @change="emit('change')" aria-label="Állásszűrők">
    <h2>Szűrők</h2>

    <label>
      <span>Keresés</span>
      <input
        v-model="filters.query"
        class="input"
        type="search"
        placeholder="Pozíció, cég, város"
        aria-label="Keresés"
      />
    </label>

    <label>
      <span>Kategória</span>
      <select v-model="filters.categoryId" class="select" aria-label="Kategória szűrő">
        <option value="">Összes</option>
        <option v-for="category in categories" :key="category.id" :value="category.id">
          {{ category.name }}
        </option>
      </select>
    </label>

    <label>
      <span>Munkamód</span>
      <select v-model="filters.workMode" class="select" aria-label="Munkamód szűrő">
        <option v-for="mode in workModes" :key="mode.value" :value="mode.value">{{ mode.label }}</option>
      </select>
    </label>

    <label>
      <span>Rendezés</span>
      <select v-model="filters.sortBy" class="select" aria-label="Rendezés">
        <option value="newest">Legfrissebb</option>
        <option value="salary-desc">Fizetés: csökkenő</option>
        <option value="salary-asc">Fizetés: növekvő</option>
      </select>
    </label>
  </form>
</template>

<style scoped>
.filters {
  display: grid;
  gap: 0.9rem;
}

label {
  display: grid;
  gap: 0.35rem;
  color: var(--color-muted);
}

span {
  font-weight: 600;
  color: var(--color-text);
}
</style>
