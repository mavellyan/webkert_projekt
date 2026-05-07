import { ref } from 'vue'
import { defineStore } from 'pinia'
import { companiesService } from '../services/companiesService'
import { jobsService } from '../services/jobsService'
import { metadataService } from '../services/metadataService'
import { applicationsService } from '../services/applicationsService'
import type {
  Application,
  Category,
  Company,
  CompanyInput,
  JobInput,
  JobPost,
  Skill
} from '../types'

export const useRecruiterStore = defineStore('recruiter', () => {
  const loading = ref(false)
  const error = ref('')
  const toast = ref('')

  const companies = ref<Company[]>([])
  const jobs = ref<JobPost[]>([])
  const applications = ref<Application[]>([])
  const categories = ref<Category[]>([])
  const skills = ref<Skill[]>([])

  function setToast(message: string): void {
    toast.value = message
    window.setTimeout(() => {
      if (toast.value === message) {
        toast.value = ''
      }
    }, 2400)
  }

  async function loadBootstrapData(): Promise<void> {
    loading.value = true
    error.value = ''

    try {
      const [companiesList, categoriesList, skillsList, jobsList] = await Promise.all([
        companiesService.list(),
        metadataService.listCategories(),
        metadataService.listSkills(),
        jobsService.list({ query: '', categoryId: '', workMode: '', sortBy: 'newest' })
      ])

      const appLists = await Promise.all(
        companiesList.map((company) => applicationsService.list(company.id))
      )

      companies.value = companiesList
      categories.value = categoriesList
      skills.value = skillsList
      jobs.value = jobsList
      applications.value = appLists.flat()
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Nem sikerült betölteni a recruiter adatokat.'
    } finally {
      loading.value = false
    }
  }

  async function createCompany(payload: CompanyInput): Promise<void> {
    const created = await companiesService.create(payload)
    companies.value.unshift(created)
    setToast('Cég sikeresen létrehozva.')
  }

  async function updateCompany(id: string, payload: CompanyInput): Promise<void> {
    const updated = await companiesService.update(id, payload)
    companies.value = companies.value.map((item) => (item.id === id ? updated : item))
    setToast('Cég sikeresen frissítve.')
  }

  async function deleteCompany(id: string): Promise<void> {
    await companiesService.remove(id)
    companies.value = companies.value.filter((item) => item.id !== id)
    setToast('Cég törölve.')
  }

  async function createJob(payload: JobInput): Promise<void> {
    const created = await jobsService.create(payload)
    jobs.value.unshift(created)
    setToast('Álláshirdetés létrehozva.')
  }

  async function updateJob(id: string, payload: JobInput): Promise<void> {
    const updated = await jobsService.update(id, payload)
    jobs.value = jobs.value.map((item) => (item.id === id ? updated : item))
    setToast('Álláshirdetés frissítve.')
  }

  async function deleteJob(id: string): Promise<void> {
    await jobsService.remove(id)
    jobs.value = jobs.value.filter((item) => item.id !== id)
    applications.value = applications.value.filter((item) => item.jobId !== id)
    setToast('Álláshirdetés törölve.')
  }

  async function updateApplicationStatus(
    id: string,
    status: Application['status']
  ): Promise<void> {
    const updated = await applicationsService.updateStatus(id, status)
    applications.value = applications.value.map((item) => (item.id === id ? updated : item))
    setToast(`Jelentkezés státusz frissítve: ${status}.`)
  }

  return {
    loading,
    error,
    toast,
    companies,
    jobs,
    applications,
    categories,
    skills,
    loadBootstrapData,
    createCompany,
    updateCompany,
    deleteCompany,
    createJob,
    updateJob,
    deleteJob,
    updateApplicationStatus
  }
})
