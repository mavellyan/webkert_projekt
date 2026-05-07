import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { jobsService } from '../services/jobsService'
import { metadataService } from '../services/metadataService'
import type { Category, JobFilters, JobPost } from '../types'

const initialFilters: JobFilters = {
  query: '',
  categoryId: '',
  workMode: '',
  sortBy: 'newest'
}

export const useJobsStore = defineStore('jobs', () => {
  const loading = ref(false)
  const error = ref('')
  const jobs = ref<JobPost[]>([])
  const categories = ref<Category[]>([])
  const filters = ref<JobFilters>({ ...initialFilters })

  async function fetchCategories(): Promise<void> {
    try {
      categories.value = await metadataService.listCategories()
    } catch {
      categories.value = []
    }
  }

  async function fetchJobs(): Promise<void> {
    loading.value = true
    error.value = ''

    try {
      jobs.value = await jobsService.list(filters.value)
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Nem sikerült betölteni az állásokat.'
    } finally {
      loading.value = false
    }
  }

  function resetFilters(): void {
    filters.value = { ...initialFilters }
  }

  const filteredJobs = computed(() => jobs.value)

  function getById(id: string): JobPost | undefined {
    return jobs.value.find((item) => item.id === id)
  }

  return {
    loading,
    error,
    jobs,
    categories,
    filters,
    filteredJobs,
    fetchCategories,
    fetchJobs,
    resetFilters,
    getById
  }
})
