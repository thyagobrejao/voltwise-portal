<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useSessionsStore } from '@/stores/sessions'
import Badge from '@/components/ui/Badge.vue'
import {
  MagnifyingGlassIcon,
  ClockIcon,
  ArrowPathIcon
} from '@heroicons/vue/24/outline'

const { t } = useI18n()
const store = useSessionsStore()

const search = ref('')
const filterStatus = ref('all')

const statusFilters = ['all', 'active', 'completed', 'failed']

onMounted(() => store.fetchAll())

const filtered = computed(() => {
  return store.sessions.filter(s => {
    const matchSearch =
      !search.value ||
      s.id.toLowerCase().includes(search.value.toLowerCase()) ||
      s.charger.toLowerCase().includes(search.value.toLowerCase())

    const matchStatus = filterStatus.value === 'all' || s.status === filterStatus.value
    return matchSearch && matchStatus
  })
})

const totalEnergy = computed(() => {
  const kwh = store.sessions
    .map(s => parseFloat(s.energyKwh))
    .filter(n => !isNaN(n))
    .reduce((a, b) => a + b, 0)
  return kwh.toFixed(1) + ' kWh'
})

function formatDuration(seconds: number | null): string {
  if (seconds == null) return '—'
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  return `${h}h ${m.toString().padStart(2, '0')}min`
}

function formatDateTime(isoStr: string | null): string {
  if (!isoStr) return '—'
  const d = new Date(isoStr)
  const day = d.getDate().toString().padStart(2, '0')
  const month = (d.getMonth() + 1).toString().padStart(2, '0')
  const hours = d.getHours().toString().padStart(2, '0')
  const minutes = d.getMinutes().toString().padStart(2, '0')
  return `${day}/${month} ${hours}:${minutes}`
}
</script>

<template>
  <div class="space-y-6">
    <!-- Page header -->
    <div>
      <h1 class="text-2xl font-bold text-slate-900">{{ t('dashboard.sessions.title') }}</h1>
      <p class="text-sm text-slate-500 mt-1">{{ t('dashboard.sessions.subtitle') }}</p>
    </div>

    <!-- Summary chips -->
    <div class="flex flex-wrap gap-3">
      <div class="px-4 py-2 rounded-xl bg-blue-50 border border-blue-100 text-blue-700 text-xs font-semibold">
        {{ store.sessions.filter(s => s.status === 'active').length }} ativas
      </div>
      <div class="px-4 py-2 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs font-semibold">
        {{ store.sessions.filter(s => s.status === 'completed').length }} concluídas
      </div>
      <div class="px-4 py-2 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold">
        Total: {{ totalEnergy }}
      </div>
    </div>

    <!-- Filters -->
    <div class="flex flex-col sm:flex-row gap-3">
      <div class="relative flex-1">
        <MagnifyingGlassIcon class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          v-model="search"
          type="text"
          :placeholder="t('dashboard.sessions.search')"
          class="input-field pl-9"
        />
      </div>

      <div class="flex items-center gap-2 flex-wrap">
        <button
          v-for="status in statusFilters"
          :key="status"
          :class="[
            'px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all',
            filterStatus === status
              ? 'bg-primary-600 border-primary-600 text-white shadow-sm'
              : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
          ]"
          @click="filterStatus = status"
        >
          {{ status === 'all' ? t('dashboard.sessions.all') : t(`dashboard.sessions.status.${status}`) }}
        </button>
      </div>
    </div>

    <!-- Table -->
    <div class="bg-white rounded-2xl border border-slate-100 shadow-card overflow-hidden">
      <!-- Loading -->
      <div v-if="store.loading" class="flex items-center justify-center py-16 gap-3">
        <ArrowPathIcon class="w-5 h-5 text-slate-400 animate-spin" />
        <span class="text-sm text-slate-500">{{ t('common.loading') }}</span>
      </div>

      <!-- Empty -->
      <div v-else-if="filtered.length === 0" class="flex flex-col items-center py-16 gap-3">
        <div class="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center">
          <ClockIcon class="w-7 h-7 text-slate-400" />
        </div>
        <div class="text-center">
          <p class="font-semibold text-slate-900">{{ t('dashboard.sessions.empty') }}</p>
          <p class="text-sm text-slate-500 mt-1">{{ t('dashboard.sessions.emptyDesc') }}</p>
        </div>
      </div>

      <!-- Table data -->
      <div v-else class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="border-b border-slate-100">
              <th
                v-for="col in ['id', 'charger', 'start', 'duration', 'energy', 'status']"
                :key="col"
                class="px-5 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap"
              >
                {{ t(`dashboard.sessions.table.${col}`) }}
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-50">
            <tr
              v-for="session in filtered"
              :key="session.id"
              class="hover:bg-slate-50/50 transition-colors"
            >
              <td class="px-5 py-4">
                <span class="font-mono text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                  {{ session.id.toString().slice(0, 8) }}
                </span>
              </td>
              <td class="px-5 py-4 text-sm font-medium text-slate-700">{{ session.charger }}</td>
              <td class="px-5 py-4 text-sm text-slate-500 whitespace-nowrap">{{ formatDateTime(session.startTime) }}</td>
              <td class="px-5 py-4 text-sm text-slate-500">{{ formatDuration(session.durationSeconds) }}</td>
              <td class="px-5 py-4 text-sm font-medium text-slate-700">{{ session.energyKwh }} kWh</td>
              <td class="px-5 py-4">
                <Badge
                  :status="session.status"
                  :label="t(`dashboard.sessions.status.${session.status}`)"
                />
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
