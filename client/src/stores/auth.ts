import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import type { UserRole } from '../types'
import { loginUser, registerUser, logoutUser, type LoginRequest, type RegisterRequest } from '../services/authService'

export interface AuthUser {
  id: string
  email: string
  fullName: string
  role: UserRole
}

export const useAuthStore = defineStore('auth', () => {
  const user = ref<AuthUser | null>(null)
  const loading = ref(false)
  const error = ref<string>('')
  const token = ref<string>('')

  // localStorage-ból betöltés inicializáláskor
  function initializeFromStorage(): void {
    const storedToken = localStorage.getItem('auth_token')
    const storedUser = localStorage.getItem('auth_user')

    if (storedToken && storedUser) {
      try {
        token.value = storedToken
        user.value = JSON.parse(storedUser) as AuthUser
      } catch {
        // Sérült localStorage, tisztítás
        localStorage.removeItem('auth_token')
        localStorage.removeItem('auth_user')
      }
    }
  }

  async function login(credentials: LoginRequest): Promise<void> {
    loading.value = true
    error.value = ''

    try {
      const response = await loginUser(credentials)

      token.value = response.token
      user.value = {
        id: response.user.id,
        email: response.user.email,
        fullName: response.user.fullName,
        role: response.user.role as UserRole
      }

      // Mentés localStorage-be
      localStorage.setItem('auth_token', response.token)
      localStorage.setItem('auth_user', JSON.stringify(user.value))
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Bejelentkezési hiba'
      token.value = ''
      user.value = null
    } finally {
      loading.value = false
    }
  }

  async function register(data: RegisterRequest): Promise<void> {
    loading.value = true
    error.value = ''

    try {
      const response = await registerUser(data)

      token.value = response.token
      user.value = {
        id: response.user.id,
        email: response.user.email,
        fullName: response.user.fullName,
        role: response.user.role as UserRole
      }

      // Mentés localStorage-be
      localStorage.setItem('auth_token', response.token)
      localStorage.setItem('auth_user', JSON.stringify(user.value))
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Regisztrációs hiba'
      token.value = ''
      user.value = null
    } finally {
      loading.value = false
    }
  }

  async function logout(): Promise<void> {
    loading.value = true

    try {
      await logoutUser()
    } catch {
      // Logout végpont hiba, de még is ki kell jelentkezni a frontend-en
    } finally {
      user.value = null
      token.value = ''
      error.value = ''

      // localStorage törlése
      localStorage.removeItem('auth_token')
      localStorage.removeItem('auth_user')

      loading.value = false
    }
  }

  const isAuthenticated = computed(() => !!user.value)
  const role = computed(() => user.value?.role ?? 'guest')
  const userId = computed(() => user.value?.id ?? '')
  const userEmail = computed(() => user.value?.email ?? '')

  function translateRole(roleString: string): string {
    const roleMap: Record<string, string> = {
      jobseeker: 'Álláskereső',
      recruiter: 'Recruiter',
      admin: 'Admin',
      guest: 'Vendég'
    }
    return roleMap[roleString] ?? roleString
  }

  const roleLabel = computed(() => translateRole(role.value))

  return {
    user,
    token,
    loading,
    error,
    isAuthenticated,
    role,
    roleLabel,
    userId,
    userEmail,
    initializeFromStorage,
    login,
    register,
    logout
  }
})

