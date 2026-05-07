<script setup lang="ts">
import JobCard from './JobCard.vue'
import type { JobPost } from '../types'

defineProps<{ jobs: JobPost[] }>()
</script>

<template>
  <section aria-label="Allaslista" class="grid-auto jobs-list">
    <JobCard v-for="job in jobs" :key="job.id" :job="job" />
  </section>
</template>
