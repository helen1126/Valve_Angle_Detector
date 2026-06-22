import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { FileDropzone } from '@/components/ui/FileDropzone'
import { Spinner } from '@/components/ui/Spinner'
import { AngleGauge } from '@/components/predict/AngleGauge'
import { ParamPanel } from '@/components/predict/ParamPanel'
import { OcvParamPanel } from '@/components/predict/OcvParamPanel'
import { MethodSelector } from '@/components/predict/MethodSelector'
import { ResultImage } from '@/components/predict/ResultImage'
import { useApiConfig } from '@/context/ApiConfigContext'
import { predict, predictOcv } from '@/api/endpoints'
import {
  ApiError,
  type PredictMethod,
  type PredictOptions,
  type PredictResponse,
  type OcvPredictOptions,
  type OcvPredictResponse,
} from '@/types/api'
import { isAcceptedImage } from '@/utils/file'
import { formatTime } from '@/utils/format'
import { AlertCircle, ImageIcon } from 'lucide-react'

export default function SinglePredict() {
  const { baseUrl, info, ocvBaseUrl, ocvApiKey } = useApiConfig()
  const location = useLocation()
  const cameraFile = (location.state as { file?: File } | null)?.file

  const [method, setMethod] = useState<PredictMethod>('dl')
  const [file, setFile] = useState<File | null>(cameraFile ?? null)
  const [preview, setPreview] = useState<string>('')
  const [params, setParams] = useState<PredictOptions>({ return_image: true })
  const [ocvParams, setOcvParams] = useState<OcvPredictOptions>({ view: 'top' })
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<PredictResponse | null>(null)
  const [ocvResult, setOcvResult] = useState<OcvPredictResponse | null>(null)
  const [error, setError] = useState<string>('')

  // 预览图
  useEffect(() => {
    if (!file) {
      setPreview('')
      return
    }
    const url = URL.createObjectURL(file)
    setPreview(url)
    return () => URL.revokeObjectURL(url)
  }, [file])

  // 重置结果当文件、方法或参数变化
  useEffect(() => {
    setResult(null)
    setOcvResult(null)
    setError('')
  }, [file, method, params, ocvParams])

  async function handlePredict() {
    if (!file) return
    setLoading(true)
    setError('')
    setResult(null)
    setOcvResult(null)
    try {
      if (method === 'dl') {
        const res = await predict(baseUrl, file, params)
        setResult(res)
      } else {
        const res = await predictOcv(ocvBaseUrl, ocvApiKey, file, ocvParams)
        setOcvResult(res)
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.detail : '预测失败，请检查服务状态')
    } finally {
      setLoading(false)
    }
  }

  function handleFiles(files: File[]) {
    const f = files[0]
    if (f && isAcceptedImage(f)) {
      setFile(f)
    } else {
      setError('不支持的图片格式，请上传 jpg/jpeg/png/bmp')
    }
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 md:gap-6">
      {/* 左侧：上传 + 参数 */}
      <div className="space-y-4">
        <h1 className="text-lg font-semibold text-slate-900 md:text-xl">单张图片预测</h1>

        <MethodSelector value={method} onChange={setMethod} />

        {file ? (
          <div className="card overflow-hidden">
            <div className="relative bg-slate-50">
              <img src={preview} alt="预览" className="mx-auto max-h-64 w-auto object-contain" />
              <button
                onClick={() => setFile(null)}
                className="absolute right-2 top-2 rounded-full bg-black/50 px-2 py-1 text-xs text-white hover:bg-black/70"
              >
                更换
              </button>
            </div>
            <div className="border-t border-slate-100 p-3 text-xs text-slate-500">
              {file.name} · {(file.size / 1024).toFixed(1)} KB
            </div>
          </div>
        ) : (
          <FileDropzone
            onFiles={handleFiles}
            accept="image/jpeg,image/png,image/bmp,.jpg,.jpeg,.png,.bmp"
            title="点击或拖拽阀门图片"
            hint="支持 jpg / jpeg / png / bmp"
          >
            <div className="mt-2 flex items-center justify-center gap-1 text-xs text-slate-400">
              <ImageIcon size={12} />
              单张图片
            </div>
          </FileDropzone>
        )}

        {method === 'dl' ? (
          <ParamPanel value={params} onChange={setParams} serverDefaults={info || undefined} />
        ) : (
          <OcvParamPanel value={ocvParams} onChange={setOcvParams} />
        )}

        <button
          className="btn-primary btn-lg w-full"
          onClick={handlePredict}
          disabled={!file || loading}
        >
          {loading ? <Spinner /> : '开始预测'}
        </button>
      </div>

      {/* 右侧：结果 */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-slate-900 md:text-xl">预测结果</h2>

        {error && (
          <div className="flex items-start gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700">
            <AlertCircle size={16} className="mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {loading && <Spinner className="text-brand-600" />}

        {!loading && !result && !ocvResult && !error && (
          <div className="card flex flex-col items-center justify-center gap-2 py-16 text-slate-400">
            <ImageIcon size={40} />
            <p className="text-sm">上传图片后将显示预测结果</p>
          </div>
        )}

        {/* DL 结果 */}
        {result && !loading && method === 'dl' && (
          <div className="space-y-4">
            <div className="card flex flex-col items-center p-6">
              <AngleGauge angle={result.angle} />
              <div className="mt-4 flex gap-6 text-center">
                <div>
                  <div className="text-xs text-slate-400">处理耗时</div>
                  <div className="text-sm font-medium text-slate-700">{formatTime(result.time)}</div>
                </div>
                <div>
                  <div className="text-xs text-slate-400">角度范围</div>
                  <div className="text-sm font-medium text-slate-700">0° ~ 80°</div>
                </div>
              </div>
            </div>

            {result.image && (
              <div className="card p-4">
                <h3 className="mb-2 text-sm font-semibold text-slate-700">标注图片</h3>
                <ResultImage base64={result.image} filename={`predict_${Date.now()}.jpg`} />
              </div>
            )}
          </div>
        )}

        {/* OCV 结果 */}
        {ocvResult && !loading && method === 'ocv' && (
          <div className="space-y-4">
            <div className="card flex flex-col items-center p-6">
              <AngleGauge angle={ocvResult.angle} />
              <div className="mt-4 flex gap-6 text-center">
                <div>
                  <div className="text-xs text-slate-400">处理耗时</div>
                  <div className="text-sm font-medium text-slate-700">{ocvResult.elapsed_ms.toFixed(1)} ms</div>
                </div>
                <div>
                  <div className="text-xs text-slate-400">拍摄视角</div>
                  <div className="text-sm font-medium text-slate-700">
                    {ocvResult.view === 'top' ? '俯视' : '侧视'}
                  </div>
                </div>
              </div>
            </div>

            <div className="card p-4">
              <h3 className="mb-3 text-sm font-semibold text-slate-700">模型信息</h3>
              <dl className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <dt className="text-xs text-slate-400">模型族</dt>
                  <dd className="font-medium text-slate-700">{ocvResult.model_family}</dd>
                </div>
                <div>
                  <dt className="text-xs text-slate-400">模型类型</dt>
                  <dd className="font-medium text-slate-700">{ocvResult.model_type}</dd>
                </div>
                <div>
                  <dt className="text-xs text-slate-400">模型版本</dt>
                  <dd className="font-medium text-slate-700">{ocvResult.model_version}</dd>
                </div>
                <div>
                  <dt className="text-xs text-slate-400">相机</dt>
                  <dd className="font-medium text-slate-700">{ocvResult.camera}</dd>
                </div>
              </dl>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
