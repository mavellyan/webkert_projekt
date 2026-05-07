<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useJobsStore } from '../stores/jobs'
import JobsList from '../components/JobsList.vue'
import SkeletonLoader from '../components/SkeletonLoader.vue'

const jobsStore = useJobsStore()

onMounted(async () => {
  if (jobsStore.jobs.length === 0) {
    await jobsStore.fetchJobs()
  }
})

const featured = computed(() => jobsStore.filteredJobs.slice(0, 3))
</script>

<template>
  <section class="page">
    <article class="panel hero" aria-labelledby="home-title">
      <p class="eyebrow">Karrierplatform</p>
      <h2 id="home-title">Találd meg a következő lehetőséged</h2>
      <p>
        A JobFinder váz minimum követelményekkel készült: routing, responsive layout,
        akadálymentes alapok, valamint keresés/szűrés/rendezés támogatással.
      </p>
      <RouterLink class="btn btn-primary hero-link" to="/jobs">Állások megtekintése</RouterLink>
    </article>

    <section aria-label="Kiemelt állások">
      <h2>Kiemelt állások</h2>
      <SkeletonLoader v-if="jobsStore.loading" />
      <JobsList v-else :jobs="featured" />
    </section>
  </section>
</template>

<style scoped>
.hero {
  display: grid;
  gap: 1rem;
}

.hero-link {
  justify-self: start;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
}
</style>
