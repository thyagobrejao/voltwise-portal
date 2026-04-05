<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/stores/auth'
import {
  BoltIcon,
  Squares2X2Icon,
  BoltSlashIcon,
  ClockIcon,
  Cog6ToothIcon,
  ArrowLeftOnRectangleIcon
} from '@heroicons/vue/24/outline'

defineProps<{ open: boolean }>()
defineEmits<{ close: [] }>()

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const navItems = [
  { name: 'nav.overview', icon: Squares2X2Icon, to: '/dashboard' },
  { name: 'nav.chargers', icon: BoltSlashIcon, to: '/dashboard/chargers' },
  { name: 'nav.sessions', icon: ClockIcon, to: '/dashboard/sessions' },
  { name: 'nav.settings', icon: Cog6ToothIcon, to: '/dashboard/settings' }
]

const activeItem = computed(() => route.path)

async function logout() {
  authStore.logout()
  await router.push({ name: 'landing' })
}

function isActive(path: string) {
  if (path === '/dashboard') return route.path === '/dashboard'
  return route.path.startsWith(path)
}
</script>

<template>
  <!-- Desktop sidebar -->
  <aside
    :class="[
      'fixed lg:static inset-y-0 left-0 z-30',
      'flex flex-col w-64 bg-white border-r border-slate-100 shadow-sm',
      'transition-transform duration-300 ease-in-out',
      open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
    ]"
  >
    <!-- Logo -->
    <div class="flex items-center gap-3 px-5 h-16 border-b border-slate-100">
      <div class="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center shrink-0">
        <BoltIcon class="w-5 h-5 text-white" />
      </div>
      <span class="text-base font-bold text-slate-900 tracking-tight">VoltWise</span>
    </div>

    <!-- Navigation -->
    <nav class="flex-1 px-3 py-5 space-y-1 overflow-y-auto">
      <RouterLink
        v-for="item in navItems"
        :key="item.to"
        :to="item.to"
        :class="[
          'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150',
          isActive(item.to)
            ? 'bg-primary-50 text-primary-700'
            : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
        ]"
        @click="$emit('close')"
      >
        <component
          :is="item.icon"
          :class="[
            'w-5 h-5 shrink-0',
            isActive(item.to) ? 'text-primary-600' : 'text-slate-400'
          ]"
        />
        {{ t(item.name) }}

        <!-- Active dot -->
        <span
          v-if="isActive(item.to)"
          class="ml-auto w-1.5 h-1.5 rounded-full bg-primary-500"
        />
      </RouterLink>
    </nav>

    <!-- User section -->
    <div class="px-3 pb-5 pt-3 border-t border-slate-100">
      <div class="flex items-center gap-3 px-3 py-2.5 rounded-xl mb-1">
        <div class="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-volt-500 flex items-center justify-center shrink-0">
          <span class="text-white text-xs font-bold">
            {{ authStore.user?.name?.charAt(0).toUpperCase() }}
          </span>
        </div>
        <div class="min-w-0">
          <p class="text-sm font-semibold text-slate-900 truncate">{{ authStore.user?.name }}</p>
          <p class="text-xs text-slate-500 truncate">{{ authStore.user?.organization }}</p>
        </div>
      </div>

      <button
        class="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
        @click="logout"
      >
        <ArrowLeftOnRectangleIcon class="w-5 h-5 text-slate-400" />
        {{ t('nav.logout') }}
      </button>
    </div>
  </aside>
</template>
