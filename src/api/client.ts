import { ApiError } from '@/types/api'

/** 构造 query string，跳过 undefined */
function buildQuery(params: Record<string, unknown>): string {
  const sp = new URLSearchParams()
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null) sp.append(k, String(v))
  }
  const s = sp.toString()
  return s ? `?${s}` : ''
}

interface RequestOptions {
  method?: 'GET' | 'POST'
  body?: FormData
  params?: Record<string, unknown>
  timeoutMs?: number
  headers?: Record<string, string>
}

/** fetch 封装：动态 baseURL、超时、统一错误解析 */
export async function apiRequest<T>(
  baseUrl: string,
  path: string,
  opts: RequestOptions = {},
): Promise<T> {
  const { method = 'GET', body, params, timeoutMs = 60_000, headers } = opts
  const url = `${baseUrl.replace(/\/$/, '')}${path}${buildQuery(params || {})}`

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)

  try {
    const res = await fetch(url, {
      method,
      body,
      signal: controller.signal,
      headers,
    })

    if (!res.ok) {
      let detail = `请求失败 (${res.status})`
      try {
        const errBody = await res.json()
        if (errBody?.detail) detail = errBody.detail
      } catch {
        // 非 JSON 错误体，使用默认文案
      }
      throw new ApiError(res.status, detail)
    }

    return (await res.json()) as T
  } catch (err) {
    // 网络层错误（CORS、混合内容、DNS 失败、连接拒绝、超时 abort）
    if (err instanceof ApiError) throw err
    if (err instanceof DOMException && err.name === 'AbortError') {
      throw new ApiError(0, '请求超时，请检查网络或服务是否可用')
    }
    if (err instanceof TypeError && err.message.includes('Failed to fetch')) {
      throw new ApiError(
        0,
        '无法连接服务：可能是跨域限制(CORS)、HTTPS 页面请求 HTTP 资源(混合内容)、服务未启动或网络不可达',
      )
    }
    throw new ApiError(0, err instanceof Error ? err.message : '未知错误')
  } finally {
    clearTimeout(timer)
  }
}
