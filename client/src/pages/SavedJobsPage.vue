<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useJobseekerStore } from '../stores/jobseeker'

const auth = useAuthStore()
const router = useRouter()
const jobseekerStore = useJobseekerStore()

onMounted(async () => {
  if (!auth.userId) {
    return
  }

  await jobseekerStore.loadAll(auth.userId)
})

async function removeItem(id: string): Promise<void> {
  if (!window.confirm('Biztosan törlöd a mentett állást?')) {
    return
  }

  await jobseekerStore.removeSaved(id)
}

function viewJobDetails(jobId: string): void {
  router.push(`/jobs/${jobId}`)
}
</script>

<template>
  <section class="page">
    <article v-if="jobseekerStore.toast" class="panel toast" aria-live="polite">
      {{ jobseekerStore.toast }}
    </article>

    <article class="panel" aria-labelledby="saved-title">
      <h2 id="saved-title">Mentett állásaim</h2>

      <p v-if="jobseekerStore.loading">Betöltés...</p>
      <p v-else-if="jobseekerStore.error" class="error">{{ jobseekerStore.error }}</p>

      <ul v-else-if="jobseekerStore.savedJobs.length > 0" class="list">
        <li v-for="item in jobseekerStore.savedJobs" :key="item.id" class="row">
          <div>
            <strong>{{ item.job?.title || 'Törölt álláshirdetés' }}</strong>
            <p class="muted">
              {{ item.job?.companyName || 'Ismeretlen cég' }}
              <span v-if="item.job">• {{ item.job.city }}</span>
            </p>
          </div>

          <div class="actions">
            <button
              v-if="item.job"
              class="btn btn-primary btn-small"
              type="button"
              @click="viewJobDetails(item.job.id)"
            >
              Megtekintés
            </button>
            <button class="btn btn-secondary btn-small" type="button" @click="removeItem(item.id)">
              Törlés
            </button>
          </div>
        </li>
      </ul>

      <p v-else>Még nincs mentett állásod.</p>
    </article>
  </section>
</template>

<style scoped>
.list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 0.65rem;
}

.row {
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: 0.75rem;
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  align-items: center;
}

.muted {
  margin: 0.3rem 0 0;
  color: var(--color-muted);
}

.error {
  color: var(--color-danger);
}

.toast {
  border-color: var(--color-primary);
}

.actions {
  display: flex;
  gap: 0.5rem;
}

.btn-small {
  padding: 0.4rem 0.75rem;
  font-size: 0.85rem;
}
</style>
