<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useChargersStore } from '@/stores/chargers'
import { useSessionsStore } from '@/stores/sessions'
import { useChargerSocket } from '@/composables/useChargerSocket'
import { chargersService, sessionsService } from '@/services/api'
import type { Charger } from '@/stores/chargers'
import type { Session } from '@/stores/sessions'
import Badge from '@/components/ui/Badge.vue'
import {
  ArrowLeftIcon,
  BoltIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  ArrowPathIcon,
  SignalIcon,
  SignalSlashIcon,
  MapPinIcon,
  IdentificationIcon,
} from '@heroicons/vue/24/outline'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const chargersStore = useChargersStore()
const sessionsStore = useSessionsStore()
const { connected } = useChargerSocket()

// ── State ────────────────────────────────────────────────────────────────────

const chargerId = route.params.id as string
const charger = ref<Charger | null>(null)
const sessions = ref<Session[]>([])
const loadingCharger = ref(true)
const loadingSessions = ref(true)

const searchSessions = ref('')
const filterStatus = ref('all')
const sessionStatusFilters = ['all', 'active', 'completed', 'failed']

// ── Data loading ─────────────────────────────────────────────────────────────

async function loadCharger() {
  // Use from store if already loaded (avoids extra request)
  const cached = chargersStore.chargers.find(c => c.id === chargerId)
  if (cached) {
    charger.value = cached
    loadingCharger.value = false
    return
  }
  try {
    charger.value = await chargersService.getById(chargerId)
  } catch {
    charger.value = null
  } finally {
    loadingCharger.value = false
  }
}

async function loadSessions() {
  loadingSessions.value = true
  try {
    sessions.value = await sessionsService.getByCharger(chargerId)
  } finally {
    loadingSessions.value = false
  }
}

onMounted(async () => {
  await Promise.all([loadCharger(), loadSessions()])
})

// Keep charger data in sync with the store when WS updates arrive.
watch(
  () => chargersStore.chargers.find(c => c.id === chargerId),
  updated => { if (updated) charger.value = updated },
  { deep: true },
)

// Keep sessions in sync with store upserts from WS.
watch(
  () => sessionsStore.sessions.filter(s => s.chargerId === chargerId),
  incoming => {
    incoming.forEach(s => {
      const idx = sessions.value.findIndex(x => x.id === s.id)
      if (idx >= 0) sessions.value[idx] = s
      else sessions.value.unshift(s)
    })
  },
  { deep: true },
)

// ── Active session & live elapsed timer ─────────────────────────────────────

const activeSession = computed(() => sessions.value.find(s => s.status === 'active') ?? null)

const elapsed = ref(0)
let elapsedTimer: ReturnType<typeof setInterval> | null = null

function updateElapsed() {
  if (!activeSession.value) { elapsed.value = 0; return }
  elapsed.value = Math.floor((Date.now() - new Date(activeSession.value.startTime).getTime()) / 1000)
}

watch(activeSession, s => {
  if (elapsedTimer) { clearInterval(elapsedTimer); elapsedTimer = null }
  if (s) {
    updateElapsed()
    elapsedTimer = setInterval(updateElapsed, 1000)
  } else {
    elapsed.value = 0
  }
}, { immediate: true })

onUnmounted(() => { if (elapsedTimer) clearInterval(elapsedTimer) })

// ── Computed metrics ─────────────────────────────────────────────────────────

const finishedSessions = computed(() => sessions.value.filter(s => s.status === 'completed'))

const totalKwh = computed(() => {
  const sum = finishedSessions.value.reduce((a, s) => a + parseFloat(s.energyKwh || '0'), 0)
  if (sum >= 1000) return `${(sum / 1000).toFixed(2)} MWh`
  return `${sum.toFixed(2)} kWh`
})

const avgDuration = computed(() => {
  const withDur = finishedSessions.value.filter(s => s.durationSeconds != null)
  if (!withDur.length) return '—'
  const avg = withDur.reduce((a, s) => a + (s.durationSeconds ?? 0), 0) / withDur.length
  return formatDuration(Math.round(avg))
})

const successRate = computed(() => {
  const done = sessions.value.filter(s => s.status === 'completed' || s.status === 'failed')
  if (!done.length) return '—'
  const rate = (finishedSessions.value.length / done.length) * 100
  return `${Math.round(rate)}%`
})

// ── Filtered sessions table ───────────────────────────────────────────────────

const filteredSessions = computed(() =>
  sessions.value.filter(s => {
    const matchSearch =
      !searchSessions.value ||
      s.id.toLowerCase().includes(searchSessions.value.toLowerCase())
    const matchStatus = filterStatus.value === 'all' || s.status === filterStatus.value
    return matchSearch && matchStatus
  })
)

// ── Helpers ──────────────────────────────────────────────────────────────────

function formatDuration(seconds: number | null): string {
  if (seconds == null) return '—'
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  const s = seconds % 60
  if (h > 0) return `${h}h ${m.toString().padStart(2, '0')}min`
  if (m > 0) return `${m}min ${s.toString().padStart(2, '0')}s`
  return `${s}s`
}

function formatDateTime(isoStr: string | null): string {
  if (!isoStr) return '—'
  const d = new Date(isoStr)
  return d.toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })
}
</script>

<template>
  <div class="space-y-6">
    <!-- Back button -->
    <button
      class="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900 transition-colors"
      @click="router.back()"
    >
      <ArrowLeftIcon class="w-4 h-4" />
      {{ t('common.back') }}
    </button>

    <!-- Loading skeleton -->
    <div v-if="loadingCharger" class="flex items-center justify-center py-20">
      <ArrowPathIcon class="w-6 h-6 text-slate-400 animate-spin" />
    </div>

    <template v-else-if="charger">
      <!-- Charger header card -->
      <div class="bg-white rounded-2xl border border-slate-100 shadow-card p-6">
        <div class="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div class="flex items-start gap-4">
            <!-- Icon -->
            <div
              :class="[
                'w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0',
                charger.status === 'charging' ? 'bg-emerald-100 text-emerald-600' :
                charger.status === 'available' ? 'bg-blue-50 text-blue-500' :
                'bg-slate-100 text-slate-400'
              ]"
            >
              <BoltIcon class="w-6 h-6" />
            </div>

            <div>
              <div class="flex items-center gap-3 flex-wrap">
                <h1 class="text-xl font-bold text-slate-900">{{ charger.name }}</h1>
                <Badge :status="charger.status" :label="t(`dashboard.chargers.status.${charger.status}`)" />
                <span
                  v-if="charger.status === 'charging'"
                  class="flex h-2 w-2 mt-0.5"
                >
                  <span class="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-emerald-400 opacity-75" />
                  <span class="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                </span>
              </div>
              <div class="flex flex-wrap gap-4 mt-2 text-sm text-slate-500">
                <span class="flex items-center gap-1.5">
                  <IdentificationIcon class="w-4 h-4" />
                  {{ charger.identifier }}
                </span>
                <span v-if="charger.location !== '—'" class="flex items-center gap-1.5">
                  <MapPinIcon class="w-4 h-4" />
                  {{ charger.location }}
                </span>
              </div>
            </div>
          </div>

          <!-- Live indicator -->
          <div
            :class="[
              'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border self-start',
              connected ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-slate-50 border-slate-200 text-slate-500'
            ]"
          >
            <component :is="connected ? SignalIcon : SignalSlashIcon" class="w-3.5 h-3.5" />
            {{ connected ? t('common.live') : t('common.reconnecting') }}
          </div>
        </div>
      </div>

      <!-- Active session card -->
      <Transition name="session-card">
        <div
          v-if="activeSession"
          class="bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl p-6 text-white shadow-lg"
        >
          <div class="flex items-center gap-2 mb-4">
            <div class="w-2 h-2 bg-white rounded-full animate-pulse" />
            <span class="text-sm font-semibold uppercase tracking-wide opacity-90">{{ t('dashboard.chargerDetail.activeSession') }}</span>
          </div>
          <div class="grid grid-cols-2 sm:grid-cols-3 gap-6">
            <div>
              <p class="text-xs opacity-70 mb-1">{{ t('dashboard.chargerDetail.elapsed') }}</p>
              <p class="text-2xl font-bold font-mono tabular-nums">{{ formatDuration(elapsed) }}</p>
            </div>
            <div>
              <p class="text-xs opacity-70 mb-1">{{ t('dashboard.chargerDetail.energy') }}</p>
              <p class="text-2xl font-bold font-mono tabular-nums">{{ activeSession.energyKwh }} kWh</p>
            </div>
            <div>
              <p class="text-xs opacity-70 mb-1">{{ t('dashboard.chargerDetail.transaction') }}</p>
              <p class="text-sm font-mono font-semibold truncate">{{ activeSession.id.slice(0, 8) }}…</p>
            </div>
          </div>
        </div>
      </Transition>

      <!-- Stats row -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div class="bg-white rounded-2xl border border-slate-100 shadow-card p-5">
          <div class="flex items-center gap-3 mb-2">
            <div class="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center">
              <ClockIcon class="w-4 h-4 text-blue-500" />
            </div>
            <span class="text-xs font-semibold text-slate-500 uppercase tracking-wide">{{ t('dashboard.chargerDetail.totalSessions') }}</span>
          </div>
          <p class="text-2xl font-bold text-slate-900">{{ sessions.length }}</p>
        </div>

        <div class="bg-white rounded-2xl border border-slate-100 shadow-card p-5">
          <div class="flex items-center gap-3 mb-2">
            <div class="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center">
              <BoltIcon class="w-4 h-4 text-emerald-500" />
            </div>
            <span class="text-xs font-semibold text-slate-500 uppercase tracking-wide">{{ t('dashboard.chargerDetail.totalEnergy') }}</span>
          </div>
          <p class="text-2xl font-bold text-slate-900">{{ totalKwh }}</p>
        </div>

        <div class="bg-white rounded-2xl border border-slate-100 shadow-card p-5">
          <div class="flex items-center gap-3 mb-2">
            <div class="w-8 h-8 rounded-xl bg-violet-50 flex items-center justify-center">
              <ArrowPathIcon class="w-4 h-4 text-violet-500" />
            </div>
            <span class="text-xs font-semibold text-slate-500 uppercase tracking-wide">{{ t('dashboard.chargerDetail.avgDuration') }}</span>
          </div>
          <p class="text-2xl font-bold text-slate-900">{{ avgDuration }}</p>
        </div>

        <div class="bg-white rounded-2xl border border-slate-100 shadow-card p-5">
          <div class="flex items-center gap-3 mb-2">
            <div class="w-8 h-8 rounded-xl bg-amber-50 flex items-center justify-center">
              <CheckCircleIcon class="w-4 h-4 text-amber-500" />
            </div>
            <span class="text-xs font-semibold text-slate-500 uppercase tracking-wide">{{ t('dashboard.chargerDetail.successRate') }}</span>
          </div>
          <p class="text-2xl font-bold text-slate-900">{{ successRate }}</p>
        </div>
      </div>

      <!-- Sessions table -->
      <div class="bg-white rounded-2xl border border-slate-100 shadow-card overflow-hidden">
        <!-- Table header -->
        <div class="px-5 py-4 border-b border-slate-100 flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <h2 class="text-sm font-semibold text-slate-900">{{ t('dashboard.chargerDetail.sessionsHistory') }}</h2>
          <div class="flex gap-2 flex-wrap">
            <button
              v-for="s in sessionStatusFilters"
              :key="s"
              :class="[
                'px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all',
                filterStatus === s
                  ? 'bg-primary-600 border-primary-600 text-white'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              ]"
              @click="filterStatus = s"
            >
              {{ s === 'all' ? t('dashboard.sessions.all') : t(`dashboard.sessions.status.${s}`) }}
            </button>
          </div>
        </div>

        <!-- Loading -->
        <div v-if="loadingSessions" class="flex items-center justify-center py-12 gap-3">
          <ArrowPathIcon class="w-5 h-5 text-slate-400 animate-spin" />
          <span class="text-sm text-slate-500">{{ t('common.loading') }}</span>
        </div>

        <!-- Empty -->
        <div v-else-if="filteredSessions.length === 0" class="flex flex-col items-center py-12 gap-2">
          <ExclamationCircleIcon class="w-8 h-8 text-slate-300" />
          <p class="text-sm text-slate-500">{{ t('dashboard.chargerDetail.noSessions') }}</p>
        </div>

        <!-- Table -->
        <div v-else class="overflow-x-auto">
          <table class="w-full">
            <thead>
              <tr class="border-b border-slate-100">
                <th
                  v-for="col in ['id', 'start', 'end', 'duration', 'energy', 'status']"
                  :key="col"
                  class="px-5 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap"
                >
                  {{ t(`dashboard.chargerDetail.table.${col}`) }}
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-50">
              <tr
                v-for="session in filteredSessions"
                :key="session.id"
                class="hover:bg-slate-50/50 transition-colors"
              >
                <td class="px-5 py-3.5">
                  <span class="font-mono text-xs text-slate-500">{{ session.id.slice(0, 8) }}…</span>
                </td>
                <td class="px-5 py-3.5 text-sm text-slate-700 whitespace-nowrap">
                  {{ formatDateTime(session.startTime) }}
                </td>
                <td class="px-5 py-3.5 text-sm text-slate-500 whitespace-nowrap">
                  {{ formatDateTime(session.endTime) }}
                </td>
                <td class="px-5 py-3.5 text-sm text-slate-700 tabular-nums whitespace-nowrap">
                  <span v-if="session.status === 'active'" class="text-emerald-600 font-semibold">
                    {{ formatDuration(elapsed) }} ▸
                  </span>
                  <span v-else>{{ formatDuration(session.durationSeconds) }}</span>
                </td>
                <td class="px-5 py-3.5 text-sm font-semibold text-slate-800 tabular-nums whitespace-nowrap">
                  {{ session.energyKwh }} kWh
                </td>
                <td class="px-5 py-3.5">
                  <Badge :status="session.status" :label="t(`dashboard.sessions.status.${session.status}`)" />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </template>

    <!-- Not found -->
    <div v-else class="flex flex-col items-center py-20 gap-3">
      <ExclamationCircleIcon class="w-10 h-10 text-slate-300" />
      <p class="text-slate-500">{{ t('dashboard.chargerDetail.notFound') }}</p>
      <button class="btn-secondary" @click="router.push({ name: 'chargers' })">
        {{ t('common.back') }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.session-card-enter-active,
.session-card-leave-active {
  transition: opacity 0.3s ease, transform 0.3s ease;
}
.session-card-enter-from,
.session-card-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>
