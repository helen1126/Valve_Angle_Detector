import type { VideoFrameMode } from '@/types/api'

interface FrameModeSelectorProps {
  mode: VideoFrameMode
  value: number
  onModeChange: (mode: VideoFrameMode) => void
  onValueChange: (v: number) => void
}

export function FrameModeSelector({ mode, value, onModeChange, onValueChange }: FrameModeSelectorProps) {
  return (
    <div className="card space-y-3 p-4">
      <h3 className="text-sm font-semibold text-slate-800">抽帧方式</h3>

      <div className="flex gap-2">
        <button
          className={`flex-1 rounded-lg border px-3 py-2 text-sm transition ${
            mode === 'fps'
              ? 'border-brand-500 bg-brand-50 text-brand-700'
              : 'border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
          onClick={() => onModeChange('fps')}
        >
          按每秒帧数 (fps)
        </button>
        <button
          className={`flex-1 rounded-lg border px-3 py-2 text-sm transition ${
            mode === 'frame_interval'
              ? 'border-brand-500 bg-brand-50 text-brand-700'
              : 'border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
          onClick={() => onModeChange('frame_interval')}
        >
          按帧间隔 (frame_interval)
        </button>
      </div>

      {mode === 'fps' ? (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-600">每秒抽帧数</span>
            <span className="font-medium text-brand-700">{value} fps</span>
          </div>
          <input
            type="range"
            min={0.5}
            max={10}
            step={0.5}
            value={value}
            onChange={(e) => onValueChange(Number(e.target.value))}
            className="w-full accent-brand-600"
          />
          <div className="flex justify-between text-[10px] text-slate-400">
            <span>0.5</span>
            <span>10</span>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          <label className="block text-sm text-slate-600">帧间隔（每 N 帧抽 1 帧）</label>
          <input
            type="number"
            min={1}
            max={300}
            value={value}
            onChange={(e) => onValueChange(Math.max(1, Math.min(300, Number(e.target.value) || 1)))}
            className="input"
          />
        </div>
      )}

      <p className="text-xs text-slate-400">
        {mode === 'fps'
          ? `如 2.0 = 每秒 2 帧`
          : `如 30 = 每 30 帧抽 1 帧`}
        ，都不指定时默认每秒 1 帧。
      </p>
    </div>
  )
}
