// Thin client for interview-planner-backend (/api/v1).
// Works in both server components and client components.

export const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:40051').replace(
  /\/+$/,
  '',
)

export const apiUrl = (path: string) =>
  `${API_BASE_URL}/api/v1${path.startsWith('/') ? path : `/${path}`}`

type Envelope<T> = { success?: boolean; data?: T; error?: string }

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message)
  }
}

/** Fetch an endpoint and unwrap `{ success, data }`. Throws ApiError on non-2xx. */
export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(apiUrl(path), {
    cache: 'no-store',
    ...init,
    headers: { 'Content-Type': 'application/json', ...(init?.headers || {}) },
  })
  const json = (await res.json().catch(() => ({}))) as Envelope<T>
  if (!res.ok) throw new ApiError(json.error || `Request failed (${res.status})`, res.status)
  return json.data as T
}

/** Same as `api`, but returns null for 404 (for "not found" pages). */
export async function apiOrNull<T>(path: string): Promise<T | null> {
  try {
    return await api<T>(path)
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) return null
    throw err
  }
}
