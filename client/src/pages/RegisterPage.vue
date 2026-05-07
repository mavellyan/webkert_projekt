<script setup lang="ts">
import { onBeforeUnmount, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { validateEmail, validateFullName, validatePassword } from '../utils/validation'

const auth = useAuthStore()
const router = useRouter()

onBeforeUnmount(() => {
  auth.error = ''
})

const form = reactive({
  fullName: '',
  email: '',
  password: '',
  confirmPassword: '',
  role: 'jobseeker'
})

const validationErrors = ref<Record<string, string>>({})

function validateForm(): boolean {
  validationErrors.value = {}

  const fullNameError = validateFullName(form.fullName)
  if (fullNameError) {
    validationErrors.value.fullName = fullNameError
  }

  const emailError = validateEmail(form.email)
  if (emailError) {
    validationErrors.value.email = emailError
  }

  const passwordError = validatePassword(form.password)
  if (passwordError) {
    validationErrors.value.password = passwordError
  }

  if (!form.confirmPassword) {
    validationErrors.value.confirmPassword = 'Jelszó megerősítése szükséges'
  } else if (form.password !== form.confirmPassword) {
    validationErrors.value.confirmPassword = 'A jelszavak nem egyeznek'
  }

  return Object.keys(validationErrors.value).length === 0
}

async function submit(): Promise<void> {
  if (!validateForm()) {
    return
  }

  try {
    await auth.register({
      email: form.email,
      password: form.password,
      fullName: form.fullName,
      role: form.role
    })

    if (auth.isAuthenticated) {
      await router.push('/dashboard')
    }
  } catch {
    // Hiba kezelése az auth store-ban
  }
}
</script>

<template>
  <section class="page">
    <article class="panel auth-card" aria-labelledby="register-title">
      <h2 id="register-title">Regisztráció</h2>

      <form class="form" @submit.prevent="submit">
        <label>
          <span>Teljes név</span>
          <input
            v-model="form.fullName"
            class="input"
            type="text"
            required
            autocomplete="name"
            :aria-invalid="!!validationErrors.fullName"
          />
          <p v-if="validationErrors.fullName" class="error-text">{{ validationErrors.fullName }}</p>
        </label>

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
            autocomplete="new-password"
            :aria-invalid="!!validationErrors.password"
          />
          <p v-if="validationErrors.password" class="error-text">{{ validationErrors.password }}</p>
        </label>

        <label>
          <span>Jelszó megerősítése</span>
          <input
            v-model="form.confirmPassword"
            class="input"
            type="password"
            required
            minlength="6"
            autocomplete="new-password"
            :aria-invalid="!!validationErrors.confirmPassword"
          />
          <p v-if="validationErrors.confirmPassword" class="error-text">
            {{ validationErrors.confirmPassword }}
          </p>
        </label>

        <label>
          <span>Szerepkör</span>
          <select v-model="form.role" class="select">
            <option value="jobseeker">Álláskereső</option>
            <option value="recruiter">Álláshirdető</option>
          </select>
        </label>

        <div v-if="auth.error" class="error-box" role="alert">
          {{ auth.error }}
        </div>

        <button class="btn btn-primary" type="submit" :disabled="auth.loading">
          {{ auth.loading ? 'Regisztrálás...' : 'Regisztrálás' }}
        </button>
      </form>

      <p style="margin-top: 1rem; text-align: center; font-size: 0.9rem">
        Van már fiókod?
        <RouterLink to="/login" class="link">Jelentkezz be</RouterLink>
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

