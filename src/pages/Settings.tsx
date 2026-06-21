import { useState } from 'react'
import { useApiConfig } from '@/context/ApiConfigContext'
import { getHealth } from '@/api/endpoints'
import { Spinner } from '@/components/ui/Spinner'
import { HealthBadge } from '@/components/layout/HealthBadge'
import { Check, RefreshCw, RotateCcw, Save, Server, Cpu, Image as ImageIcon, Settings as SettingsIcon } from 'lucide-react'
import type { InfoResponse } from '@/types/api'

export default function Settings() {
  const { baseUrl, setBaseUrl, resetBaseUrl, health, info, refreshInfo } = useApiConfig()
  const [draft, setDraft] = useState(baseUrl)
  const [testing, setTesting] = useState(false)
  const [testResult, setTestResult] = useState<{ ok: boolean; msg: string } | null>(null)
  const [saved, setSaved] = useState(false)

  function handleSave() {
    setBaseUrl(draft)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  function handleReset() {
    resetBaseUrl()
    setDraft('http://localhost:8000')
    setTestResult(null)
  }

  async function handleTest() {
    setTesting(true)
    setTestResult(null)
    try {
      const h = await getHealth(draft)
      setTestResult({
        ok: true,
        msg: h.model_loaded ? `连接成功，模型已加载 (${h.status})` : `连接成功，但模型未加载 (${h.status})`,
      })
    } catch (err) {
      setTestResult({
        ok: false,
        msg: err instanceof Error ? err.message : '连接失败',
      })
    } finally {
      setTesting(false)
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <h1 className="text-lg font-semibold text-slate-900 md:text-xl">设置</h1>

      {/* API 配置 */}
      <div className="card space-y-4 p-4">
        <div className="flex items-center gap-2">
          <Server size={18} className="text-brand-600" />
          <h2 className="text-sm font-semibold text-slate-800">API 服务地址</h2>
        </div>

        <div className="space-y-2">
          <label className="block text-sm text-slate-600">Base URL</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="http://localhost:8000"
              className="input flex-1"
            />
            <button
              className="btn-secondary btn-md"
              onClick={handleTest}
              disabled={testing || !draft}
            >
              {testing ? <Spinner className="h-4 w-4" /> : <RefreshCw size={16} />}
              测试
            </button>
          </div>
        </div>

        {testResult && (
          <div
            className={`flex items-center gap-2 rounded-lg p-2.5 text-sm ${
              testResult.ok ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
            }`}
          >
            {testResult.ok ? <Check size={16} /> : <RefreshCw size={16} />}
            <span>{testResult.msg}</span>
          </div>
        )}

        <div className="flex gap-2">
          <button className="btn-primary btn-md flex-1" onClick={handleSave}>
            {saved ? <Check size={16} /> : <Save size={16} />}
            {saved ? '已保存' : '保存'}
          </button>
          <button className="btn-ghost btn-md" onClick={handleReset}>
            <RotateCcw size={16} />
            恢复默认
          </button>
        </div>

        <div className="flex items-center justify-between border-t border-slate-100 pt-3">
          <span className="text-xs text-slate-500">当前服务状态</span>
          <HealthBadge />
        </div>
      </div>

      {/* 模型信息 */}
      <div className="card space-y-3 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Cpu size={18} className="text-brand-600" />
            <h2 className="text-sm font-semibold text-slate-800">模型信息</h2>
          </div>
          <button className="btn-ghost btn-sm" onClick={refreshInfo}>
            <RefreshCw size={14} />
            刷新
          </button>
        </div>

        {!info && (
          <p className="py-4 text-center text-sm text-slate-400">
            {health.status === 'offline' ? '服务离线，无法获取模型信息' : '加载中...'}
          </p>
        )}

        {info && <ModelInfo info={info} />}
      </div>

      {/* 关于 */}
      <div className="card p-4">
        <div className="flex items-center gap-2">
          <SettingsIcon size={18} className="text-brand-600" />
          <h2 className="text-sm font-semibold text-slate-800">关于</h2>
        </div>
        <dl className="mt-3 space-y-1.5 text-sm">
          <div className="flex justify-between">
            <dt className="text-slate-500">应用名称</dt>
            <dd className="font-medium text-slate-700">阀门角度检测系统</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-slate-500">版本</dt>
            <dd className="font-medium text-slate-700">v1.0.0</dd>
          </div>
        </dl>
      </div>
    </div>
  )
}

function ModelInfo({ info }: { info: InfoResponse }) {
  const items = [
    { label: '模型架构', value: info.model_name, icon: Cpu },
    { label: '权重路径', value: info.model_path, icon: Server },
    { label: '输入尺寸', value: `${info.image_size} × ${info.image_size}`, icon: ImageIcon },
    { label: '角度范围', value: info.angle_range, icon: ImageIcon },
    { label: '计算设备', value: info.device, icon: Cpu },
  ]

  return (
    <div className="space-y-3">
      <dl className="space-y-2">
        {items.map((it) => (
          <div key={it.label} className="flex items-center justify-between gap-3 text-sm">
            <dt className="flex items-center gap-1.5 text-slate-500">
              <it.icon size={14} />
              {it.label}
            </dt>
            <dd className="truncate font-medium text-slate-700">{it.value}</dd>
          </div>
        ))}
      </dl>

      <div className="border-t border-slate-100 pt-3">
        <p className="mb-2 text-xs font-medium text-slate-500">服务端默认配置</p>
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="rounded-lg bg-slate-50 p-2">
            <div className="text-[10px] text-slate-400">图像优化</div>
            <div className={`text-sm font-semibold ${info.optimization_enabled ? 'text-green-600' : 'text-slate-500'}`}>
              {info.optimization_enabled ? '开' : '关'}
            </div>
          </div>
          <div className="rounded-lg bg-slate-50 p-2">
            <div className="text-[10px] text-slate-400">智能裁剪</div>
            <div className={`text-sm font-semibold ${info.smart_crop_enabled ? 'text-green-600' : 'text-slate-500'}`}>
              {info.smart_crop_enabled ? '开' : '关'}
            </div>
          </div>
          <div className="rounded-lg bg-slate-50 p-2">
            <div className="text-[10px] text-slate-400">多尺度推理</div>
            <div className={`text-sm font-semibold ${info.multi_scale_enabled ? 'text-green-600' : 'text-slate-500'}`}>
              {info.multi_scale_enabled ? '开' : '关'}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
