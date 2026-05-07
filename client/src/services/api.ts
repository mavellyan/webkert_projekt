const API_BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3001/api'

interface ApiOptions extends RequestInit {
  parseAsText?: boolean
}

function getAuthHeader(): { Authorization?: string } {
  const token = localStorage.getItem('auth_token')
  if (token) {
    return { Authorization: `Bearer ${token}` }
  }
  return {}
}

export async function apiRequest<T>(path: string, options: ApiOptions = {}): Promise<T> {
  const { parseAsText = false, headers, ...init } = options

  const response = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeader(),
      ...headers
    }
  })

  if (!response.ok) {
    let message = `HTTP ${response.status}`

    try {
      const body = await response.json()
      if (typeof body?.message === 'string') {
        message = body.message
      }
    } catch {
      // Ignore non-JSON error payloads.
    }

    throw new Error(message)
  }

  if (response.status === 204) {
    return undefined as T
  }

  if (parseAsText) {
    return (await response.text()) as T
  }

  return (await response.json()) as T
}

export function getApiBase(): string {
  return API_BASE
}
