<script setup lang="ts">
import { ref, onUnmounted } from 'vue'
import { useRouter, RouterLink } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/stores/auth'
import { BoltIcon, EyeIcon, EyeSlashIcon } from '@heroicons/vue/24/outline'
import axios from 'axios'

const { t } = useI18n()
const router = useRouter()
const authStore = useAuthStore()

const email = ref('')
const password = ref('')
const remember = ref(false)
const showPassword = ref(false)
const errorMsg = ref('')

// ── Brute-force protection (client-side) ──────────────────────────────────
const MAX_ATTEMPTS = 5
const BASE_LOCKOUT_SECONDS = 30

const failedAttempts = ref(0)
const lockedUntil = ref(0)
const lockoutRemaining = ref(0)
let lockoutTimer: ReturnType<typeof setInterval> | null = null

function startLockoutCountdown(seconds: number) {
  lockedUntil.value = Date.now() + seconds * 1000
  updateRemaining()

  if (lockoutTimer) clearInterval(lockoutTimer)
  lockoutTimer = setInterval(() => {
    updateRemaining()
    if (lockoutRemaining.value <= 0) {
      clearInterval(lockoutTimer!)
      lockoutTimer = null
    }
  }, 1000)
}

function updateRemaining() {
  lockoutRemaining.value = Math.max(0, Math.ceil((lockedUntil.value - Date.now()) / 1000))
}

const isLockedOut = () => lockoutRemaining.value > 0

onUnmounted(() => {
  if (lockoutTimer) clearInterval(lockoutTimer)
})

// ── Login handler ─────────────────────────────────────────────────────────
async function handleLogin() {
  errorMsg.value = ''

  if (isLockedOut()) {
    errorMsg.value = t('auth.login.lockedOut', { seconds: lockoutRemaining.value })
    return
  }

  try {
    await authStore.login(email.value, password.value)
    // Reset on success
    failedAttempts.value = 0
    lockedUntil.value = 0
    lockoutRemaining.value = 0
    router.push({ name: 'overview' })
  } catch (err) {
    if (axios.isAxiosError(err)) {
      const status = err.response?.status

      if (status === 429) {
        // Server-side rate limit hit — read Retry-After header
        const retryAfter = parseInt(err.response?.headers?.['retry-after'] || '60', 10)
        startLockoutCountdown(retryAfter)
        errorMsg.value = t('auth.login.tooManyAttempts', { seconds: retryAfter })
        return
      }

      if (status === 401) {
        failedAttempts.value++

        if (failedAttempts.value >= MAX_ATTEMPTS) {
          const lockoutSeconds = BASE_LOCKOUT_SECONDS * Math.pow(2, Math.floor(failedAttempts.value / MAX_ATTEMPTS) - 1)
          startLockoutCountdown(lockoutSeconds)
          errorMsg.value = t('auth.login.lockedOut', { seconds: lockoutSeconds })
          failedAttempts.value = 0
          return
        }

        const remaining = MAX_ATTEMPTS - failedAttempts.value
        errorMsg.value = t('auth.login.invalidCredentials', { remaining })
        return
      }
    }

    errorMsg.value = t('auth.login.error')
  }
}
</script>

<template>
  <div class="min-h-screen bg-slate-50 flex items-center justify-center p-4">
    <div class="w-full max-w-sm">
      <!-- Logo -->
      <div class="text-center mb-8">
        <RouterLink to="/" class="inline-flex items-center gap-2">
          <div class="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center">
            <BoltIcon class="w-6 h-6 text-white" />
          </div>
          <span class="text-xl font-bold text-slate-900">VoltWise</span>
        </RouterLink>
      </div>

      <!-- Card -->
      <div class="bg-white rounded-2xl border border-slate-100 shadow-card p-8">
        <div class="mb-6">
          <h1 class="text-xl font-bold text-slate-900">{{ t('auth.login.title') }}</h1>
          <p class="text-sm text-slate-500 mt-1">{{ t('auth.login.subtitle') }}</p>
        </div>

        <!-- Error -->
        <div
          v-if="errorMsg"
          class="mb-4 px-4 py-3 rounded-xl bg-red-50 border border-red-100 text-red-700 text-sm flex items-start gap-2"
        >
          <svg class="w-5 h-5 flex-shrink-0 mt-0.5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
          <span>{{ errorMsg }}</span>
        </div>

        <!-- Lockout warning -->
        <div
          v-if="lockoutRemaining > 0"
          class="mb-4 px-4 py-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-sm flex items-center gap-2"
        >
          <svg class="w-5 h-5 flex-shrink-0 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>{{ t('auth.login.waitMessage', { seconds: lockoutRemaining }) }}</span>
        </div>

        <form class="space-y-4" @submit.prevent="handleLogin">
          <!-- Email -->
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1.5">
              {{ t('auth.login.email') }}
            </label>
            <input
              v-model="email"
              type="email"
              required
              autocomplete="email"
              class="input-field"
              placeholder="joao@hotel.com"
              :disabled="isLockedOut()"
            />
          </div>

          <!-- Password -->
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1.5">
              {{ t('auth.login.password') }}
            </label>
            <div class="relative">
              <input
                v-model="password"
                :type="showPassword ? 'text' : 'password'"
                required
                autocomplete="current-password"
                class="input-field pr-10"
                placeholder="••••••••"
                :disabled="isLockedOut()"
              />
              <button
                type="button"
                class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                @click="showPassword = !showPassword"
              >
                <EyeSlashIcon v-if="showPassword" class="w-4 h-4" />
                <EyeIcon v-else class="w-4 h-4" />
              </button>
            </div>
          </div>

          <!-- Remember / forgot -->
          <div class="flex items-center justify-between">
            <label class="flex items-center gap-2 cursor-pointer">
              <input
                v-model="remember"
                type="checkbox"
                class="w-4 h-4 rounded text-primary-600 border-slate-300 focus:ring-primary-500"
              />
              <span class="text-sm text-slate-600">{{ t('auth.login.remember') }}</span>
            </label>
            <a href="#" class="text-sm font-medium text-primary-600 hover:text-primary-700 transition-colors">
              {{ t('auth.login.forgot') }}
            </a>
          </div>

          <!-- Submit -->
          <button
            type="submit"
            :disabled="authStore.loading || isLockedOut()"
            class="btn-primary w-full justify-center py-3 text-sm"
          >
            <svg v-if="authStore.loading" class="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            {{ authStore.loading ? t('auth.login.loading') : t('auth.login.button') }}
          </button>
        </form>

        <!-- Register link -->
        <p class="mt-5 text-center text-sm text-slate-500">
          {{ t('auth.login.noAccount') }}
          <RouterLink to="/register" class="font-semibold text-primary-600 hover:text-primary-700 transition-colors">
            {{ t('auth.login.register') }}
          </RouterLink>
        </p>
      </div>
    </div>
  </div>
</template>
