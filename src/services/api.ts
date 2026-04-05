import axios from 'axios'
import type { Charger } from '@/stores/chargers'
import type { Session } from '@/stores/sessions'
import type { User } from '@/stores/auth'

// ─── Axios instance ─────────────────────────────────────────────────────────
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000
})

// ─── Interceptors ────────────────────────────────────────────────────────────

// Attach JWT access token to every outgoing request.
api.interceptors.request.use(config => {
  const token = localStorage.getItem('access_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// On 401 – try to silently refresh the token. If refresh also fails, log out.
let isRefreshing = false
let pendingRequests: Array<(token: string) => void> = []

function onTokenRefreshed(newToken: string) {
  pendingRequests.forEach(cb => cb(newToken))
  pendingRequests = []
}

api.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config

    // If server returned 401 and we haven't tried refreshing yet:
    if (error.response?.status === 401 && !originalRequest._retry) {
      const refreshToken = localStorage.getItem('refresh_token')

      // No refresh token stored → force logout
      if (!refreshToken) {
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
        window.location.href = '/login'
        return Promise.reject(error)
      }

      if (isRefreshing) {
        // If a refresh is already in progress, queue this request.
        return new Promise(resolve => {
          pendingRequests.push((newToken: string) => {
            originalRequest.headers.Authorization = `Bearer ${newToken}`
            resolve(api(originalRequest))
          })
        })
      }

      originalRequest._retry = true
      isRefreshing = true

      try {
        const { data } = await axios.post(
          `${api.defaults.baseURL}/auth/token/refresh/`,
          { refresh: refreshToken }
        )
        const newAccess = data.access
        localStorage.setItem('access_token', newAccess)
        if (data.refresh) {
          localStorage.setItem('refresh_token', data.refresh)
        }
        api.defaults.headers.common.Authorization = `Bearer ${newAccess}`
        onTokenRefreshed(newAccess)
        originalRequest.headers.Authorization = `Bearer ${newAccess}`
        return api(originalRequest)
      } catch {
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
        window.location.href = '/login'
        return Promise.reject(error)
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(error)
  }
)

// ─── Auth service ────────────────────────────────────────────────────────────

export const authService = {
  /**
   * Login with email + password via SimpleJWT.
   * Returns { access, refresh } tokens, then fetches the user profile.
   */
  async login(
    email: string,
    password: string
  ): Promise<{ accessToken: string; refreshToken: string; user: User }> {
    // 1. Obtain JWT pair
    const { data: tokens } = await api.post('/auth/login/', { email, password })
    const accessToken: string = tokens.access
    const refreshToken: string = tokens.refresh

    // 2. Set token so the /users/me/ request is authenticated
    localStorage.setItem('access_token', accessToken)
    localStorage.setItem('refresh_token', refreshToken)

    // 3. Fetch user profile
    const { data: profile } = await api.get('/users/me/', {
      headers: { Authorization: `Bearer ${accessToken}` }
    })

    const user: User = {
      id: profile.id,
      name: profile.name,
      email: profile.email,
      organization: profile.organization_name || ''
    }

    return { accessToken, refreshToken, user }
  },

  /**
   * Register a new user. After registration, logs in automatically.
   */
  async register(data: {
    name: string
    email: string
    organization: string
    password: string
  }): Promise<{ accessToken: string; refreshToken: string; user: User }> {
    // 1. Register the user (POST /auth/register/)
    await api.post('/auth/register/', {
      name: data.name,
      email: data.email,
      password: data.password,
      organization_name: data.organization
    })

    // 2. Automatically log in after registration
    return this.login(data.email, data.password)
  },

  /**
   * Fetch the currently authenticated user's profile.
   */
  async getMe(): Promise<User> {
    const { data } = await api.get('/users/me/')
    return {
      id: data.id,
      name: data.name,
      email: data.email,
      organization: data.organization_name || ''
    }
  },

  /**
   * Update name and/or email of the currently authenticated user.
   */
  async updateMe(payload: { name?: string; email?: string }): Promise<User> {
    const { data } = await api.patch('/users/me/', payload)
    return {
      id: data.id,
      name: data.name,
      email: data.email,
      organization: data.organization_name || ''
    }
  }
}

// ─── Chargers service ────────────────────────────────────────────────────────

export const chargersService = {
  /**
   * Register a new charger under the current user's organization.
   */
  async create(payload: { name: string; identifier: string }): Promise<Charger> {
    const { data } = await api.post<Record<string, unknown>>('/chargers/', payload)
    const locationDetail = data.location_detail as Record<string, unknown> | null | undefined
    return {
      id: data.id as string,
      identifier: data.identifier as string,
      name: data.name as string,
      location: (locationDetail?.name as string) || '—',
      status: data.status as Charger['status'],
      updatedAt: (data.updated_at || data.created_at) as string
    }
  },

  /**
   * Fetch a single charger by UUID.
   */
  async getById(id: string): Promise<Charger> {
    const { data } = await api.get<Record<string, unknown>>(`/chargers/${id}/`)
    const locationDetail = data.location_detail as Record<string, unknown> | null | undefined
    return {
      id: data.id as string,
      identifier: data.identifier as string,
      name: data.name as string,
      location: (locationDetail?.name as string) || '—',
      status: data.status as Charger['status'],
      updatedAt: (data.updated_at || data.created_at) as string,
    }
  },

  /**
   * Fetch all chargers for the current user's organization.
   * API returns paginated results → { count, next, previous, results }.
   */
  async getAll(): Promise<Charger[]> {
    const chargers: Charger[] = []
    let url: string | null = '/chargers/'

    while (url) {
      const { data } = await api.get<{ results?: unknown[]; next?: string | null } | unknown[]>(url)
      // Handle paginated (DRF) or plain array responses
      const results: unknown[] = Array.isArray(data) ? data : (data as { results?: unknown[] }).results || []

      for (const c of results) {
        const charger = c as Record<string, unknown>
        const locationDetail = charger.location_detail as Record<string, unknown> | null | undefined
        chargers.push({
          id: charger.id as string,
          identifier: charger.identifier as string,
          name: charger.name as string,
          location: (locationDetail?.name as string) || '—',
          status: charger.status as Charger['status'],
          updatedAt: (charger.updated_at || charger.created_at) as string
        })
      }

      const page = data as { next?: string | null }
      url = page.next ? page.next.replace(api.defaults.baseURL || '', '') : null
    }

    return chargers
  }
}

// ─── Sessions service ────────────────────────────────────────────────────────

// ─── Sessions service ────────────────────────────────────────────────────────

async function _fetchSessions(startUrl: string): Promise<Session[]> {
  const sessions: Session[] = []
  let url: string | null = startUrl

  while (url) {
    const { data } = await api.get<{ results?: unknown[]; next?: string | null } | unknown[]>(url)
    const results: unknown[] = Array.isArray(data)
      ? data
      : (data as { results?: unknown[] }).results || []

    for (const s of results) {
      const session = s as Record<string, unknown>
      sessions.push({
        id: session.id as string,
        chargerId: session.charger as string,
        charger: (session.charger_name || session.charger_identifier || session.charger) as string,
        startTime: session.start_time as string,
        endTime: (session.end_time as string | null) || null,
        durationSeconds: (session.duration_seconds as number | null) || null,
        energyKwh: session.energy_kwh as string,
        status: session.status as Session['status'],
      })
    }

    const page = data as { next?: string | null }
    url = page.next ? page.next.replace(api.defaults.baseURL || '', '') : null
  }

  return sessions
}

export const sessionsService = {
  /**
   * Fetch all charging sessions for the current user's organization.
   */
  async getAll(): Promise<Session[]> {
    return _fetchSessions('/sessions/')
  },

  /**
   * Fetch sessions for a specific charger (by UUID).
   */
  async getByCharger(chargerId: string): Promise<Session[]> {
    return _fetchSessions(`/sessions/?charger=${chargerId}&ordering=-start_time`)
  },
}

export default api
