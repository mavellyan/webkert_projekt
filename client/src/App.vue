<script setup lang="ts">
import { onMounted } from 'vue'
import { RouterView } from 'vue-router'
import SkipLink from './components/SkipLink.vue'
import TheHeader from './components/TheHeader.vue'
import { useAuthStore } from './stores/auth'

const auth = useAuthStore()

onMounted(() => {
  // localStorage-ből betöltés az alkalmazás indulásakor
  auth.initializeFromStorage()
})
</script>

<template>
  <SkipLink />
  <div class="app-shell">
    <TheHeader />

    <main id="main-content" class="main-content" tabindex="-1">
      <RouterView />
    </main>

    <footer class="site-footer" aria-label="Labléc">
      <p>© 2026 JobFinder - Minden jog fenntartva</p>
    </footer>
  </div>
</template>
