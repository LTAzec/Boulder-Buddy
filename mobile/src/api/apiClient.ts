import { getToken } from '@/src/auth/tokenStore'

export const BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL

if (!BASE_URL) {
  throw new Error('Missing EXPO_PUBLIC_API_BASE_URL in .env')
}

function isFormDataBody(body: unknown): body is FormData {
  return typeof FormData !== 'undefined' && body instanceof FormData
}

export async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  const url = `${BASE_URL}${normalizedPath}`

  console.log(url)
  console.log(options)

  try {
    const token = await getToken()

    const headers: Record<string, string> = {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    }

    // Alleen JSON content-type zetten als we effectief een "body" hebben en het GEEN FormData is
    if (options.body && !isFormDataBody(options.body)) {
      headers['Content-Type'] = 'application/json'
    }

    const res = await fetch(url, {
      ...options,
      headers: {
        ...headers,
        ...(options.headers ?? {}),
      },
    })

    console.log(res)

    if (!res.ok) {
      const text = await res.text().catch(() => '')
      console.log('apiFetch error', { url, status: res.status, text: text.slice(0, 200) })
      throw new Error(`API error ${res.status}: ${text.slice(0, 200)}`)
    }

    // 204 / No Content
    if (res.status === 204) {
      return undefined as T
    }

    // extra safety: check of het JSON is
    const contentType = res.headers.get('content-type') ?? ''
    if (!contentType.includes('application/json')) {
      const text = await res.text().catch(() => '')
      console.log('Expected JSON, got:', { url, contentType, text: text.slice(0, 200) })
      throw new Error(`Expected JSON but got ${contentType}`)
    }

    return (await res.json()) as T
  } catch (error) {
    console.log('apiFetch network error', { url, error })
    throw new Error(`Network error: ${(error as Error).message}`)
  }
}
