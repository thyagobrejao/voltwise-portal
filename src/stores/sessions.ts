import { defineStore } from 'pinia'
import { ref } from 'vue'
import { sessionsService } from '@/services/api'

export interface Session {
  id: string
  /** Raw charger UUID — used for filtering by charger detail page. */
  chargerId: string
  /** Display name (charger_name from API). Kept for backward compat with existing pages. */
  charger: string
  startTime: string
  endTime: string | null
  durationSeconds: number | null
  energyKwh: string
  status: 'active' | 'completed' | 'failed'
}

export const useSessionsStore = defineStore('sessions', () => {
  const sessions = ref<Session[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function fetchAll() {
    loading.value = true
    error.value = null
    try {
      sessions.value = await sessionsService.getAll()
    } catch {
      error.value = 'fetch_failed'
    } finally {
      loading.value = false
    }
  }

  /** Insert or update a session (used by real-time WS events). */
  function upsert(session: Session) {
    const idx = sessions.value.findIndex(s => s.id === session.id)
    if (idx >= 0) {
      sessions.value[idx] = session
    } else {
      sessions.value.unshift(session)
    }
  }

  /** Update energy on an active session from a meter-values WS event. */
  function updateMeter(sessionId: string, energyKwh: string) {
    const session = sessions.value.find(s => s.id === sessionId)
    if (session) session.energyKwh = energyKwh
  }

  return { sessions, loading, error, fetchAll, upsert, updateMeter }
})
