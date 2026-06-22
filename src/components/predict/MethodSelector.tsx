import type { PredictMethod } from '@/types/api'
import { Brain, Code2 } from 'lucide-react'

interface MethodSelectorProps {
  value: PredictMethod
  onChange: (m: PredictMethod) => void
}

const METHODS: {
  key: PredictMethod
  label: string
  desc: string
  icon: typeof Brain
}[] = [
  { key: 'dl', label: '深度学习', desc: '高精度神经网络模型', icon: Brain },
  { key: 'ocv', label: 'OpenCV', desc: '传统计算机视觉方法', icon: Code2 },
]

export function MethodSelector({ value, onChange }: MethodSelectorProps) {
  return (
    <div className="card p-3">
      <div className="mb-2 text-xs font-medium text-slate-500">预测方法</div>
      <div className="grid grid-cols-2 gap-2">
        {METHODS.map((m) => {
          const active = value === m.key
          const Icon = m.icon
          return (
            <button
              key={m.key}
              onClick={() => onChange(m.key)}
              className={`flex items-center gap-2 rounded-lg border p-2.5 text-left transition ${
                active
                  ? 'border-brand-500 bg-brand-50 text-brand-700'
                  : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
              }`}
            >
              <Icon size={18} className={active ? 'text-brand-600' : 'text-slate-400'} />
              <div className="min-w-0">
                <div className="text-sm font-medium">{m.label}</div>
                <div className="truncate text-[11px] text-slate-400">{m.desc}</div>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
