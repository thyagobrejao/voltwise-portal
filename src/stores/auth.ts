import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authService } from '@/services/api'

export interface User {
  id: string
  name: string
  email: string
  organization: string
  avatar?: string
}

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const token = ref<string | null>(localStorage.getItem('access_token'))
  const loading = ref(false)
  const error = ref<string | null>(null)

  const isAuthenticated = computed(() => !!token.value && !!user.value)

  async function login(email: string, password: string) {
    loading.value = true
    error.value = null
    try {
      const response = await authService.login(email, password)
      token.value = response.accessToken
      user.value = response.user
      localStorage.setItem('access_token', response.accessToken)
      localStorage.setItem('refresh_token', response.refreshToken)
    } catch (err) {
      error.value = 'invalid_credentials'
      throw err
    } finally {
      loading.value = false
    }
  }

  async function register(data: {
    name: string
    email: string
    organization: string
    password: string
  }) {
    loading.value = true
    error.value = null
    try {
      const response = await authService.register(data)
      token.value = response.accessToken
      user.value = response.user
      localStorage.setItem('access_token', response.accessToken)
      localStorage.setItem('refresh_token', response.refreshToken)
    } catch (err) {
      error.value = 'registration_failed'
      throw err
    } finally {
      loading.value = false
    }
  }

  function logout() {
    user.value = null
    token.value = null
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
  }

  /**
   * Re-hydrate the user profile from the stored JWT on page load.
   * If the token is expired, the interceptor will auto-refresh or redirect.
   */
  async function initialize() {
    if (token.value) {
      try {
        user.value = await authService.getMe()
      } catch {
        // Token invalid or expired and refresh also failed → clean up.
        logout()
      }
    }
  }

  return { user, token, loading, error, isAuthenticated, login, register, logout, initialize }
})
