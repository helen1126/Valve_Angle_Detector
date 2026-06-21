import { MASKS, type MaskMeta } from '@/data/masks'

interface MaskSelectorProps {
  selectedId: string | null
  onSelect: (mask: MaskMeta | null) => void
}

export function MaskSelector({ selectedId, onSelect }: MaskSelectorProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1">
      {/* 无蒙版选项 */}
      <button
        onClick={() => onSelect(null)}
        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border-2 text-[10px] transition ${
          selectedId === null ? 'border-brand-500 bg-brand-50 text-brand-700' : 'border-slate-200 text-slate-400'
        }`}
      >
        无
      </button>
      {MASKS.map((m) => (
        <button
          key={m.id}
          onClick={() => onSelect(m)}
          className={`shrink-0 overflow-hidden rounded-lg border-2 transition ${
            selectedId === m.id ? 'border-brand-500 ring-2 ring-brand-200' : 'border-slate-200'
          }`}
          title={m.name}
        >
          <img src={m.src} alt={m.name} className="h-12 w-12 object-contain" />
        </button>
      ))}
    </div>
  )
}
