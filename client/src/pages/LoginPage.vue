<script setup lang="ts">
import { onBeforeUnmount, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { validateEmail, validatePassword } from '../utils/validation'

const auth = useAuthStore()
const route = useRoute()
const router = useRouter()

onBeforeUnmount(() => {
  auth.error = ''
})

const form = reactive({
  email: '',
  password: ''
})

const validationErrors = ref<Record<string, string>>({})

function validateForm(): boolean {
  validationErrors.value = {}

  const emailError = validateEmail(form.email)
  if (emailError) {
    validationErrors.value.email = emailError
  }

  const passwordError = validatePassword(form.password)
  if (passwordError) {
    validationErrors.value.password = passwordError
  }

  return Object.keys(validationErrors.value).length === 0
}

async function submit(): Promise<void> {
  if (!validateForm()) {
    return
  }

  try {
    await auth.login({
      email: form.email,
      password: form.password
    })

    if (auth.isAuthenticated) {
      const redirectTarget = typeof route.query.redirect === 'string' ? route.query.redirect : '/dashboard'
      await router.push(redirectTarget)
    }
  } catch {
    // Hiba kezelése az auth store-ban
  }
}
</script>

<template>
  <section class="page">
    <article class="panel auth-card" aria-labelledby="login-title">
      <h2 id="login-title">Bejelentkezés</h2>

      <form class="form" @submit.prevent="submit">
        <label>
          <span>Email</span>
          <input
            v-model="form.email"
            class="input"
            type="email"
            required
            autocomplete="email"
            :aria-invalid="!!validationErrors.email"
          />
          <p v-if="validationErrors.email" class="error-text">{{ validationErrors.email }}</p>
        </label>

        <label>
          <span>Jelszó</span>
          <input
            v-model="form.password"
            class="input"
            type="password"
            required
            minlength="6"
            autocomplete="current-password"
            :aria-invalid="!!validationErrors.password"
          />
          <p v-if="validationErrors.password" class="error-text">{{ validationErrors.password }}</p>
        </label>

        <div v-if="auth.error" class="error-box" role="alert">
          {{ auth.error }}
        </div>

        <button class="btn btn-primary" type="submit" :disabled="auth.loading">
          {{ auth.loading ? 'Belépés...' : 'Belépés' }}
        </button>
      </form>

      <p style="margin-top: 1rem; text-align: center; font-size: 0.9rem">
        Még nincs fiókod?
        <RouterLink to="/register" class="link">Regisztrálj most</RouterLink>
      </p>
    </article>
  </section>
</template>

<style scoped>
.page {
  display: flex;
  justify-content: center;
  padding: 2rem 1rem;
}

.auth-card {
  max-width: 34rem;
  width: 100%;
}

.form {
  margin-top: 1rem;
  display: grid;
  gap: 0.85rem;
}

label {
  display: grid;
  gap: 0.4rem;
}

span {
  font-weight: 600;
}

.error-text {
  color: #d32f2f;
  font-size: 0.875rem;
  margin: 0;
}

.error-box {
  padding: 0.75rem;
  background-color: #ffebee;
  color: #c62828;
  border-left: 3px solid #d32f2f;
  border-radius: 3px;
  font-size: 0.9rem;
}

.link {
  color: var(--color-primary);
  text-decoration: none;
  font-weight: 500;
}

.link:hover {
  text-decoration: underline;
}

button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>

