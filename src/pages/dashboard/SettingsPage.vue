<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/stores/auth'
import { authService } from '@/services/api'
import {
  UserIcon,
  BuildingOfficeIcon,
  BellIcon,
  LockClosedIcon,
  CheckIcon
} from '@heroicons/vue/24/outline'

const { t } = useI18n()
const authStore = useAuthStore()

const activeTab = ref<'profile' | 'organization' | 'notifications' | 'security'>('profile')

const tabs = [
  { key: 'profile', icon: UserIcon },
  { key: 'organization', icon: BuildingOfficeIcon },
  { key: 'notifications', icon: BellIcon },
  { key: 'security', icon: LockClosedIcon }
]

// Profile form
const profileName = ref(authStore.user?.name ?? '')
const profileEmail = ref(authStore.user?.email ?? '')
const profilePhone = ref('')
const profileSaving = ref(false)
const profileSaved = ref(false)

async function saveProfile() {
  profileSaving.value = true
  try {
    const updated = await authService.updateMe({
      name: profileName.value,
      email: profileEmail.value
    })
    authStore.user = updated
    profileSaved.value = true
    setTimeout(() => (profileSaved.value = false), 2500)
  } finally {
    profileSaving.value = false
  }
}

// Org form
const orgName = ref(authStore.user?.organization ?? '')
const orgType = ref('Hotel')
const orgAddress = ref('')
const orgWebsite = ref('')
const orgSaving = ref(false)
const orgSaved = ref(false)

async function saveOrg() {
  orgSaving.value = true
  await new Promise(r => setTimeout(r, 900))
  orgSaving.value = false
  orgSaved.value = true
  setTimeout(() => (orgSaved.value = false), 2500)
}

// Notifications
const notifSessions = ref(true)
const notifOffline = ref(true)
const notifReport = ref(false)
const notifMarketing = ref(false)

const orgTypes = ['Hotel', 'Resort', 'Pousada', 'Hostel', 'Outros']
</script>

<template>
  <div class="space-y-6 max-w-3xl">
    <!-- Page header -->
    <div>
      <h1 class="text-2xl font-bold text-slate-900">{{ t('dashboard.settings.title') }}</h1>
    </div>

    <!-- Tabs -->
    <div class="flex items-center gap-1 bg-slate-100 rounded-xl p-1 w-fit flex-wrap">
      <button
        v-for="tab in tabs"
        :key="tab.key"
        :class="[
          'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all',
          activeTab === tab.key
            ? 'bg-white text-slate-900 shadow-sm'
            : 'text-slate-600 hover:text-slate-900'
        ]"
        @click="activeTab = tab.key as 'profile' | 'organization' | 'notifications' | 'security'"
      >
        <component :is="tab.icon" class="w-4 h-4" />
        {{ t(`dashboard.settings.${tab.key}`) }}
      </button>
    </div>

    <!-- Profile tab -->
    <div v-if="activeTab === 'profile'" class="bg-white rounded-2xl border border-slate-100 shadow-card p-8">
      <h2 class="text-base font-semibold text-slate-900 mb-6">{{ t('dashboard.settings.profileInfo') }}</h2>

      <!-- Avatar -->
      <div class="flex items-center gap-5 mb-8">
        <div class="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-volt-500 flex items-center justify-center">
          <span class="text-white text-2xl font-bold">
            {{ authStore.user?.name?.charAt(0).toUpperCase() }}
          </span>
        </div>
        <div>
          <p class="text-sm font-semibold text-slate-900">{{ authStore.user?.name }}</p>
          <p class="text-xs text-slate-500">{{ authStore.user?.email }}</p>
          <button class="mt-2 text-xs font-medium text-primary-600 hover:text-primary-700 transition-colors">
            Trocar foto
          </button>
        </div>
      </div>

      <form class="space-y-5" @submit.prevent="saveProfile">
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1.5">
              {{ t('dashboard.settings.name') }}
            </label>
            <input v-model="profileName" type="text" class="input-field" />
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1.5">
              {{ t('dashboard.settings.email') }}
            </label>
            <input v-model="profileEmail" type="email" class="input-field" />
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1.5">
              {{ t('dashboard.settings.phone') }}
            </label>
            <input v-model="profilePhone" type="tel" :placeholder="t('dashboard.settings.phonePlaceholder')" class="input-field" />
          </div>
        </div>

        <div class="flex items-center gap-3 pt-2">
          <button type="submit" class="btn-primary" :disabled="profileSaving">
            <svg v-if="profileSaving" class="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            <CheckIcon v-else-if="profileSaved" class="w-4 h-4" />
            {{ profileSaving ? t('dashboard.settings.saving') : profileSaved ? t('dashboard.settings.saved') : t('dashboard.settings.save') }}
          </button>
        </div>
      </form>
    </div>

    <!-- Organization tab -->
    <div v-if="activeTab === 'organization'" class="bg-white rounded-2xl border border-slate-100 shadow-card p-8">
      <h2 class="text-base font-semibold text-slate-900 mb-6">{{ t('dashboard.settings.orgInfo') }}</h2>

      <form class="space-y-5" @submit.prevent="saveOrg">
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1.5">
              {{ t('dashboard.settings.orgName') }}
            </label>
            <input v-model="orgName" type="text" class="input-field" />
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1.5">
              {{ t('dashboard.settings.orgType') }}
            </label>
            <select v-model="orgType" class="input-field">
              <option v-for="type in orgTypes" :key="type">{{ type }}</option>
            </select>
          </div>
          <div class="sm:col-span-2">
            <label class="block text-sm font-medium text-slate-700 mb-1.5">
              {{ t('dashboard.settings.orgAddress') }}
            </label>
            <input v-model="orgAddress" type="text" class="input-field" placeholder="Rua Exemplo, 123 — São Paulo, SP" />
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 mb-1.5">
              {{ t('dashboard.settings.orgWebsite') }}
            </label>
            <input v-model="orgWebsite" type="url" class="input-field" placeholder="https://hotel.com.br" />
          </div>
        </div>

        <div class="flex items-center gap-3 pt-2">
          <button type="submit" class="btn-primary" :disabled="orgSaving">
            <CheckIcon v-if="orgSaved" class="w-4 h-4" />
            {{ orgSaving ? t('dashboard.settings.saving') : orgSaved ? t('dashboard.settings.saved') : t('dashboard.settings.save') }}
          </button>
        </div>
      </form>
    </div>

    <!-- Notifications tab -->
    <div v-if="activeTab === 'notifications'" class="bg-white rounded-2xl border border-slate-100 shadow-card p-8">
      <h2 class="text-base font-semibold text-slate-900 mb-6">{{ t('dashboard.settings.notifTitle') }}</h2>

      <div class="space-y-5">
        <div
          v-for="(model, key) in {
            notifSessions: notifSessions,
            notifOffline: notifOffline,
            notifReport: notifReport,
            notifMarketing: notifMarketing
          }"
          :key="key"
          class="flex items-center justify-between py-3 border-b border-slate-50 last:border-0"
        >
          <div>
            <p class="text-sm font-medium text-slate-900">
              {{ t(`dashboard.settings.${key}`) }}
            </p>
          </div>
          <button
            :class="[
              'relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none',
              model ? 'bg-primary-600' : 'bg-slate-200'
            ]"
            @click="
              key === 'notifSessions' ? (notifSessions = !notifSessions) :
              key === 'notifOffline' ? (notifOffline = !notifOffline) :
              key === 'notifReport' ? (notifReport = !notifReport) :
              (notifMarketing = !notifMarketing)
            "
          >
            <span
              :class="[
                'inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform',
                model ? 'translate-x-6' : 'translate-x-1'
              ]"
            />
          </button>
        </div>
      </div>
    </div>

    <!-- Security tab -->
    <div v-if="activeTab === 'security'" class="bg-white rounded-2xl border border-slate-100 shadow-card p-8">
      <h2 class="text-base font-semibold text-slate-900 mb-6">Segurança da Conta</h2>

      <div class="space-y-4">
        <div class="p-5 rounded-xl border border-slate-100 bg-slate-50">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-semibold text-slate-900">Alterar senha</p>
              <p class="text-xs text-slate-500 mt-0.5">Última alteração há 3 meses</p>
            </div>
            <button class="btn-secondary text-xs">Alterar</button>
          </div>
        </div>

        <div class="p-5 rounded-xl border border-slate-100 bg-slate-50">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-semibold text-slate-900">Autenticação de dois fatores</p>
              <p class="text-xs text-slate-500 mt-0.5">Adicione uma camada extra de segurança</p>
            </div>
            <button class="btn-primary text-xs">Ativar</button>
          </div>
        </div>

        <div class="p-5 rounded-xl border border-red-100 bg-red-50">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-sm font-semibold text-red-900">Excluir conta</p>
              <p class="text-xs text-red-600 mt-0.5">Esta ação é permanente e irreversível</p>
            </div>
            <button class="px-3.5 py-2 rounded-xl text-xs font-semibold border border-red-200 text-red-700 hover:bg-red-100 transition-colors">
              Excluir
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
