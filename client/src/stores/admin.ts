import { ref } from 'vue'
import { defineStore } from 'pinia'
import { usersService } from '../services/usersService'
import { jobsService } from '../services/jobsService'
import type { JobPost, User } from '../types'

export const useAdminStore = defineStore('admin', () => {
  const loading = ref(false)
  const error = ref('')
  const toast = ref('')
  const users = ref<User[]>([])
  const jobs = ref<JobPost[]>([])

  function setToast(message: string): void {
    toast.value = message
    window.setTimeout(() => {
      if (toast.value === message) {
        toast.value = ''
      }
    }, 2200)
  }

  async function loadData(): Promise<void> {
    loading.value = true
    error.value = ''

    try {
      const [usersList, jobsList] = await Promise.all([
        usersService.list(),
        jobsService.list({ query: '', categoryId: '', workMode: '', sortBy: 'newest' })
      ])

      users.value = usersList
      jobs.value = jobsList
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Nem sikerült betölteni az admin adatokat.'
    } finally {
      loading.value = false
    }
  }

  async function toggleUserActive(userId: string, isActive: boolean): Promise<void> {
    const updated = await usersService.setActive(userId, isActive)
    users.value = users.value.map((item) => (item.id === userId ? updated : item))
    setToast(isActive ? 'Felhasználó aktiválva.' : 'Felhasználó tiltva.')
  }

  async function setJobStatus(jobId: string, status: JobPost['status']): Promise<void> {
    const current = jobs.value.find((item) => item.id === jobId)

    if (!current) {
      return
    }

    const updated = await jobsService.update(jobId, {
      companyId: current.companyId,
      categoryId: current.categoryId,
      title: current.title,
      description: current.description,
      employmentType: current.employmentType,
      workMode: current.workMode,
      city: current.city,
      salaryMin: current.salaryMin,
      salaryMax: current.salaryMax,
      currency: current.currency,
      status,
      expiresAt: current.expiresAt,
      skillIds: current.skillIds
    })

    jobs.value = jobs.value.map((item) => (item.id === jobId ? updated : item))
    setToast(`Álláshirdetés státusz frissítve: ${status}.`)
  }

  return {
    loading,
    error,
    toast,
    users,
    jobs,
    loadData,
    toggleUserActive,
    setJobStatus
  }
})
