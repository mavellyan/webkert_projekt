<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { translateWorkMode } from '../utils/labels'
import { useRoute, useRouter } from 'vue-router'
import EmptyState from '../components/EmptyState.vue'
import type { JobPost } from '../types'
import { jobsService } from '../services/jobsService'
import { useAuthStore } from '../stores/auth'
import { useJobseekerStore } from '../stores/jobseeker'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const jobseekerStore = useJobseekerStore()
const loading = ref(false)
const error = ref('')
const job = ref<JobPost | null>(null)
const motivation = ref('Röviden bemutatom, miért passzolok a pozícióhoz.')
const cvUrl = ref('https://example.com/cv/sajat-cv.pdf')

onMounted(async () => {
  loading.value = true
  error.value = ''
  job.value = null

  try {
    job.value = await jobsService.getById(String(route.params.id))
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Nem sikerült betölteni a hirdetést.'
  } finally {
    loading.value = false
  }
})

async function submitApplication(): Promise<void> {
  if (!job.value || !auth.userId) {
    return
  }

  try {
    await jobseekerStore.apply(job.value.id, auth.userId, motivation.value, cvUrl.value)
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'A jelentkezés elküldése sikertelen.'
  }
}

async function saveCurrentJob(): Promise<void> {
  if (!job.value || !auth.userId) {
    return
  }

  try {
    await jobseekerStore.saveJob(job.value.id, auth.userId)
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Az állás mentése sikertelen.'
  }
}

async function goBack(): Promise<void> {
  if (window.history.length > 1) {
    router.back()
    return
  }

  await router.push('/jobs')
}
</script>

<template>
  <section class="page">
    <button class="btn btn-secondary back-btn" type="button" @click="goBack">Vissza</button>

    <article v-if="job" class="panel detail" aria-labelledby="job-title">
      <p class="eyebrow">{{ job.categoryName }} - {{ translateWorkMode(job.workMode) }}</p>
      <h2 id="job-title">{{ job.title }}</h2>
      <p>{{ job.companyName }} - {{ job.city }}</p>
      <p>{{ job.description }}</p>
      <p class="salary">{{ job.salaryMin.toLocaleString('hu-HU') }} - {{ job.salaryMax.toLocaleString('hu-HU') }} HUF</p>

      <div v-if="auth.isAuthenticated && auth.role === 'jobseeker'" class="apply-box">
        <label>
          <span>Motiváció</span>
          <textarea v-model="motivation" class="input" rows="3" />
        </label>
        <label>
          <span>CV URL</span>
          <input v-model="cvUrl" class="input" type="url" />
        </label>
        <div class="actions">
          <button class="btn btn-primary" type="button" @click="submitApplication">Jelentkezés</button>
          <button class="btn btn-secondary" type="button" @click="saveCurrentJob">Mentés</button>
        </div>
      </div>

      <p v-if="jobseekerStore.toast" class="toast" aria-live="polite">{{ jobseekerStore.toast }}</p>
    </article>

    <article v-else-if="loading" class="panel" aria-live="polite">
      <p>Álláshirdetés betöltése...</p>
    </article>

    <article v-else-if="error" class="panel" role="alert" aria-live="assertive">
      <h2>Hiba történt</h2>
      <p>{{ error }}</p>
    </article>

    <EmptyState
      v-else
      title="A hirdetés nem található"
      message="Lehet, hogy törölve lett vagy érvénytelen az URL."
    />
  </section>
</template>

<style scoped>
.detail {
  display: grid;
  gap: 0.85rem;
}

.back-btn {
  justify-self: start;
}

.salary {
  font-weight: 700;
}

.apply-box {
  border-top: 1px solid var(--color-border);
  padding-top: 0.75rem;
  display: grid;
  gap: 0.6rem;
}

.actions {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.toast {
  color: var(--color-primary);
  font-weight: 600;
}
</style>
