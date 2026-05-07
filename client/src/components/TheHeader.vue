<script setup lang="ts">
import { useRouter } from 'vue-router'
import MainNav from './MainNav.vue'
import { useAuthStore } from '../stores/auth'

const auth = useAuthStore()
const router = useRouter()

async function logout(): Promise<void> {
  await auth.logout()
  void router.push('/')
}
</script>

<template>
  <header class="site-header panel" aria-label="Fejléc">
    <div>
      <p class="eyebrow">JobFinder</p>
      <h1 class="brand-title">Álláskereső platform</h1>
    </div>

    <MainNav />

    <div class="actions">
      <template v-if="auth.isAuthenticated">
        <p class="user-info">Belépve: {{ auth.user?.fullName }} ({{ auth.roleLabel }})</p>
        <button class="btn btn-secondary" type="button" @click="logout" :disabled="auth.loading">
          {{ auth.loading ? 'Kijelentkezés...' : 'Kijelentkezés' }}
        </button>
      </template>
      <template v-else>
        <RouterLink class="btn btn-secondary btn-link" to="/login">Bejelentkezés</RouterLink>
        <RouterLink class="btn btn-primary btn-link" to="/register">Regisztráció</RouterLink>
      </template>
    </div>
  </header>
</template>

<style scoped>
.site-header {
  display: grid;
  gap: 1rem;
}

.brand-title {
  font-size: clamp(1.35rem, 3.8vw, 2rem);
}

.actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  align-items: center;
}

.btn-link {
  text-decoration: none;
  display: inline-flex;
  align-items: center;
}

.user-info {
  color: var(--color-muted);
  margin-right: 0.25rem;
}

button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

@media (min-width: 48rem) {
  .site-header {
    grid-template-columns: 1fr auto;
    align-items: center;
  }

  nav {
    justify-self: end;
  }

  .actions {
    grid-column: 1 / -1;
  }
}

@media (min-width: 72rem) {
  .site-header {
    grid-template-columns: auto 1fr auto;
  }

  .actions {
    grid-column: auto;
    justify-content: flex-end;
  }
}
</style>
