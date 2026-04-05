/**
 * useChargerSocket
 * ================
 * Establishes a persistent WebSocket connection to voltwise-cloud and
 * dispatches real-time events to the chargers and sessions stores.
 *
 * Call once per "live" page (ChargersPage, OverviewPage).  The socket is
 * closed automatically when the component that called this composable is
 * unmounted.
 *
 * Events received from the server:
 *   charger.status  → chargersStore.updateStatus
 *   session.started → sessionsStore.upsert
 *   session.meter   → sessionsStore.updateMeter
 *   session.stopped → sessionsStore.upsert
 */

import { onUnmounted, ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useChargersStore } from '@/stores/chargers'
import { useSessionsStore } from '@/stores/sessions'
import type { Session } from '@/stores/sessions'

// Derive WS base URL from the configured API URL or the current host.
function wsBase(): string {
  const apiUrl = (import.meta.env.VITE_API_URL as string | undefined) || ''
  if (apiUrl) {
    return apiUrl.replace(/^http/, 'ws').replace(/\/api\/?$/, '')
  }
  const proto = window.location.protocol === 'https:' ? 'wss' : 'ws'
  return `${proto}://${window.location.host}`
}

function mapSession(s: Record<string, unknown>): Session {
  return {
    id: s.id as string,
    chargerId: s.charger as string,
    charger: (s.charger_name || s.charger_identifier || s.charger) as string,
    startTime: s.start_time as string,
    endTime: (s.end_time as string | null) ?? null,
    durationSeconds: (s.duration_seconds as number | null) ?? null,
    energyKwh: s.energy_kwh as string,
    status: s.status as Session['status'],
  }
}

export function useChargerSocket() {
  const authStore = useAuthStore()
  const chargersStore = useChargersStore()
  const sessionsStore = useSessionsStore()

  const connected = ref(false)
  let ws: WebSocket | null = null
  let unmounted = false
  let retryDelay = 1500

  function connect() {
    if (unmounted) return
    const token = authStore.token
    if (!token) return

    ws = new WebSocket(`${wsBase()}/ws/chargers/?token=${token}`)

    ws.onopen = () => {
      connected.value = true
      retryDelay = 1500
    }

    ws.onmessage = ({ data }) => {
      try {
        const msg = JSON.parse(data as string) as Record<string, unknown>
        switch (msg.event) {
          case 'charger.status':
            chargersStore.updateStatus(
              msg.id as string,
              msg.status as string,
              msg.updated_at as string,
            )
            break
          case 'session.started':
          case 'session.stopped':
            sessionsStore.upsert(mapSession(msg.session as Record<string, unknown>))
            break
          case 'session.meter':
            sessionsStore.updateMeter(
              msg.session_id as string,
              msg.energy_kwh as string,
            )
            break
        }
      } catch {
        /* ignore parse errors */
      }
    }

    ws.onclose = ev => {
      connected.value = false
      // 4001 = unauthenticated, 1000 = normal close — don't retry
      if (!unmounted && ev.code !== 1000 && ev.code !== 4001) {
        setTimeout(() => {
          retryDelay = Math.min(retryDelay * 2, 30_000)
          connect()
        }, retryDelay)
      }
    }

    ws.onerror = () => ws?.close()
  }

  onUnmounted(() => {
    unmounted = true
    ws?.close(1000)
    ws = null
  })

  connect()

  return { connected }
}
