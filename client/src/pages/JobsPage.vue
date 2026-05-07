<script setup lang="ts">
import { onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useRoute, useRouter } from 'vue-router'
import type { WorkMode } from '../types'
import JobFilterPanel from '../components/JobFilterPanel.vue'
import JobsList from '../components/JobsList.vue'
import SkeletonLoader from '../components/SkeletonLoader.vue'
import EmptyState from '../components/EmptyState.vue'
import ErrorState from '../components/ErrorState.vue'
import { useJobsStore } from '../stores/jobs'

const jobsStore = useJobsStore()
const route = useRoute()
const router = useRouter()
const { filters, filteredJobs, loading, error, categories } = storeToRefs(jobsStore)
let debounceHandle: number | undefined

function parseWorkMode(value: unknown): '' | WorkMode {
  return value === 'onsite' || value === 'hybrid' || value === 'remote' ? value : ''
}

function parseSortBy(value: unknown): 'newest' | 'salary-desc' | 'salary-asc' {
  return value === 'salary-desc' || value === 'salary-asc' ? value : 'newest'
}

async function refreshWithCurrentFilters(): Promise<void> {
  await jobsStore.fetchJobs()

  const query = {
    q: filters.value.query || undefined,
    categoryId: filters.value.categoryId || undefined,
    workMode: filters.value.workMode || undefined,
    sortBy: filters.value.sortBy !== 'newest' ? filters.value.sortBy : undefined
  }

  await router.replace({ query })
}

onMounted(async () => {
  filters.value.query = typeof route.query.q === 'string' ? route.query.q : ''
  filters.value.categoryId = typeof route.query.categoryId === 'string' ? route.query.categoryId : ''
  filters.value.workMode = parseWorkMode(route.query.workMode)
  filters.value.sortBy = parseSortBy(route.query.sortBy)

  await jobsStore.fetchCategories()
  await refreshWithCurrentFilters()
})

async function onFiltersChanged(): Promise<void> {
  if (debounceHandle) {
    window.clearTimeout(debounceHandle)
  }

  debounceHandle = window.setTimeout(() => {
    void refreshWithCurrentFilters()
  }, 300)
}

async function resetFilters(): Promise<void> {
  jobsStore.resetFilters()
  await refreshWithCurrentFilters()
}
</script>

<template>
  <section class="page jobs-layout">
    <h2>Állások</h2>

    <aside>
      <JobFilterPanel v-model="filters" :categories="categories" @change="onFiltersChanged" />
      <button class="btn btn-secondary reset" type="button" @click="resetFilters">
        Szűrők visszaállítása
      </button>
    </aside>

    <section class="results" aria-live="polite">
      <p class="result-count">Találatok: {{ filteredJobs.length }}</p>
      <SkeletonLoader v-if="loading" />
      <ErrorState v-else-if="error" :message="error" />
      <EmptyState
        v-else-if="filteredJobs.length === 0"
        title="Nincs találat"
        message="Próbáld módosítani a szűrőket vagy a keresési kifejezést."
      />
      <JobsList v-else :jobs="filteredJobs" />
    </section>
  </section>
</template>

<style scoped>
.jobs-layout {
  align-items: start;
}

.reset {
  margin-top: 0.75rem;
}

.result-count {
  font-weight: 600;
  color: var(--color-muted);
}

.results {
  display: grid;
  gap: 1rem;
}
</style>
