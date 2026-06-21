import { useState } from 'react'
import { FileDropzone } from '@/components/ui/FileDropzone'
import { Spinner } from '@/components/ui/Spinner'
import { BatchResultTable } from '@/components/predict/BatchResultTable'
import { useApiConfig } from '@/context/ApiConfigContext'
import { predictBatch } from '@/api/endpoints'
import { ApiError, type BatchPredictResponse } from '@/types/api'
import { isAcceptedImage, isZipFile, extractImagesFromZip } from '@/utils/file'
import { formatTime, formatSize } from '@/utils/format'
import { downloadCsv, downloadJson } from '@/utils/download'
import { AlertCircle, FileArchive, Images, Trash2, Download } from 'lucide-react'

export default function BatchPredict() {
  const { baseUrl } = useApiConfig()
  const [files, setFiles] = useState<File[]>([])
  const [loading, setLoading] = useState(false)
  const [extracting, setExtracting] = useState(false)
  const [result, setResult] = useState<BatchPredictResponse | null>(null)
  const [error, setError] = useState('')

  async function addFiles(newFiles: File[]) {
    setError('')
    const collected: File[] = []
    for (const f of newFiles) {
      if (isZipFile(f)) {
        setExtracting(true)
        try {
          const imgs = await extractImagesFromZip(f)
          collected.push(...imgs)
        } catch {
          setError(`解压失败：${f.name}`)
        } finally {
          setExtracting(false)
        }
      } else if (isAcceptedImage(f)) {
        collected.push(f)
      }
    }
    setFiles((prev) => [...prev, ...collected])
  }

  function removeFile(idx: number) {
    setFiles((prev) => prev.filter((_, i) => i !== idx))
  }

  function clearAll() {
    setFiles([])
    setResult(null)
    setError('')
  }

  async function handlePredict() {
    if (!files.length) return
    setLoading(true)
    setError('')
    setResult(null)
    try {
      const res = await predictBatch(baseUrl, files)
      setResult(res)
    } catch (err) {
      setError(err instanceof ApiError ? err.detail : '批量预测失败，请检查服务状态')
    } finally {
      setLoading(false)
    }
  }

  const successCount = result?.results.filter((r) => r.error === null).length ?? 0
  const failCount = result ? result.results.length - successCount : 0

  function exportCsv() {
    if (!result) return
    downloadCsv(
      result.results as unknown as Record<string, unknown>[],
      [
        { key: 'filename', label: '文件名' },
        { key: 'angle', label: '角度' },
        { key: 'time', label: '耗时(秒)' },
        { key: 'error', label: '错误' },
      ],
      `batch_${Date.now()}.csv`,
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-semibold text-slate-900 md:text-xl">批量图片预测</h1>
        {files.length > 0 && (
          <button className="btn-ghost btn-sm" onClick={clearAll}>
            <Trash2 size={14} />
            清空
          </button>
        )}
      </div>

      <FileDropzone
        onFiles={addFiles}
        accept="image/jpeg,image/png,image/bmp,.zip,.jpg,.jpeg,.png,.bmp"
        multiple
        title="点击或拖拽多张图片或压缩包"
        hint="支持 jpg/jpeg/png/bmp，可上传 .zip 压缩包自动解压"
      >
        <div className="mt-2 flex items-center justify-center gap-1 text-xs text-slate-400">
          <Images size={12} />
          多选图片或 zip 压缩包
        </div>
      </FileDropzone>

      {extracting && (
        <div className="flex items-center gap-2 rounded-lg bg-brand-50 p-2.5 text-sm text-brand-700">
          <Spinner className="h-4 w-4" />
          正在解压压缩包...
        </div>
      )}

      {error && (
        <div className="flex items-start gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700">
          <AlertCircle size={16} className="mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* 文件列表 */}
      {files.length > 0 && (
        <div className="card p-4">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-sm font-medium text-slate-700">
              已选 {files.length} 个文件
            </span>
            <button
              className="btn-primary btn-sm"
              onClick={handlePredict}
              disabled={loading}
            >
              {loading ? <Spinner /> : '开始批量预测'}
            </button>
          </div>
          <div className="grid max-h-64 grid-cols-2 gap-2 overflow-y-auto sm:grid-cols-3 md:grid-cols-4">
            {files.map((f, i) => (
              <div key={i} className="group relative rounded-lg border border-slate-200 bg-slate-50 p-2">
                <div className="truncate text-xs text-slate-600">{f.name}</div>
                <div className="text-[10px] text-slate-400">{formatSize(f.size)}</div>
                <button
                  onClick={() => removeFile(i)}
                  className="absolute right-1 top-1 rounded-full bg-black/50 p-0.5 text-white opacity-0 transition group-hover:opacity-100"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 结果汇总 */}
      {result && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            <div className="card p-3 text-center">
              <div className="text-xs text-slate-400">总文件数</div>
              <div className="text-xl font-bold text-slate-900">{result.results.length}</div>
            </div>
            <div className="card p-3 text-center">
              <div className="text-xs text-slate-400">成功</div>
              <div className="text-xl font-bold text-green-600">{successCount}</div>
            </div>
            <div className="card p-3 text-center">
              <div className="text-xs text-slate-400">失败</div>
              <div className="text-xl font-bold text-red-600">{failCount}</div>
            </div>
            <div className="card p-3 text-center">
              <div className="text-xs text-slate-400">总耗时</div>
              <div className="text-xl font-bold text-slate-900">{formatTime(result.total_time)}</div>
            </div>
          </div>

          <div className="card p-4">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-slate-700">详细结果</h3>
              <div className="flex gap-2">
                <button className="btn-secondary btn-sm" onClick={exportCsv}>
                  <Download size={14} />
                  CSV
                </button>
                <button
                  className="btn-secondary btn-sm"
                  onClick={() => downloadJson(result, `batch_${Date.now()}.json`)}
                >
                  <Download size={14} />
                  JSON
                </button>
              </div>
            </div>
            <BatchResultTable results={result.results} />
          </div>
        </div>
      )}

      {!files.length && !result && (
        <div className="card flex flex-col items-center justify-center gap-2 py-16 text-slate-400">
          <FileArchive size={40} />
          <p className="text-sm">上传多张图片或压缩包后开始批量预测</p>
        </div>
      )}
    </div>
  )
}
