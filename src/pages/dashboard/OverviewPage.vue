<script setup lang="ts">
import { onMounted, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { RouterLink } from 'vue-router'
import { useChargersStore } from '@/stores/chargers'
import { useSessionsStore } from '@/stores/sessions'
import { useChargerSocket } from '@/composables/useChargerSocket'
import StatCard from '@/components/ui/StatCard.vue'
import Badge from '@/components/ui/Badge.vue'
import {
  BoltSlashIcon,
  ClockIcon,
  BoltIcon,
  PlusIcon,
  ArrowRightIcon
} from '@heroicons/vue/24/outline'

const { t } = useI18n()
const chargersStore = useChargersStore()
const sessionsStore = useSessionsStore()
useChargerSocket()

onMounted(async () => {
  await Promise.all([chargersStore.fetchAll(), sessionsStore.fetchAll()])
})

const totalChargers = computed(() => chargersStore.chargers.length)
const activeSessions = computed(() =>
  sessionsStore.sessions.filter(s => s.status === 'active').length
)
const energyConsumed = computed(() => {
  const kwh = sessionsStore.sessions
    .map(s => parseFloat(s.energyKwh))
    .filter(n => !isNaN(n))
    .reduce((a, b) => a + b, 0)
  if (kwh >= 1000) return `${(kwh / 1000).toFixed(1)} MWh`
  return `${kwh.toFixed(1)} kWh`
})

function formatDateTime(isoStr: string | null): string {
  if (!isoStr) return '—'
  const d = new Date(isoStr)
  const day = d.getDate().toString().padStart(2, '0')
  const month = (d.getMonth() + 1).toString().padStart(2, '0')
  const hours = d.getHours().toString().padStart(2, '0')
  const minutes = d.getMinutes().toString().padStart(2, '0')
  return `${day}/${month} ${hours}:${minutes}`
}

const recentActivity = computed(() =>
  sessionsStore.sessions.slice(0, 4).map(s => ({
    id: s.id,
    text: s.charger,
    sub: `${formatDateTime(s.startTime)} · ${s.energyKwh} kWh`,
    status: s.status
  }))
)

const chargerStatusSummary = computed(() => {
  const byStatus: Record<string, number> = {}
  chargersStore.chargers.forEach(c => {
    byStatus[c.status] = (byStatus[c.status] || 0) + 1
  })
  return byStatus
})
</script>

<template>
  <div class="space-y-8">
    <!-- Page header -->
    <div>
      <h1 class="text-2xl font-bold text-slate-900">{{ t('dashboard.overview.title') }}</h1>
      <p class="text-sm text-slate-500 mt-1">{{ t('dashboard.overview.subtitle') }}</p>
    </div>

    <!-- Stats -->
    <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
      <StatCard
        :title="t('dashboard.overview.totalChargers')"
        :value="totalChargers.toString()"
        subtitle="total registrados"
        color="blue"
      >
        <template #icon>
          <BoltSlashIcon class="w-5 h-5" />
        </template>
      </StatCard>

      <StatCard
        :title="t('dashboard.overview.activeSessions')"
        :value="activeSessions.toString()"
        subtitle="em tempo real"
        color="green"
      >
        <template #icon>
          <ClockIcon class="w-5 h-5" />
        </template>
      </StatCard>

      <StatCard
        :title="t('dashboard.overview.energyConsumed')"
        :value="energyConsumed"
        subtitle="total acumulado"
        color="purple"
      >
        <template #icon>
          <BoltIcon class="w-5 h-5" />
        </template>
      </StatCard>
    </div>

    <!-- Content row -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Recent activity -->
      <div class="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-card">
        <div class="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 class="text-sm font-semibold text-slate-900">{{ t('dashboard.overview.recentActivity') }}</h2>
          <RouterLink
            to="/dashboard/sessions"
            class="flex items-center gap-1 text-xs font-medium text-primary-600 hover:text-primary-700 transition-colors"
          >
            Ver todas <ArrowRightIcon class="w-3 h-3" />
          </RouterLink>
        </div>

        <div class="divide-y divide-slate-50">
          <div
            v-for="item in recentActivity"
            :key="item.id"
            class="flex items-center justify-between px-6 py-4"
          >
            <div class="flex items-center gap-3">
              <div class="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center shrink-0">
                <ClockIcon class="w-4 h-4 text-slate-500" />
              </div>
              <div>
                <p class="text-sm font-medium text-slate-900">{{ item.text }}</p>
                <p class="text-xs text-slate-500">{{ item.sub }}</p>
              </div>
            </div>
            <Badge
              :status="item.status"
              :label="t(`dashboard.sessions.status.${item.status}`)"
            />
          </div>

          <div v-if="recentActivity.length === 0" class="px-6 py-8 text-center text-sm text-slate-400">
            {{ t('dashboard.overview.noActivity') }}
          </div>
        </div>
      </div>

      <!-- Charger status + Quick actions -->
      <div class="space-y-5">
        <!-- Charger status overview -->
        <div class="bg-white rounded-2xl border border-slate-100 shadow-card p-6">
          <h2 class="text-sm font-semibold text-slate-900 mb-4">Status dos Carregadores</h2>
          <div class="space-y-3">
            <div
              v-for="(count, status) in chargerStatusSummary"
              :key="status"
              class="flex items-center justify-between"
            >
              <Badge
                :status="status as 'available' | 'charging' | 'offline' | 'fault'"
                :label="t(`dashboard.chargers.status.${status}`)"
              />
              <span class="text-sm font-semibold text-slate-900">{{ count }}</span>
            </div>
          </div>
        </div>

        <!-- Quick actions -->
        <div class="bg-white rounded-2xl border border-slate-100 shadow-card p-6">
          <h2 class="text-sm font-semibold text-slate-900 mb-4">{{ t('dashboard.overview.quickActions') }}</h2>
          <div class="space-y-2">
            <RouterLink
              to="/dashboard/chargers"
              class="flex items-center gap-3 px-4 py-2.5 rounded-xl border border-dashed border-primary-200 bg-primary-50/50 text-primary-700 text-sm font-medium hover:bg-primary-50 transition-colors"
            >
              <PlusIcon class="w-4 h-4" />
              {{ t('dashboard.overview.addCharger') }}
            </RouterLink>
            <RouterLink
              to="/dashboard/sessions"
              class="flex items-center gap-3 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-sm font-medium hover:bg-slate-50 transition-colors"
            >
              <ClockIcon class="w-4 h-4 text-slate-400" />
              {{ t('dashboard.overview.viewSessions') }}
            </RouterLink>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
