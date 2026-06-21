import { Toggle } from '@/components/ui/Toggle'
import type { PredictOptions } from '@/types/api'
import { Info } from 'lucide-react'

interface ParamPanelProps {
  value: PredictOptions
  onChange: (v: PredictOptions) => void
  serverDefaults?: {
    smart_crop_enabled?: boolean
    multi_scale_enabled?: boolean
  }
}

export function ParamPanel({ value, onChange, serverDefaults }: ParamPanelProps) {
  return (
    <div className="card space-y-4 p-4">
      <h3 className="text-sm font-semibold text-slate-800">预测参数</h3>

      <Toggle
        label="返回标注图片"
        description="响应中包含 base64 标注图"
        checked={value.return_image ?? true}
        onChange={(v) => onChange({ ...value, return_image: v })}
      />

      <Toggle
        label="智能裁剪"
        description={
          serverDefaults
            ? `远距离拍摄自动定位放大（服务端默认：${serverDefaults.smart_crop_enabled ? '开' : '关'}）`
            : '远距离拍摄自动定位放大阀门区域'
        }
        checked={value.smart_crop ?? serverDefaults?.smart_crop_enabled ?? false}
        onChange={(v) => onChange({ ...value, smart_crop: v })}
      />

      <Toggle
        label="多尺度推理"
        description={
          serverDefaults
            ? `结合原图和裁剪图预测，精度更高（服务端默认：${serverDefaults.multi_scale_enabled ? '开' : '关'}）`
            : '结合原图和裁剪图预测，精度更高'
        }
        checked={value.multi_scale ?? serverDefaults?.multi_scale_enabled ?? false}
        onChange={(v) => onChange({ ...value, multi_scale: v })}
      />

      <div className="flex items-start gap-2 rounded-lg bg-amber-50 p-2.5 text-xs text-amber-700">
        <Info size={14} className="mt-0.5 shrink-0" />
        <span>multi_scale 优先级高于 smart_crop，同时启用时使用多尺度推理。</span>
      </div>
    </div>
  )
}
