import { useApiConfig } from '@/context/ApiConfigContext'

export function HealthBadge() {
  const { health } = useApiConfig()

  if (health.status === 'idle' || health.status === 'loading') {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-500">
        <span className="h-2 w-2 animate-pulse rounded-full bg-slate-400" />
        检测中
      </span>
    )
  }

  if (health.status === 'offline') {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 px-2.5 py-1 text-xs text-red-600">
        <span className="h-2 w-2 rounded-full bg-red-500" />
        服务离线
      </span>
    )
  }

  // online
  if (health.data.model_loaded) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-green-50 px-2.5 py-1 text-xs text-green-700">
        <span className="h-2 w-2 rounded-full bg-green-500" />
        服务正常
      </span>
    )
  }

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-2.5 py-1 text-xs text-amber-700">
      <span className="h-2 w-2 rounded-full bg-amber-500" />
      模型未加载
    </span>
  )
}
