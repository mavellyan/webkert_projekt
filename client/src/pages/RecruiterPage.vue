<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { translateEmploymentType, translateWorkMode, translateJobStatus, translateApplicationStatus } from '../utils/labels'
import { useAuthStore } from '../stores/auth'
import { useRecruiterStore } from '../stores/recruiter'
import type {
  ApplicationStatus,
  CompanyInput,
  EmploymentType,
  JobInput,
  JobStatus,
  WorkMode
} from '../types'

const auth = useAuthStore()
const recruiterStore = useRecruiterStore()

const companyForm = reactive<CompanyInput>({
  ownerUserId: auth.userId || 'u-rec-1',
  name: '',
  description: '',
  websiteUrl: '',
  location: ''
})

const companyErrors = ref<Record<string, string>>({})
const editingCompanyId = ref('')

const jobForm = reactive<JobInput>({
  companyId: '',
  categoryId: '',
  title: '',
  description: '',
  employmentType: 'full-time',
  workMode: 'hybrid',
  city: '',
  salaryMin: 0,
  salaryMax: 0,
  currency: 'HUF',
  status: 'published',
  expiresAt: null,
  skillIds: []
})

const jobErrors = ref<Record<string, string>>({})
const editingJobId = ref('')

const employmentTypes: EmploymentType[] = ['full-time', 'part-time', 'contract', 'internship']
const workModes: WorkMode[] = ['onsite', 'hybrid', 'remote']
const statuses: JobStatus[] = ['draft', 'published', 'closed']
const applicationStatuses: ApplicationStatus[] = ['new', 'screening', 'interview', 'rejected', 'offer']

const skillSet = computed(() => new Set(jobForm.skillIds))

function validateCompanyForm(): boolean {
  const nextErrors: Record<string, string> = {}

  if (!companyForm.name.trim()) {
    nextErrors.name = 'A cégnév kötelező.'
  }

  if (!companyForm.location.trim()) {
    nextErrors.location = 'A helyszín kötelező.'
  }

  companyErrors.value = nextErrors
  return Object.keys(nextErrors).length === 0
}

function validateJobForm(): boolean {
  const nextErrors: Record<string, string> = {}

  if (!jobForm.companyId) {
    nextErrors.companyId = 'Válassz céget.'
  }

  if (!jobForm.categoryId) {
    nextErrors.categoryId = 'Válassz kategóriát.'
  }

  if (!jobForm.title.trim()) {
    nextErrors.title = 'A pozíció neve kötelező.'
  }

  if (!jobForm.description.trim()) {
    nextErrors.description = 'A leírás kötelező.'
  }

  if (!jobForm.city.trim()) {
    nextErrors.city = 'A város kötelező.'
  }

  if (jobForm.salaryMin < 0 || jobForm.salaryMax < 0) {
    nextErrors.salary = 'A fizetés nem lehet negatív.'
  }

  if (jobForm.salaryMax > 0 && jobForm.salaryMin > jobForm.salaryMax) {
    nextErrors.salary = 'A minimum nem lehet nagyobb a maximumnál.'
  }

  jobErrors.value = nextErrors
  return Object.keys(nextErrors).length === 0
}

function resetCompanyForm(): void {
  companyForm.ownerUserId = auth.userId || 'u-rec-1'
  companyForm.name = ''
  companyForm.description = ''
  companyForm.websiteUrl = ''
  companyForm.location = ''
  companyErrors.value = {}
  editingCompanyId.value = ''
}

function resetJobForm(): void {
  jobForm.companyId = ''
  jobForm.categoryId = ''
  jobForm.title = ''
  jobForm.description = ''
  jobForm.employmentType = 'full-time'
  jobForm.workMode = 'hybrid'
  jobForm.city = ''
  jobForm.salaryMin = 0
  jobForm.salaryMax = 0
  jobForm.currency = 'HUF'
  jobForm.status = 'published'
  jobForm.expiresAt = null
  jobForm.skillIds = []
  jobErrors.value = {}
  editingJobId.value = ''
}

function beginEditCompany(companyId: string): void {
  const item = recruiterStore.companies.find((company) => company.id === companyId)

  if (!item) {
    return
  }

  editingCompanyId.value = item.id
  companyForm.ownerUserId = item.ownerUserId
  companyForm.name = item.name
  companyForm.description = item.description
  companyForm.websiteUrl = item.websiteUrl
  companyForm.location = item.location
}

function beginEditJob(jobId: string): void {
  const item = recruiterStore.jobs.find((job) => job.id === jobId)

  if (!item) {
    return
  }

  editingJobId.value = item.id
  jobForm.companyId = item.companyId
  jobForm.categoryId = item.categoryId
  jobForm.title = item.title
  jobForm.description = item.description
  jobForm.employmentType = item.employmentType
  jobForm.workMode = item.workMode
  jobForm.city = item.city
  jobForm.salaryMin = item.salaryMin
  jobForm.salaryMax = item.salaryMax
  jobForm.currency = item.currency
  jobForm.status = item.status
  jobForm.expiresAt = item.expiresAt
  jobForm.skillIds = [...item.skillIds]
}

async function submitCompany(): Promise<void> {
  if (!validateCompanyForm()) {
    return
  }

  try {
    if (editingCompanyId.value) {
      await recruiterStore.updateCompany(editingCompanyId.value, { ...companyForm })
    } else {
      await recruiterStore.createCompany({ ...companyForm })
    }

    resetCompanyForm()
  } catch (err) {
    recruiterStore.error = err instanceof Error ? err.message : 'A cég mentése sikertelen.'
  }
}

async function submitJob(): Promise<void> {
  if (!validateJobForm()) {
    return
  }

  try {
    if (editingJobId.value) {
      await recruiterStore.updateJob(editingJobId.value, { ...jobForm })
    } else {
      await recruiterStore.createJob({ ...jobForm })
    }

    resetJobForm()
  } catch (err) {
    recruiterStore.error = err instanceof Error ? err.message : 'Az álláshirdetés mentése sikertelen.'
  }
}

async function removeCompany(companyId: string): Promise<void> {
  if (!window.confirm('Biztosan törölni szeretnéd a céget?')) {
    return
  }

  try {
    await recruiterStore.deleteCompany(companyId)
  } catch (err) {
    recruiterStore.error = err instanceof Error ? err.message : 'A cég törlése sikertelen.'
  }
}

async function removeJob(jobId: string): Promise<void> {
  if (!window.confirm('Biztosan törölni szeretnéd az álláshirdetést?')) {
    return
  }

  try {
    await recruiterStore.deleteJob(jobId)
  } catch (err) {
    recruiterStore.error = err instanceof Error ? err.message : 'Az álláshirdetés törlése sikertelen.'
  }
}

async function changeApplicationStatus(applicationId: string, status: ApplicationStatus): Promise<void> {
  try {
    await recruiterStore.updateApplicationStatus(applicationId, status)
  } catch (err) {
    recruiterStore.error = err instanceof Error ? err.message : 'A jelentkezés státusz mentése sikertelen.'
  }
}

function toggleSkill(skillId: string): void {
  if (skillSet.value.has(skillId)) {
    jobForm.skillIds = jobForm.skillIds.filter((id) => id !== skillId)
    return
  }

  jobForm.skillIds = [...jobForm.skillIds, skillId]
}

onMounted(async () => {
  await recruiterStore.loadBootstrapData()

  if (!jobForm.companyId && recruiterStore.companies.length > 0) {
    jobForm.companyId = recruiterStore.companies[0].id
  }

  if (!jobForm.categoryId && recruiterStore.categories.length > 0) {
    jobForm.categoryId = recruiterStore.categories[0].id
  }
})
</script>

<template>
  <section class="page recruiter-layout">
    <h2 id="recruiter-title">Álláshirdető felület</h2>

    <p v-if="recruiterStore.toast" class="panel toast" aria-live="polite">{{ recruiterStore.toast }}</p>

    <article v-if="recruiterStore.error" class="panel error" role="alert" aria-live="assertive">
      <h3>Hiba történt</h3>
      <p>{{ recruiterStore.error }}</p>
    </article>

    <article class="panel section-card" aria-labelledby="company-form-title">
      <h3 id="company-form-title">Cég létrehozása / szerkesztése</h3>
      <form class="form-grid" @submit.prevent="submitCompany">
        <label>
          <span>Cégnév</span>
          <input v-model="companyForm.name" class="input" type="text" />
          <small v-if="companyErrors.name" class="field-error">{{ companyErrors.name }}</small>
        </label>

        <label>
          <span>Helyszín</span>
          <input v-model="companyForm.location" class="input" type="text" />
          <small v-if="companyErrors.location" class="field-error">{{ companyErrors.location }}</small>
        </label>

        <label>
          <span>Weboldal</span>
          <input v-model="companyForm.websiteUrl" class="input" type="url" placeholder="https://..." />
        </label>

        <label class="span-2">
          <span>Leírás</span>
          <textarea v-model="companyForm.description" class="input textarea" rows="3" />
        </label>

        <div class="actions span-2">
          <button class="btn btn-primary" type="submit">
            {{ editingCompanyId ? 'Cég frissítése' : 'Cég létrehozása' }}
          </button>
          <button class="btn btn-secondary" type="button" @click="resetCompanyForm">Űrlap törlése</button>
        </div>
      </form>
    </article>

    <article class="panel section-card" aria-labelledby="company-list-title">
      <h3 id="company-list-title">Cégek</h3>

      <ul class="entity-list" aria-live="polite">
        <li v-for="company in recruiterStore.companies" :key="company.id" class="entity-row">
          <div>
            <strong>{{ company.name }}</strong>
            <p class="muted">{{ company.location }} • {{ company.websiteUrl || 'nincs weboldal' }}</p>
          </div>
          <div class="actions-inline">
            <button class="btn btn-secondary" type="button" @click="beginEditCompany(company.id)">Szerkesztés</button>
            <button class="btn btn-danger" type="button" @click="removeCompany(company.id)">Törlés</button>
          </div>
        </li>
      </ul>
    </article>

    <article class="panel section-card" aria-labelledby="job-form-title">
      <h3 id="job-form-title">Álláshirdetés létrehozása / szerkesztése</h3>
      <form class="form-grid" @submit.prevent="submitJob">
        <label>
          <span>Pozíció neve</span>
          <input v-model="jobForm.title" class="input" type="text" />
          <small v-if="jobErrors.title" class="field-error">{{ jobErrors.title }}</small>
        </label>

        <label>
          <span>Város</span>
          <input v-model="jobForm.city" class="input" type="text" />
          <small v-if="jobErrors.city" class="field-error">{{ jobErrors.city }}</small>
        </label>

        <label>
          <span>Cég</span>
          <select v-model="jobForm.companyId" class="select">
            <option value="">Válassz céget</option>
            <option v-for="company in recruiterStore.companies" :key="company.id" :value="company.id">
              {{ company.name }}
            </option>
          </select>
          <small v-if="jobErrors.companyId" class="field-error">{{ jobErrors.companyId }}</small>
        </label>

        <label>
          <span>Kategória</span>
          <select v-model="jobForm.categoryId" class="select">
            <option value="">Válassz kategóriát</option>
            <option v-for="category in recruiterStore.categories" :key="category.id" :value="category.id">
              {{ category.name }}
            </option>
          </select>
          <small v-if="jobErrors.categoryId" class="field-error">{{ jobErrors.categoryId }}</small>
        </label>

        <label>
          <span>Foglalkoztatás</span>
          <select v-model="jobForm.employmentType" class="select">
            <option v-for="type in employmentTypes" :key="type" :value="type">{{ translateEmploymentType(type) }}</option>
          </select>
        </label>

        <label>
          <span>Munkavégzés</span>
          <select v-model="jobForm.workMode" class="select">
            <option v-for="mode in workModes" :key="mode" :value="mode">{{ translateWorkMode(mode) }}</option>
          </select>
        </label>

        <label>
          <span>Minimum fizetés</span>
          <input v-model.number="jobForm.salaryMin" class="input" type="number" min="0" step="10000" />
        </label>

        <label>
          <span>Maximum fizetés</span>
          <input v-model.number="jobForm.salaryMax" class="input" type="number" min="0" step="10000" />
          <small v-if="jobErrors.salary" class="field-error">{{ jobErrors.salary }}</small>
        </label>

        <label>
          <span>Pénznem</span>
          <input v-model="jobForm.currency" class="input" type="text" maxlength="3" />
        </label>

        <label>
          <span>Állapot</span>
          <select v-model="jobForm.status" class="select">
            <option v-for="status in statuses" :key="status" :value="status">{{ translateJobStatus(status) }}</option>
          </select>
        </label>

        <label class="span-2">
          <span>Leírás</span>
          <textarea v-model="jobForm.description" class="input textarea" rows="4" />
          <small v-if="jobErrors.description" class="field-error">{{ jobErrors.description }}</small>
        </label>

        <fieldset class="span-2 skill-list">
          <legend>Elvárt skillek</legend>
          <label v-for="skill in recruiterStore.skills" :key="skill.id" class="skill-item">
            <input
              :checked="skillSet.has(skill.id)"
              type="checkbox"
              @change="toggleSkill(skill.id)"
            />
            <span>{{ skill.name }}</span>
          </label>
        </fieldset>

        <div class="actions span-2">
          <button class="btn btn-primary" type="submit">
            {{ editingJobId ? 'Álláshirdetés frissítése' : 'Álláshirdetés létrehozása' }}
          </button>
          <button class="btn btn-secondary" type="button" @click="resetJobForm">Űrlap törlése</button>
        </div>
      </form>
    </article>

    <article class="panel section-card" aria-labelledby="job-list-title">
      <h3 id="job-list-title">Saját álláshirdetések</h3>

      <ul class="entity-list" aria-live="polite">
        <li v-for="job in recruiterStore.jobs" :key="job.id" class="entity-row">
          <div>
            <strong>{{ job.title }}</strong>
            <p class="muted">
              {{ job.companyName }} • {{ job.city }} • {{ job.salaryMin.toLocaleString('hu-HU') }} -
              {{ job.salaryMax.toLocaleString('hu-HU') }} {{ job.currency }}
            </p>
          </div>
          <div class="actions-inline">
            <button class="btn btn-secondary" type="button" @click="beginEditJob(job.id)">Szerkesztés</button>
            <button class="btn btn-danger" type="button" @click="removeJob(job.id)">Törlés</button>
          </div>
        </li>
      </ul>
    </article>

    <article class="panel section-card" aria-labelledby="applications-title">
      <h3 id="applications-title">Jelentkezések kezelése</h3>

      <ul class="entity-list" aria-live="polite">
        <li v-for="application in recruiterStore.applications" :key="application.id" class="entity-row">
          <div>
            <strong>{{ application.jobTitle || 'Ismeretlen állás' }}</strong>
            <p class="muted">
              {{ application.applicantName || 'Ismeretlen jelentkező' }} •
              {{ new Date(application.createdAt).toLocaleDateString('hu-HU') }}
            </p>
          </div>

          <label class="status-select">
            <span>Státusz</span>
            <select
              class="select"
              :value="application.status"
              @change="changeApplicationStatus(application.id, ($event.target as HTMLSelectElement).value as ApplicationStatus)"
            >
                <option v-for="item in applicationStatuses" :key="item" :value="item">{{ translateApplicationStatus(item) }}</option>
            </select>
          </label>
        </li>
      </ul>
    </article>
  </section>
</template>

<style scoped>
.recruiter-layout {
  display: grid;
  gap: 1rem;
}

.section-card {
  display: grid;
  gap: 0.85rem;
}

.form-grid {
  display: grid;
  gap: 0.75rem;
}

label {
  display: grid;
  gap: 0.35rem;
}

.span-2 {
  grid-column: 1 / -1;
}

.textarea {
  resize: vertical;
}

.field-error {
  color: var(--color-danger);
  font-size: 0.85rem;
}

.actions {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.entity-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 0.75rem;
}

.entity-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: 0.75rem;
}

.actions-inline {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.status-select {
  display: grid;
  gap: 0.35rem;
}

.muted {
  color: var(--color-muted);
  margin: 0.25rem 0 0;
}

.btn-danger {
  border-color: var(--color-danger);
  color: var(--color-danger);
  background: #fff;
}

.error {
  border-color: var(--color-danger);
}

.toast {
  border-color: var(--color-primary);
}

.skill-list {
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: 0.75rem;
  display: grid;
  gap: 0.4rem;
}

.skill-item {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
}

@media (min-width: 72rem) {
  .form-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>
