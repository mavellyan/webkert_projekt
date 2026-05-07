<script setup lang="ts">
import { onMounted } from 'vue'
import { useAuthStore } from '../stores/auth'
import { useJobseekerStore } from '../stores/jobseeker'
import { translateApplicationStatus } from '../utils/labels'

const auth = useAuthStore()
const jobseekerStore = useJobseekerStore()

onMounted(async () => {
  if (!auth.userId) {
    return
  }

  await jobseekerStore.loadAll(auth.userId)
})
</script>

<template>
  <section class="page">
    <article v-if="jobseekerStore.toast" class="panel toast" aria-live="polite">
      {{ jobseekerStore.toast }}
    </article>

    <article class="panel" aria-labelledby="applications-title">
      <h2 id="applications-title">Jelentkezéseim</h2>

      <p v-if="jobseekerStore.loading">Betöltés...</p>
      <p v-else-if="jobseekerStore.error" class="error">{{ jobseekerStore.error }}</p>

      <ul v-else-if="jobseekerStore.applications.length > 0" class="list">
        <li v-for="item in jobseekerStore.applications" :key="item.id" class="row">
          <div>
            <strong>{{ item.jobTitle || 'Ismeretlen állás' }}</strong>
            <p class="muted">Állapot: {{ translateApplicationStatus(item.status) }} • Dátum: {{ new Date(item.createdAt).toLocaleDateString('hu-HU') }}</p>
          </div>
        </li>
      </ul>

      <p v-else>Nincs még jelentkezésed.</p>
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
</style>
