<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAuthStore } from '@/stores/auth'
import { Bars3Icon, BellIcon } from '@heroicons/vue/24/outline'

defineEmits<{ 'toggle-sidebar': [] }>()

const { locale, t } = useI18n()
const authStore = useAuthStore()

const notifOpen = ref(false)

function toggleLocale() {
  locale.value = locale.value === 'pt' ? 'en' : 'pt'
  localStorage.setItem('locale', locale.value)
}
</script>

<template>
  <header class="h-16 bg-white border-b border-slate-100 flex items-center px-4 lg:px-8 gap-4 shrink-0">
    <!-- Mobile sidebar toggle -->
    <button
      class="lg:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors"
      @click="$emit('toggle-sidebar')"
    >
      <Bars3Icon class="w-5 h-5" />
    </button>

    <!-- Breadcrumb / page title injected via slot or router -->
    <div class="flex-1" />

    <!-- Actions -->
    <div class="flex items-center gap-2">
      <!-- Language toggle -->
      <button
        class="px-3 py-1.5 rounded-lg text-xs font-semibold border border-slate-200 text-slate-600 hover:bg-slate-50 transition-all"
        @click="toggleLocale"
        :title="t('language.' + (locale === 'pt' ? 'en' : 'pt'))"
      >
        {{ locale === 'pt' ? 'EN' : 'PT' }}
      </button>

      <!-- Notifications -->
      <div class="relative">
        <button
          class="p-2 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors relative"
          @click="notifOpen = !notifOpen"
        >
          <BellIcon class="w-5 h-5" />
          <span class="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
        </button>

        <!-- Dropdown -->
        <Transition
          enter-active-class="transition duration-150 ease-out"
          enter-from-class="opacity-0 scale-95"
          enter-to-class="opacity-100 scale-100"
          leave-active-class="transition duration-100 ease-in"
          leave-from-class="opacity-100 scale-100"
          leave-to-class="opacity-0 scale-95"
        >
          <div
            v-if="notifOpen"
            class="absolute right-0 top-12 w-80 bg-white rounded-2xl border border-slate-100 shadow-soft z-50"
          >
            <div class="p-4 border-b border-slate-100">
              <h3 class="text-sm font-semibold text-slate-900">Notificações</h3>
            </div>
            <div class="p-3 space-y-1">
              <div class="flex gap-3 p-3 rounded-xl hover:bg-slate-50 cursor-pointer">
                <span class="w-2 h-2 mt-1.5 rounded-full bg-blue-500 shrink-0" />
                <div>
                  <p class="text-sm font-medium text-slate-900">CHR002 — sessão iniciada</p>
                  <p class="text-xs text-slate-500">há 2 minutos</p>
                </div>
              </div>
              <div class="flex gap-3 p-3 rounded-xl hover:bg-slate-50 cursor-pointer">
                <span class="w-2 h-2 mt-1.5 rounded-full bg-red-500 shrink-0" />
                <div>
                  <p class="text-sm font-medium text-slate-900">CHR006 — erro detectado</p>
                  <p class="text-xs text-slate-500">há 30 minutos</p>
                </div>
              </div>
              <div class="flex gap-3 p-3 rounded-xl hover:bg-slate-50 cursor-pointer">
                <span class="w-2 h-2 mt-1.5 rounded-full bg-emerald-500 shrink-0" />
                <div>
                  <p class="text-sm font-medium text-slate-900">SES003 — sessão concluída</p>
                  <p class="text-xs text-slate-500">há 4 horas</p>
                </div>
              </div>
            </div>
            <div class="p-3 border-t border-slate-100">
              <button class="text-xs font-medium text-primary-600 hover:text-primary-700 w-full text-center">
                Ver todas as notificações
              </button>
            </div>
          </div>
        </Transition>
      </div>

      <!-- Avatar -->
      <div class="w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-volt-500 flex items-center justify-center cursor-pointer">
        <span class="text-white text-xs font-bold">
          {{ authStore.user?.name?.charAt(0).toUpperCase() }}
        </span>
      </div>
    </div>
  </header>
</template>
