import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { applicationsService } from '../services/applicationsService'
import { savedJobsService } from '../services/savedJobsService'
import type { Application, SavedJob } from '../types'

export const useJobseekerStore = defineStore('jobseeker', () => {
  const loading = ref(false)
  const error = ref('')
  const toast = ref('')

  const applications = ref<Application[]>([])
  const savedJobs = ref<SavedJob[]>([])

  function setToast(message: string): void {
    toast.value = message
    window.setTimeout(() => {
      if (toast.value === message) {
        toast.value = ''
      }
    }, 2200)
  }

  async function loadAll(userId: string): Promise<void> {
    loading.value = true
    error.value = ''

    try {
      const [apps, saved] = await Promise.all([
        applicationsService.list(),
        savedJobsService.listByUser(userId)
      ])

      applications.value = apps.filter((item) => item.applicantUserId === userId)
      savedJobs.value = saved
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Nem sikerült betölteni az álláskereső adatokat.'
    } finally {
      loading.value = false
    }
  }

  async function apply(jobId: string, applicantUserId: string, motivation: string, cvUrl: string): Promise<void> {
    const created = await applicationsService.create({
      jobId,
      applicantUserId,
      motivation,
      cvUrl
    })

    applications.value = [created, ...applications.value]
    setToast('Jelentkezés elküldve.')
  }

  async function saveJob(jobId: string, userId: string): Promise<void> {
    const created = await savedJobsService.create({ jobId, userId })
    savedJobs.value = [created, ...savedJobs.value]
    setToast('Állás mentve.')
  }

  async function removeSaved(savedId: string): Promise<void> {
    await savedJobsService.remove(savedId)
    savedJobs.value = savedJobs.value.filter((item) => item.id !== savedId)
    setToast('Mentett állás törölve.')
  }

  const hasSavedJob = computed(() => {
    const ids = new Set(savedJobs.value.map((item) => item.jobId))
    return (jobId: string) => ids.has(jobId)
  })

  return {
    loading,
    error,
    toast,
    applications,
    savedJobs,
    hasSavedJob,
    loadAll,
    apply,
    saveJob,
    removeSaved
  }
})
