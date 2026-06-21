import { CheckCircle2, XCircle } from 'lucide-react'
import type { BatchResultItem } from '@/types/api'
import { formatAngle, formatTime } from '@/utils/format'

interface BatchResultTableProps {
  results: BatchResultItem[]
}

export function BatchResultTable({ results }: BatchResultTableProps) {
  if (!results.length) return null

  return (
    <>
      {/* 桌面端表格 */}
      <div className="hidden overflow-x-auto md:block">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-left text-xs text-slate-500">
              <th className="py-2 pr-3 font-medium">文件名</th>
              <th className="px-3 py-2 text-right font-medium">角度</th>
              <th className="px-3 py-2 text-right font-medium">耗时</th>
              <th className="py-2 pl-3 font-medium">状态</th>
            </tr>
          </thead>
          <tbody>
            {results.map((r, i) => (
              <tr key={i} className="border-b border-slate-100 last:border-0">
                <td className="py-2 pr-3 text-slate-700">{r.filename}</td>
                <td className="px-3 py-2 text-right font-medium text-slate-900">{formatAngle(r.angle)}</td>
                <td className="px-3 py-2 text-right text-slate-500">{formatTime(r.time)}</td>
                <td className="py-2 pl-3">
                  {r.error ? (
                    <span className="inline-flex items-center gap-1 text-xs text-red-600">
                      <XCircle size={14} />
                      {r.error}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs text-green-600">
                      <CheckCircle2 size={14} />
                      成功
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 移动端卡片列表 */}
      <div className="space-y-2 md:hidden">
        {results.map((r, i) => (
          <div key={i} className="card p-3">
            <div className="flex items-center justify-between">
              <span className="truncate text-sm font-medium text-slate-700">{r.filename}</span>
              {r.error ? (
                <XCircle size={16} className="shrink-0 text-red-500" />
              ) : (
                <CheckCircle2 size={16} className="shrink-0 text-green-500" />
              )}
            </div>
            <div className="mt-1 flex items-center justify-between text-xs text-slate-500">
              <span>角度：{formatAngle(r.angle)}</span>
              <span>{formatTime(r.time)}</span>
            </div>
            {r.error && <p className="mt-1 text-xs text-red-500">{r.error}</p>}
          </div>
        ))}
      </div>
    </>
  )
}
