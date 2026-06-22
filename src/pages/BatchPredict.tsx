import { useState } from 'react'
import { FileDropzone } from '@/components/ui/FileDropzone'
import { Spinner } from '@/components/ui/Spinner'
import { BatchResultTable } from '@/components/predict/BatchResultTable'
import { MethodSelector } from '@/components/predict/MethodSelector'
import { OcvParamPanel } from '@/components/predict/OcvParamPanel'
import { useApiConfig } from '@/context/ApiConfigContext'
import { predictBatch, predictOcvBatch } from '@/api/endpoints'
import {
  ApiError,
  type BatchPredictResponse,
  type PredictMethod,
  type OcvPredictOptions,
  type OcvBatchPredictResponse,
} from '@/types/api'
import { isAcceptedImage, isZipFile, extractImagesFromZip } from '@/utils/file'
import { formatTime, formatSize } from '@/utils/format'
import { downloadCsv, downloadJson } from '@/utils/download'
import { AlertCircle, FileArchive, Images, Trash2, Download } from 'lucide-react'

export default function BatchPredict() {
  const { baseUrl, ocvBaseUrl, ocvApiKey } = useApiConfig()
  const [method, setMethod] = useState<PredictMethod>('dl')
  const [files, setFiles] = useState<File[]>([])
  const [loading, setLoading] = useState(false)
  const [extracting, setExtracting] = useState(false)
  const [result, setResult] = useState<BatchPredictResponse | null>(null)
  const [ocvResult, setOcvResult] = useState<OcvBatchPredictResponse | null>(null)
  const [ocvParams, setOcvParams] = useState<OcvPredictOptions>({ view: 'top' })
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
    setOcvResult(null)
    setError('')
  }

  async function handlePredict() {
    if (!files.length) return
    setLoading(true)
    setError('')
    setResult(null)
    setOcvResult(null)
    try {
      if (method === 'dl') {
        const res = await predictBatch(baseUrl, files)
        setResult(res)
      } else {
        const res = await predictOcvBatch(ocvBaseUrl, ocvApiKey, files, ocvParams)
        setOcvResult(res)
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.detail : '批量预测失败，请检查服务状态')
    } finally {
      setLoading(false)
    }
  }

  const currentResults = method === 'dl' ? result?.results : ocvResult?.results
  const successCount = currentResults?.filter((r) => r.error === null).length ?? 0
  const failCount = currentResults ? currentResults.length - successCount : 0
  const totalTime = method === 'dl' ? result?.total_time : ocvResult?.total_time

  function exportCsv() {
    if (method === 'dl' && result) {
      downloadCsv(
        result.results as unknown as Record<string, unknown>[],
        [
          { key: 'filename', label: '文件名' },
          { key: 'angle', label: '角度' },
          { key: 'time', label: '耗时(秒)' },
          { key: 'error', label: '错误' },
        ],
        `batch_dl_${Date.now()}.csv`,
      )
    } else if (method === 'ocv' && ocvResult) {
      downloadCsv(
        ocvResult.results as unknown as Record<string, unknown>[],
        [
          { key: 'filename', label: '文件名' },
          { key: 'angle', label: '角度' },
          { key: 'view', label: '视角' },
          { key: 'model_version', label: '模型版本' },
          { key: 'elapsed_ms', label: '耗时(ms)' },
          { key: 'error', label: '错误' },
        ],
        `batch_ocv_${Date.now()}.csv`,
      )
    }
  }

  function exportJson() {
    const data = method === 'dl' ? result : ocvResult
    if (data) {
      downloadJson(data, `batch_${method}_${Date.now()}.json`)
    }
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

      <MethodSelector value={method} onChange={setMethod} />

      {method === 'ocv' && (
        <OcvParamPanel value={ocvParams} onChange={setOcvParams} />
      )}

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

      {method === 'ocv' && (
        <div className="flex items-start gap-2 rounded-lg bg-amber-50 p-2.5 text-xs text-amber-700">
          <AlertCircle size={14} className="mt-0.5 shrink-0" />
          <span>OCV 批量预测通过客户端循环调用单张接口，文件较多时耗时较长。</span>
        </div>
      )}

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
      {currentResults && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            <div className="card p-3 text-center">
              <div className="text-xs text-slate-400">总文件数</div>
              <div className="text-xl font-bold text-slate-900">{currentResults.length}</div>
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
              <div className="text-xl font-bold text-slate-900">{formatTime(totalTime ?? 0)}</div>
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
                <button className="btn-secondary btn-sm" onClick={exportJson}>
                  <Download size={14} />
                  JSON
                </button>
              </div>
            </div>
            {method === 'dl' && result ? (
              <BatchResultTable results={result.results} />
            ) : ocvResult ? (
              <OcvBatchTable results={ocvResult.results} />
            ) : null}
          </div>
        </div>
      )}

      {!files.length && !result && !ocvResult && (
        <div className="card flex flex-col items-center justify-center gap-2 py-16 text-slate-400">
          <FileArchive size={40} />
          <p className="text-sm">上传多张图片或压缩包后开始批量预测</p>
        </div>
      )}
    </div>
  )
}

/** OCV 批量结果表格 */
function OcvBatchTable({
  results,
}: {
  results: OcvBatchPredictResponse['results']
}) {
  return (
    <div className="max-h-96 overflow-y-auto">
      <table className="w-full text-sm">
        <thead className="sticky top-0 bg-white">
          <tr className="border-b border-slate-200 text-left text-xs text-slate-500">
            <th className="py-2 pr-3 font-medium">文件名</th>
            <th className="px-3 py-2 text-right font-medium">角度</th>
            <th className="px-3 py-2 text-center font-medium">视角</th>
            <th className="px-3 py-2 text-center font-medium">模型版本</th>
            <th className="px-3 py-2 text-right font-medium">耗时(ms)</th>
            <th className="py-2 pl-3 text-left font-medium">错误</th>
          </tr>
        </thead>
        <tbody>
          {results.map((r, i) => (
            <tr key={i} className="border-b border-slate-100 last:border-0">
              <td className="py-1.5 pr-3 text-slate-600">{r.filename}</td>
              <td className="px-3 py-1.5 text-right font-medium text-slate-900">
                {r.angle !== null ? `${r.angle.toFixed(1)}°` : '-'}
              </td>
              <td className="px-3 py-1.5 text-center text-slate-500">
                {r.view === 'top' ? '俯视' : '侧视'}
              </td>
              <td className="px-3 py-1.5 text-center text-slate-500">
                {r.model_version ?? '-'}
              </td>
              <td className="px-3 py-1.5 text-right text-slate-500">
                {r.elapsed_ms !== null ? r.elapsed_ms.toFixed(1) : '-'}
              </td>
              <td className="py-1.5 pl-3 text-left text-red-600">{r.error ?? ''}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
