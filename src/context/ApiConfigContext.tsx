import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { HealthResponse, InfoResponse } from '@/types/api'
import { getHealth, getInfo } from '@/api/endpoints'

const DEFAULT_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'
const STORAGE_KEY = 'valve_tool_api_base_url'
const POLL_INTERVAL = 15_000

export type HealthState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'online'; data: HealthResponse }
  | { status: 'offline'; error: string }

interface ApiConfigValue {
  baseUrl: string
  setBaseUrl: (url: string) => void
  resetBaseUrl: () => void
  health: HealthState
  refreshHealth: () => void
  info: InfoResponse | null
  refreshInfo: () => void
}

const ApiConfigContext = createContext<ApiConfigValue | null>(null)

export function ApiConfigProvider({ children }: { children: ReactNode }) {
  const [baseUrl, setBaseUrlState] = useState<string>(() => {
    return localStorage.getItem(STORAGE_KEY) || DEFAULT_BASE_URL
  })

  const [health, setHealth] = useState<HealthState>({ status: 'idle' })
  const [info, setInfo] = useState<InfoResponse | null>(null)

  const setBaseUrl = useCallback((url: string) => {
    const trimmed = url.trim()
    setBaseUrlState(trimmed)
    localStorage.setItem(STORAGE_KEY, trimmed)
  }, [])

  const resetBaseUrl = useCallback(() => {
    setBaseUrlState(DEFAULT_BASE_URL)
    localStorage.removeItem(STORAGE_KEY)
  }, [])

  const refreshHealth = useCallback(async () => {
    setHealth((prev) =>
      prev.status === 'idle' ? { status: 'loading' } : prev,
    )
    try {
      const data = await getHealth(baseUrl)
      setHealth({ status: 'online', data })
    } catch (err) {
      setHealth({
        status: 'offline',
        error: err instanceof Error ? err.message : '未知错误',
      })
    }
  }, [baseUrl])

  const refreshInfo = useCallback(async () => {
    try {
      const data = await getInfo(baseUrl)
      setInfo(data)
    } catch {
      // 信息查询失败不阻塞主流程
    }
  }, [baseUrl])

  // 健康检查轮询
  useEffect(() => {
    refreshHealth()
    const id = setInterval(refreshHealth, POLL_INTERVAL)
    return () => clearInterval(id)
  }, [refreshHealth])

  // baseUrl 变化时刷新模型信息
  useEffect(() => {
    refreshInfo()
  }, [refreshInfo])

  const value = useMemo<ApiConfigValue>(
    () => ({
      baseUrl,
      setBaseUrl,
      resetBaseUrl,
      health,
      refreshHealth,
      info,
      refreshInfo,
    }),
    [baseUrl, setBaseUrl, resetBaseUrl, health, refreshHealth, info, refreshInfo],
  )

  return (
    <ApiConfigContext.Provider value={value}>
      {children}
    </ApiConfigContext.Provider>
  )
}

export function useApiConfig(): ApiConfigValue {
  const ctx = useContext(ApiConfigContext)
  if (!ctx)
    throw new Error('useApiConfig must be used within ApiConfigProvider')
  return ctx
}
