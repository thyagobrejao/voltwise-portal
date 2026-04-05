<script setup lang="ts">
import { ref } from 'vue'
import { useRouter, RouterLink } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/stores/auth'
import { BoltIcon, EyeIcon, EyeSlashIcon } from '@heroicons/vue/24/outline'

const { t } = useI18n()
const router = useRouter()
const authStore = useAuthStore()

const name = ref('')
const email = ref('')
const organization = ref('')
const password = ref('')
const confirm = ref('')
const showPassword = ref(false)
const showConfirm = ref(false)
const errorMsg = ref('')

async function handleRegister() {
  errorMsg.value = ''
  if (password.value !== confirm.value) {
    errorMsg.value = t('auth.register.passwordMismatch')
    return
  }
  try {
    await authStore.register({
      name: name.value,
      email: email.value,
      organization: organization.value,
      password: password.value
    })
    router.push({ name: 'overview' })
  } catch {
    errorMsg.value = t('auth.register.error')
  }
}
</script>

<template>
  <div class="min-h-screen bg-slate-50 flex items-center justify-center p-4 py-12">
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
          <h1 class="text-xl font-bold text-slate-900">{{ t('auth.register.title') }}</h1>
          <p class="text-sm text-slate-500 mt-1">{{ t('auth.register.subtitle') }}</p>
        </div>

        <!-- Error -->
        <div
          v-if="errorMsg"
          class="mb-4 px-4 py-3 rounded-xl bg-red-50 border border-red-100 text-red-700 text-sm"
        >
          {{ errorMsg }}
        </div>

        <form class="space-y-4" @submit.prevent="handleRegister">
          <!-- Name -->
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1.5">
              {{ t('auth.register.name') }}
            </label>
            <input
              v-model="name"
              type="text"
              required
              autocomplete="name"
              class="input-field"
              placeholder="João Silva"
            />
          </div>

          <!-- Email -->
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1.5">
              {{ t('auth.register.email') }}
            </label>
            <input
              v-model="email"
              type="email"
              required
              autocomplete="email"
              class="input-field"
              placeholder="joao@hotel.com"
            />
          </div>

          <!-- Organization -->
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1.5">
              {{ t('auth.register.organization') }}
            </label>
            <input
              v-model="organization"
              type="text"
              required
              class="input-field"
              placeholder="Hotel Exemplo"
            />
          </div>

          <!-- Password -->
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1.5">
              {{ t('auth.register.password') }}
            </label>
            <div class="relative">
              <input
                v-model="password"
                :type="showPassword ? 'text' : 'password'"
                required
                minlength="6"
                autocomplete="new-password"
                class="input-field pr-10"
                placeholder="••••••••"
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

          <!-- Confirm password -->
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1.5">
              {{ t('auth.register.confirm') }}
            </label>
            <div class="relative">
              <input
                v-model="confirm"
                :type="showConfirm ? 'text' : 'password'"
                required
                autocomplete="new-password"
                class="input-field pr-10"
                placeholder="••••••••"
              />
              <button
                type="button"
                class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                @click="showConfirm = !showConfirm"
              >
                <EyeSlashIcon v-if="showConfirm" class="w-4 h-4" />
                <EyeIcon v-else class="w-4 h-4" />
              </button>
            </div>
          </div>

          <!-- Submit -->
          <button
            type="submit"
            :disabled="authStore.loading"
            class="btn-primary w-full justify-center py-3 text-sm"
          >
            <svg v-if="authStore.loading" class="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            {{ authStore.loading ? t('auth.register.loading') : t('auth.register.button') }}
          </button>
        </form>

        <!-- Terms -->
        <p class="mt-4 text-xs text-slate-500 text-center">
          {{ t('auth.register.terms') }}
          <a href="#" class="text-primary-600 hover:underline">{{ t('auth.register.termsLink') }}</a>
          {{ t('auth.register.and') }}
          <a href="#" class="text-primary-600 hover:underline">{{ t('auth.register.privacyLink') }}</a>.
        </p>

        <!-- Login link -->
        <p class="mt-4 text-center text-sm text-slate-500">
          {{ t('auth.register.hasAccount') }}
          <RouterLink to="/login" class="font-semibold text-primary-600 hover:text-primary-700 transition-colors">
            {{ t('auth.register.login') }}
          </RouterLink>
        </p>
      </div>
    </div>
  </div>
</template>
