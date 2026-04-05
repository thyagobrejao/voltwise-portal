import { defineStore } from 'pinia'
import { ref } from 'vue'
import { chargersService } from '@/services/api'

export interface Charger {
  id: string
  identifier: string
  name: string
  location: string
  status: 'available' | 'charging' | 'offline' | 'fault'
  updatedAt: string
}

export const useChargersStore = defineStore('chargers', () => {
  const chargers = ref<Charger[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function fetchAll() {
    loading.value = true
    error.value = null
    try {
      chargers.value = await chargersService.getAll()
    } catch {
      error.value = 'fetch_failed'
    } finally {
      loading.value = false
    }
  }

  async function create(payload: { name: string; identifier: string }): Promise<Charger> {
    const charger = await chargersService.create(payload)
    chargers.value.unshift(charger)
    return charger
  }

  /** Called by useChargerSocket when a real-time status update arrives. */
  function updateStatus(id: string, status: string, updatedAt: string) {
    const charger = chargers.value.find(c => c.id === id)
    if (charger) {
      charger.status = status as Charger['status']
      charger.updatedAt = updatedAt
    }
  }

  return { chargers, loading, error, fetchAll, create, updateStatus }
})
