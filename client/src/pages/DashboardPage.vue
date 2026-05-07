<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAuthStore } from '../stores/auth'
import { jobsService } from '../services/jobsService'
import { translateWorkMode } from '../utils/labels'

const auth = useAuthStore()
const loading = ref(false)
const suggestions = ref([] as Array<{ id: string; title: string; companyName: string; workMode: string }>)

onMounted(async () => {
  loading.value = true
  try {
    const list = await jobsService.list({ query: '', categoryId: '', workMode: '', sortBy: 'newest' })
    suggestions.value = list.slice(0, 3).map((j) => ({ id: j.id, title: j.title, companyName: j.companyName, workMode: j.workMode }))
  } catch (err) {
    // ignore — suggestions are optional
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <section class="page">
    <article class="panel" aria-labelledby="dashboard-title">
      <h2 id="dashboard-title">Felhasználói dashboard</h2>
      <p>Üdv, {{ auth.user?.fullName }}! Készen állsz belevetni magad a munka világába?</p>

      <div class="links">
        <RouterLink class="btn btn-secondary btn-link" to="/applications">Jelentkezéseim</RouterLink>
        <RouterLink class="btn btn-secondary btn-link" to="/saved-jobs">Mentett állások</RouterLink>
      </div>

      <section class="suggestions" aria-labelledby="suggestions-title">
        <h3 id="suggestions-title">Ajánlott állások</h3>
        <p v-if="loading" class="loading">Betöltés...</p>
        <div v-else-if="suggestions.length > 0" class="suggestion-grid">
          <RouterLink
            v-for="job in suggestions"
            :key="job.id"
            :to="`/jobs/${job.id}`"
            class="suggestion-card"
          >
            <h4>{{ job.title }}</h4>
            <p class="company">{{ job.companyName }}</p>
            <p class="work-mode">{{ translateWorkMode(job.workMode) }}</p>
          </RouterLink>
        </div>
        <p v-else class="empty">Nincs ajánlott állás jelenleg.</p>
      </section>
    </article>
  </section>
</template>

<style scoped>
.links {
  margin-top: 1rem;
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.btn-link {
  text-decoration: none;
  display: inline-flex;
  align-items: center;
}

.suggestions {
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid var(--color-border);
}

.loading,
.empty {
  color: var(--color-muted);
  margin: 0.5rem 0;
}

.suggestion-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
  margin-top: 1rem;
}

.suggestion-card {
  display: block;
  padding: 1rem;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-surface);
  text-decoration: none;
  color: inherit;
  transition: all 0.2s ease;
}

.suggestion-card:hover {
  border-color: var(--color-primary);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.suggestion-card h4 {
  margin: 0 0 0.5rem 0;
  color: var(--color-text);
  font-size: 1rem;
  font-weight: 600;
  line-height: 1.4;
}

.suggestion-card .company {
  margin: 0.25rem 0;
  color: var(--color-muted);
  font-size: 0.9rem;
}

.suggestion-card .work-mode {
  margin: 0.5rem 0 0;
  color: var(--color-primary);
  font-size: 0.85rem;
  font-weight: 500;
}
</style>
