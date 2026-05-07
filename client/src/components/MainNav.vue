<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const auth = useAuthStore()

const links = computed(() => {
  const base = [
    { to: '/', label: 'Főoldal' },
    { to: '/jobs', label: 'Állások' }
  ]

  if (auth.isAuthenticated) {
    base.push({ to: '/dashboard', label: 'Dashboard' })
  }

  if (auth.role === 'jobseeker' || auth.role === 'admin') {
    base.push({ to: '/applications', label: 'Jelentkezéseim' })
    base.push({ to: '/saved-jobs', label: 'Mentett állások' })
  }

  if (auth.role === 'recruiter' || auth.role === 'admin') {
    base.push({ to: '/recruiter', label: 'Álláshirdető' })
  }

  if (auth.role === 'admin') {
    base.push({ to: '/admin', label: 'Admin' })
  }

  return base
})
</script>

<template>
  <nav aria-label="Főmenü">
    <ul class="menu-list">
      <li v-for="item in links" :key="item.to">
        <RouterLink
          :to="item.to"
          class="menu-link"
          :class="{ 'menu-link-active': $route.path === item.to }"
        >
          {{ item.label }}
        </RouterLink>
      </li>
    </ul>
  </nav>
</template>

<style scoped>
.menu-list {
  list-style: none;
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin: 0;
  padding: 0;
}

.menu-link {
  display: inline-flex;
  align-items: center;
  min-height: 2.75rem;
  padding: 0 0.9rem;
  border-radius: 999px;
  text-decoration: none;
  color: var(--color-text);
  border: 1px solid var(--color-border);
  background: var(--color-surface);
  font-weight: 600;
}

.menu-link-active {
  background: var(--color-primary);
  color: #fff;
  border-color: var(--color-primary);
}
</style>
