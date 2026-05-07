<script setup lang="ts">
import type { JobPost } from '../types'
import { translateWorkMode } from '../utils/labels'

defineProps<{ job: JobPost }>()
</script>

<template>
  <article class="panel job-card" aria-label="Álláshirdetés kártya">
    <p class="eyebrow">{{ job.categoryName }} - {{ translateWorkMode(job.workMode) }}</p>
    <h3>{{ job.title }}</h3>
    <p class="company">{{ job.companyName }} - {{ job.city }}</p>
    <p>{{ job.description }}</p>
    <p class="salary">{{ job.salaryMin.toLocaleString('hu-HU') }} - {{ job.salaryMax.toLocaleString('hu-HU') }} HUF</p>
    <RouterLink class="btn btn-secondary details" :to="`/jobs/${job.id}`">Részletek</RouterLink>
  </article>
</template>

<style scoped>
.job-card {
  display: grid;
  gap: 0.75rem;
}

.company {
  color: var(--color-muted);
}

.salary {
  font-weight: 700;
}

.details {
  justify-self: start;
  display: inline-flex;
  align-items: center;
  text-decoration: none;
}
</style>
