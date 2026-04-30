<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { useChargersStore } from '@/stores/chargers'
import { useChargerSocket } from '@/composables/useChargerSocket'
import Badge from '@/components/ui/Badge.vue'
import {
  MagnifyingGlassIcon,
  PlusIcon,
  BoltSlashIcon,
  ArrowPathIcon,
  EllipsisHorizontalIcon,
  XMarkIcon,
  SignalIcon,
  SignalSlashIcon,
} from '@heroicons/vue/24/outline'

const { t } = useI18n()
const router = useRouter()
const store = useChargersStore()
const { connected } = useChargerSocket()

const search = ref('')
const filterStatus = ref('all')

const statusFilters = ['all', 'available', 'charging', 'offline', 'fault']

onMounted(() => store.fetchAll())

const filtered = computed(() => {
  return store.chargers.filter(c => {
    const matchSearch =
      !search.value ||
      c.name.toLowerCase().includes(search.value.toLowerCase()) ||
      c.location.toLowerCase().includes(search.value.toLowerCase()) ||
      c.identifier.toLowerCase().includes(search.value.toLowerCase())

    const matchStatus = filterStatus.value === 'all' || c.status === filterStatus.value

    return matchSearch && matchStatus
  })
})

function formatDate(dateStr: string): string {
  if (!dateStr) return '—'
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMin = Math.floor(diffMs / 60000)

  if (diffMin < 1) return t('common.justNow')
  if (diffMin < 60) return `${diffMin} min ${t('common.ago')}`
  const diffH = Math.floor(diffMin / 60)
  if (diffH < 24) return `${diffH}h ${t('common.ago')}`
  const diffD = Math.floor(diffH / 24)
  return `${diffD}d ${t('common.ago')}`
}

function goToDetail(id: string) {
  router.push({ name: 'charger-detail', params: { id } })
}

// ── Add Charger Modal ────────────────────────────────────────────────────────
const showModal = ref(false)
const formName = ref('')
const formIdentifier = ref('')
const formSaving = ref(false)
const formError = ref('')

function openModal() {
  formName.value = ''
  formIdentifier.value = ''
  formError.value = ''
  showModal.value = true
}

function closeModal() {
  showModal.value = false
}

async function submitForm() {
  formError.value = ''
  if (!formName.value.trim() || !formIdentifier.value.trim()) {
    formError.value = t('dashboard.chargers.modal.requiredFields')
    return
  }
  formSaving.value = true
  try {
    await store.create({
      name: formName.value.trim(),
      identifier: formIdentifier.value.trim().toUpperCase()
    })
    closeModal()
  } catch (err: unknown) {
    const resp = (err as { response?: { data?: Record<string, unknown> } }).response?.data
    if (resp?.identifier) {
      formError.value = String((resp.identifier as string[])[0] ?? resp.identifier)
    } else if (resp?.detail) {
      formError.value = String(resp.detail)
    } else if (resp?.non_field_errors) {
      formError.value = String((resp.non_field_errors as string[])[0])
    } else {
      formError.value = t('dashboard.chargers.modal.error')
    }
  } finally {
    formSaving.value = false
  }
}
</script>

<template>
  <div class="space-y-6">
    <!-- Page header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold text-slate-900">{{ t('dashboard.chargers.title') }}</h1>
        <p class="text-sm text-slate-500 mt-1">{{ t('dashboard.chargers.subtitle') }}</p>
      </div>
      <div class="flex items-center gap-3 self-start">
        <!-- Real-time indicator -->
        <div
          :class="[
            'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors',
            connected
              ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
              : 'bg-slate-50 border-slate-200 text-slate-500'
          ]"
        >
          <component :is="connected ? SignalIcon : SignalSlashIcon" class="w-3.5 h-3.5" />
          {{ connected ? t('common.live') : t('common.reconnecting') }}
        </div>
        <button class="btn-primary" @click="openModal">
          <PlusIcon class="w-4 h-4" />
          {{ t('dashboard.chargers.addCharger') }}
        </button>
      </div>
    </div>

    <!-- Filters -->
    <div class="flex flex-col sm:flex-row gap-3">
      <div class="relative flex-1">
        <MagnifyingGlassIcon class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          v-model="search"
          type="text"
          :placeholder="t('dashboard.chargers.search')"
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
          {{ status === 'all' ? t('dashboard.chargers.all') : t(`dashboard.chargers.status.${status}`) }}
        </button>
      </div>
    </div>

    <!-- Table card -->
    <div class="bg-white rounded-2xl border border-slate-100 shadow-card overflow-hidden">
      <!-- Loading state -->
      <div v-if="store.loading" class="flex items-center justify-center py-16 gap-3">
        <ArrowPathIcon class="w-5 h-5 text-slate-400 animate-spin" />
        <span class="text-sm text-slate-500">{{ t('common.loading') }}</span>
      </div>

      <!-- Empty state -->
      <div v-else-if="filtered.length === 0" class="flex flex-col items-center py-16 gap-3">
        <div class="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center">
          <BoltSlashIcon class="w-7 h-7 text-slate-400" />
        </div>
        <div class="text-center">
          <p class="font-semibold text-slate-900">{{ t('dashboard.chargers.empty') }}</p>
          <p class="text-sm text-slate-500 mt-1">{{ t('dashboard.chargers.emptyDesc') }}</p>
        </div>
        <button class="btn-primary mt-2" @click="openModal">
          <PlusIcon class="w-4 h-4" />
          {{ t('dashboard.chargers.addCharger') }}
        </button>
      </div>

      <!-- Table -->
      <div v-else class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="border-b border-slate-100">
              <th
                v-for="col in ['id', 'name', 'location', 'status', 'lastSeen', 'actions']"
                :key="col"
                class="px-5 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap"
              >
                {{ t(`dashboard.chargers.table.${col}`) }}
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-50">
            <tr
              v-for="charger in filtered"
              :key="charger.id"
              class="hover:bg-slate-50/50 transition-colors group cursor-pointer"
              @click="goToDetail(charger.id)"
            >
              <td class="px-5 py-4">
                <span class="font-mono text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                  {{ charger.identifier }}
                </span>
              </td>
              <td class="px-5 py-4">
                <span class="text-sm font-semibold text-slate-900">{{ charger.name }}</span>
              </td>
              <td class="px-5 py-4">
                <span class="text-sm text-slate-500">{{ charger.location }}</span>
              </td>
              <td class="px-5 py-4">
                <div class="flex items-center gap-2">
                  <Badge
                    :status="charger.status"
                    :label="t(`dashboard.chargers.status.${charger.status}`)"
                  />
                  <!-- animated pulse for charging status -->
                  <span
                    v-if="charger.status === 'charging'"
                    class="flex h-2 w-2"
                  >
                    <span class="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-emerald-400 opacity-75" />
                    <span class="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                  </span>
                </div>
              </td>
              <td class="px-5 py-4">
                <span class="text-sm text-slate-500">{{ formatDate(charger.updatedAt) }}</span>
              </td>
              <td class="px-5 py-4" @click.stop>
                <button
                  class="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all"
                  @click="goToDetail(charger.id)"
                >
                  <EllipsisHorizontalIcon class="w-4 h-4" />
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Add Charger Modal -->
    <Teleport to="body">
      <Transition name="modal">
        <div
          v-if="showModal"
          class="fixed inset-0 z-50 flex items-center justify-center p-4"
          @click.self="closeModal"
        >
          <!-- Backdrop -->
          <div class="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" @click="closeModal" />

          <!-- Dialog -->
          <div class="relative bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <!-- Header -->
            <div class="flex items-center justify-between mb-6">
              <h2 class="text-lg font-bold text-slate-900">{{ t('dashboard.chargers.modal.title') }}</h2>
              <button
                class="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all"
                @click="closeModal"
              >
                <XMarkIcon class="w-5 h-5" />
              </button>
            </div>

            <!-- Error -->
            <div
              v-if="formError"
              class="mb-4 px-4 py-3 rounded-xl bg-red-50 border border-red-100 text-red-700 text-sm"
            >
              {{ formError }}
            </div>

            <form class="space-y-4" @submit.prevent="submitForm">
              <!-- Name -->
              <div>
                <label class="block text-sm font-medium text-slate-700 mb-1.5">
                  {{ t('dashboard.chargers.modal.name') }}
                  <span class="text-red-500 ml-0.5">*</span>
                </label>
                <input
                  v-model="formName"
                  type="text"
                  required
                  :placeholder="t('dashboard.chargers.modal.namePlaceholder')"
                  class="input-field"
                  :disabled="formSaving"
                />
              </div>

              <!-- Identifier -->
              <div>
                <label class="block text-sm font-medium text-slate-700 mb-1.5">
                  {{ t('dashboard.chargers.modal.identifier') }}
                  <span class="text-red-500 ml-0.5">*</span>
                </label>
                <input
                  v-model="formIdentifier"
                  type="text"
                  required
                  :placeholder="t('dashboard.chargers.modal.identifierPlaceholder')"
                  class="input-field font-mono"
                  :disabled="formSaving"
                />
                <p class="mt-1.5 text-xs text-slate-500">{{ t('dashboard.chargers.modal.identifierHint') }}</p>
              </div>

              <!-- Actions -->
              <div class="flex items-center justify-end gap-3 pt-2">
                <button type="button" class="btn-secondary" :disabled="formSaving" @click="closeModal">
                  {{ t('common.cancel') }}
                </button>
                <button type="submit" class="btn-primary" :disabled="formSaving">
                  <svg v-if="formSaving" class="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  <PlusIcon v-else class="w-4 h-4" />
                  {{ formSaving ? t('common.saving') : t('dashboard.chargers.modal.submit') }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.2s ease;
}
.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
.modal-enter-active .relative,
.modal-leave-active .relative {
  transition: transform 0.2s ease;
}
.modal-enter-from .relative,
.modal-leave-to .relative {
  transform: scale(0.95);
}
</style>
