import type { OcvPredictOptions, OcvView } from '@/types/api'
import { Info, Camera, CameraOff } from 'lucide-react'

interface OcvParamPanelProps {
  value: OcvPredictOptions
  onChange: (v: OcvPredictOptions) => void
}

const VIEWS: {
  key: OcvView
  label: string
  desc: string
  icon: typeof Camera
}[] = [
  { key: 'top', label: '俯视 top', desc: '从阀门正上方拍摄', icon: Camera },
  { key: 'side', label: '侧视 side', desc: '从阀门侧面拍摄', icon: CameraOff },
]

export function OcvParamPanel({ value, onChange }: OcvParamPanelProps) {
  return (
    <div className="card space-y-4 p-4">
      <h3 className="text-sm font-semibold text-slate-800">预测参数</h3>

      <div>
        <label className="mb-2 block text-sm text-slate-600">拍摄视角</label>
        <div className="grid grid-cols-2 gap-2">
          {VIEWS.map((v) => {
            const active = value.view === v.key
            const Icon = v.icon
            return (
              <button
                key={v.key}
                onClick={() => onChange({ ...value, view: v.key })}
                className={`flex items-center gap-2 rounded-lg border p-2.5 text-left transition ${
                  active
                    ? 'border-brand-500 bg-brand-50 text-brand-700'
                    : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                }`}
              >
                <Icon size={18} className={active ? 'text-brand-600' : 'text-slate-400'} />
                <div className="min-w-0">
                  <div className="text-sm font-medium">{v.label}</div>
                  <div className="truncate text-[11px] text-slate-400">{v.desc}</div>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      <div className="flex items-start gap-2 rounded-lg bg-amber-50 p-2.5 text-xs text-amber-700">
        <Info size={14} className="mt-0.5 shrink-0" />
        <span>OCV 方法基于 OpenCV 传统计算机视觉，响应不含标注图片。</span>
      </div>
    </div>
  )
}
