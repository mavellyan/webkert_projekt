<script setup lang="ts">
import { onMounted } from 'vue'
import { useAdminStore } from '../stores/admin'
import { translateJobStatus, translateRole } from '../utils/labels'

const adminStore = useAdminStore()

onMounted(async () => {
  await adminStore.loadData()
})

async function toggleUser(userId: string, next: boolean): Promise<void> {
  await adminStore.toggleUserActive(userId, next)
}

async function changeJobStatus(jobId: string, value: string): Promise<void> {
  if (value === 'draft' || value === 'published' || value === 'closed') {
    await adminStore.setJobStatus(jobId, value)
  }
}
</script>

<template>
  <section class="page admin-layout">
    <h2 id="admin-title">Admin felület</h2>

    <p v-if="adminStore.toast" class="panel toast" aria-live="polite">{{ adminStore.toast }}</p>

    <article v-if="adminStore.error" class="panel error" role="alert" aria-live="assertive">
      <h3>Hiba történt</h3>
      <p>{{ adminStore.error }}</p>
    </article>

    <article class="panel section-card" aria-labelledby="users-title">
      <h3 id="users-title">Felhasználó moderáció</h3>

      <p v-if="adminStore.loading">Betöltés...</p>

      <ul v-else class="entity-list">
        <li v-for="user in adminStore.users" :key="user.id" class="entity-row">
          <div>
            <strong>{{ user.fullName }}</strong>
            <p class="muted">{{ user.email }} • {{ translateRole(user.role) }}</p>
          </div>

          <button
            class="btn"
            :class="user.isActive ? 'btn-danger' : 'btn-secondary'"
            type="button"
            @click="toggleUser(user.id, !user.isActive)"
          >
            {{ user.isActive ? 'Tiltás' : 'Aktiválás' }}
          </button>
        </li>
      </ul>
    </article>

    <article class="panel section-card" aria-labelledby="jobs-title">
      <h3 id="jobs-title">Hirdetés moderáció</h3>

      <ul class="entity-list">
        <li v-for="job in adminStore.jobs" :key="job.id" class="entity-row">
          <div>
            <strong>{{ job.title }}</strong>
            <p class="muted">{{ job.companyName }} • {{ job.city }}</p>
          </div>

          <label class="status-control">
            <span>Státusz</span>
            <select
              class="select"
              :value="job.status"
              @change="changeJobStatus(job.id, ($event.target as HTMLSelectElement).value)"
            >
              <option value="draft">{{ translateJobStatus('draft') }}</option>
              <option value="published">{{ translateJobStatus('published') }}</option>
              <option value="closed">{{ translateJobStatus('closed') }}</option>
            </select>
          </label>
        </li>
      </ul>
    </article>
  </section>
</template>

<style scoped>
.admin-layout {
  display: grid;
  gap: 1rem;
}

.section-card {
  display: grid;
  gap: 0.8rem;
}

.entity-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 0.65rem;
}

.entity-row {
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: 0.75rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
}

.status-control {
  display: grid;
  gap: 0.35rem;
}

.muted {
  margin: 0.25rem 0 0;
  color: var(--color-muted);
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
</style>
