import { useState } from 'react'
import type { MaskMeta } from '@/data/masks'

interface MaskOverlayProps {
  mask: MaskMeta | null
  opacity: number
  onOpacityChange: (v: number) => void
}

export function MaskOverlay({ mask, opacity, onOpacityChange }: MaskOverlayProps) {
  const [scale, setScale] = useState(1)

  if (!mask) {
    return (
      <div className="pointer-events-none absolute inset-0 flex items-end justify-center pb-4">
        <div className="rounded-full bg-black/40 px-3 py-1 text-xs text-white">未选择蒙版</div>
      </div>
    )
  }

  return (
    <>
      <img
        src={mask.src}
        alt={mask.name}
        draggable={false}
        className="pointer-events-none absolute inset-0 h-full w-full object-contain"
        style={{ opacity, transform: `scale(${scale})` }}
      />
      {/* 蒙版控制条 */}
      <div className="absolute bottom-20 left-1/2 flex -translate-x-1/2 items-center gap-3 rounded-full bg-black/60 px-4 py-2 text-white">
        <span className="text-xs">透明度</span>
        <input
          type="range"
          min={0.2}
          max={1}
          step={0.1}
          value={opacity}
          onChange={(e) => onOpacityChange(Number(e.target.value))}
          className="w-20 accent-brand-400"
        />
        <span className="text-xs">缩放</span>
        <input
          type="range"
          min={0.5}
          max={2}
          step={0.1}
          value={scale}
          onChange={(e) => setScale(Number(e.target.value))}
          className="w-20 accent-brand-400"
        />
      </div>
    </>
  )
}
