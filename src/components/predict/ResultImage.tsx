import { Download } from 'lucide-react'
import { downloadBase64Image } from '@/utils/download'

interface ResultImageProps {
  base64: string
  filename?: string
}

export function ResultImage({ base64, filename = 'result.jpg' }: ResultImageProps) {
  return (
    <div className="space-y-2">
      <div className="overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
        <img
          src={`data:image/jpeg;base64,${base64}`}
          alt="标注结果"
          className="mx-auto max-h-[420px] w-auto object-contain"
        />
      </div>
      <button
        className="btn-secondary btn-sm w-full"
        onClick={() => downloadBase64Image(base64, filename)}
      >
        <Download size={14} />
        下载标注图
      </button>
    </div>
  )
}
