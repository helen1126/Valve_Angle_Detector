import { useEffect, useMemo, useRef, useState } from 'react'
import { useCamera } from '@/hooks/useCamera'
import { useApiConfig } from '@/context/ApiConfigContext'
import { predict, predictOcv } from '@/api/endpoints'
import { MethodSelector } from '@/components/predict/MethodSelector'
import { OcvParamPanel } from '@/components/predict/OcvParamPanel'
import { AngleGauge } from '@/components/predict/AngleGauge'
import { VideoAngleChart } from '@/components/video/VideoAngleChart'
import {
  ApiError,
  type LiveFrameResult,
  type OcvPredictOptions,
  type PredictMethod,
} from '@/types/api'
import { downloadCsv } from '@/utils/download'
import {
  Play,
  Square,
  RefreshCw,
  Trash2,
  Download,
  Power,
  AlertCircle,
  Activity,
} from 'lucide-react'

const MAX_FRAMES = 500

export default function LivePredict() {
  const { baseUrl, ocvBaseUrl, ocvApiKey } = useApiConfig()
  const { videoRef, active, error, start, stop, switchCamera, capture, zoom, zoomRange, setZoom } = useCamera()

  const [method, setMethod] = useState<PredictMethod>('dl')
  const [ocvParams, setOcvParams] = useState<OcvPredictOptions>({ view: 'top' })
  const [intervalMs, setIntervalMs] = useState(500)
  const [predicting, setPredicting] = useState(false)
  const [frames, setFrames] = useState<LiveFrameResult[]>([])
  const [currentAngle, setCurrentAngle] = useState<number | null>(null)
  const [liveError, setLiveError] = useState('')

  // ref 用于循环退出控制（闭包中 state 不会同步更新）
  const predictingRef = useRef(false)
  const frameIdxRef = useRef(0)
  const startTimeRef = useRef(0)
  // 缓存最新的方法与参数，避免循环读到旧值
  const methodRef = useRef(method)
  const ocvParamsRef = useRef(ocvParams)
  const intervalRef = useRef(intervalMs)
  useEffect(() => {
    methodRef.current = method
  }, [method])
  useEffect(() => {
    ocvParamsRef.current = ocvParams
  }, [ocvParams])
  useEffect(() => {
    intervalRef.current = intervalMs
  }, [intervalMs])

  // 卸载时停止预测与相机
  useEffect(() => {
    return () => {
      predictingRef.current = false
      stop()
    }
  }, [stop])

  async function startPredicting() {
    if (!active) return
    setPredicting(true)
    setLiveError('')
    predictingRef.current = true
    frameIdxRef.current = 0
    startTimeRef.current = performance.now()
    setFrames([])
    setCurrentAngle(null)

    while (predictingRef.current) {
      const file = capture()
      if (!file) {
        await new Promise((r) => setTimeout(r, 100))
        continue
      }
      const frameIdx = ++frameIdxRef.current
      const timestamp = (performance.now() - startTimeRef.current) / 1000
      const curMethod = methodRef.current
      try {
        let angle: number
        let elapsed: number
        if (curMethod === 'dl') {
          const res = await predict(baseUrl, file, { return_image: false })
          angle = res.angle
          elapsed = res.time * 1000
        } else {
          const res = await predictOcv(ocvBaseUrl, ocvApiKey, file, ocvParamsRef.current)
          angle = res.angle
          elapsed = res.elapsed_ms
        }
        if (!predictingRef.current) break
        setCurrentAngle(angle)
        setFrames((prev) => {
          const next = [
            ...prev,
            { frame_idx: frameIdx, timestamp, angle, elapsed_ms: elapsed, method: curMethod, error: null },
          ]
          return next.length > MAX_FRAMES ? next.slice(-MAX_FRAMES) : next
        })
      } catch (err) {
        if (!predictingRef.current) break
        const msg = err instanceof ApiError ? err.detail : '预测失败'
        setFrames((prev) => {
          const next = [
            ...prev,
            { frame_idx: frameIdx, timestamp, angle: 0, elapsed_ms: 0, method: curMethod, error: msg },
          ]
          return next.length > MAX_FRAMES ? next.slice(-MAX_FRAMES) : next
        })
      }
      // 等待间隔（最短 100ms）
      await new Promise((r) => setTimeout(r, Math.max(100, intervalRef.current)))
    }
    setPredicting(false)
  }

  function stopPredicting() {
    predictingRef.current = false
  }

  function clearData() {
    setFrames([])
    setCurrentAngle(null)
    setLiveError('')
  }

  const stats = useMemo(() => {
    const valid = frames.filter((f) => f.error === null)
    if (!valid.length) return null
    const angles = valid.map((f) => f.angle)
    return {
      count: valid.length,
      avg: angles.reduce((a, b) => a + b, 0) / angles.length,
      max: Math.max(...angles),
      min: Math.min(...angles),
    }
  }, [frames])

  function exportCsv() {
    if (!frames.length) return
    downloadCsv(
      frames as unknown as Record<string, unknown>[],
      [
        { key: 'frame_idx', label: '帧索引' },
        { key: 'timestamp', label: '时间戳(秒)' },
        { key: 'angle', label: '角度' },
        { key: 'elapsed_ms', label: '耗时(ms)' },
        { key: 'method', label: '方法' },
        { key: 'error', label: '错误' },
      ],
      `live_${Date.now()}.csv`,
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 md:gap-6">
      {/* 左栏：相机 + 控制 */}
      <div className="space-y-4">
        <h1 className="text-lg font-semibold text-slate-900 md:text-xl">实时视频预测</h1>

        <MethodSelector value={method} onChange={setMethod} />

        {method === 'ocv' && <OcvParamPanel value={ocvParams} onChange={setOcvParams} />}

        {/* 抓帧间隔 */}
        <div className="card space-y-2 p-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-600">抓帧间隔</span>
            <span className="font-medium text-brand-700">{intervalMs} ms</span>
          </div>
          <input
            type="range"
            min={100}
            max={2000}
            step={100}
            value={intervalMs}
            onChange={(e) => setIntervalMs(Number(e.target.value))}
            disabled={predicting}
            className="w-full accent-brand-600"
          />
          <div className="flex justify-between text-[10px] text-slate-400">
            <span>100ms</span>
            <span>2000ms</span>
          </div>
        </div>

        {/* 摄像头缩放（仅支持的设备显示） */}
        {zoomRange && (
          <div className="card space-y-2 p-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-600">摄像头缩放</span>
              <span className="font-medium text-brand-700">{zoom.toFixed(1)}x</span>
            </div>
            <input
              type="range"
              min={zoomRange.min}
              max={zoomRange.max}
              step={zoomRange.step}
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              className="w-full accent-brand-600"
            />
            <div className="flex justify-between text-[10px] text-slate-400">
              <span>{zoomRange.min.toFixed(1)}x</span>
              <span>{zoomRange.max.toFixed(1)}x</span>
            </div>
          </div>
        )}

        {/* 相机预览 */}
        {error ? (
          <div className="flex items-start gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700">
            <AlertCircle size={16} className="mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        ) : active ? (
          <div className="card relative overflow-hidden bg-black">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="mx-auto max-h-80 w-full object-contain"
            />
            {currentAngle !== null && (
              <div className="pointer-events-none absolute right-3 top-3 rounded-lg bg-black/50 px-3 py-1.5">
                <div className="text-[10px] text-white/70">当前角度</div>
                <div className="text-3xl font-bold text-white drop-shadow">
                  {currentAngle.toFixed(1)}°
                </div>
              </div>
            )}
            {predicting && (
              <div className="pointer-events-none absolute left-3 top-3 flex items-center gap-1.5 rounded-full bg-red-600/80 px-2.5 py-1 text-xs text-white">
                <span className="h-2 w-2 animate-pulse rounded-full bg-white" />
                预测中
              </div>
            )}
          </div>
        ) : (
          <div className="card flex flex-col items-center gap-3 py-12">
            <Activity size={40} className="text-slate-300" />
            <p className="text-sm text-slate-500">点击下方按钮启动相机</p>
            <p className="text-xs text-slate-400">手机端请通过 https:// 访问本应用</p>
          </div>
        )}

        {/* 控制按钮 */}
        <div className="flex flex-wrap gap-2">
          {!active ? (
            <button className="btn-primary btn-md flex-1" onClick={start}>
              <Power size={16} />
              启动相机
            </button>
          ) : !predicting ? (
            <button className="btn-primary btn-md flex-1" onClick={startPredicting}>
              <Play size={16} />
              开始预测
            </button>
          ) : (
            <button className="btn-danger btn-md flex-1" onClick={stopPredicting}>
              <Square size={16} />
              停止预测
            </button>
          )}
          {active && (
            <button className="btn-secondary btn-md" onClick={switchCamera} disabled={predicting}>
              <RefreshCw size={16} />
              翻转
            </button>
          )}
          <button
            className="btn-ghost btn-md"
            onClick={clearData}
            disabled={predicting || !frames.length}
          >
            <Trash2 size={16} />
            清空
          </button>
          <button
            className="btn-ghost btn-md"
            onClick={exportCsv}
            disabled={!frames.length}
          >
            <Download size={16} />
            导出
          </button>
        </div>

        {liveError && (
          <div className="flex items-start gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700">
            <AlertCircle size={16} className="mt-0.5 shrink-0" />
            <span>{liveError}</span>
          </div>
        )}
      </div>

      {/* 右栏：实时结果 */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-slate-900 md:text-xl">预测结果</h2>

        {/* 实时仪表盘 */}
        <div className="card flex flex-col items-center p-6">
          <AngleGauge angle={currentAngle ?? 0} />
          <div className="mt-3 text-center text-xs text-slate-400">
            {currentAngle === null ? '等待数据' : `最新角度 · ${frames.length} 帧已采集`}
          </div>
        </div>

        {/* 统计卡片 */}
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <div className="card p-3 text-center">
            <div className="text-xs text-slate-400">已采集</div>
            <div className="text-lg font-bold text-slate-900">{frames.length}</div>
          </div>
          <div className="card p-3 text-center">
            <div className="text-xs text-slate-400">平均角度</div>
            <div className="text-lg font-bold text-brand-600">
              {stats ? `${stats.avg.toFixed(1)}°` : '-'}
            </div>
          </div>
          <div className="card p-3 text-center">
            <div className="text-xs text-slate-400">最大角度</div>
            <div className="text-lg font-bold text-red-600">
              {stats ? `${stats.max.toFixed(1)}°` : '-'}
            </div>
          </div>
          <div className="card p-3 text-center">
            <div className="text-xs text-slate-400">最小角度</div>
            <div className="text-lg font-bold text-green-600">
              {stats ? `${stats.min.toFixed(1)}°` : '-'}
            </div>
          </div>
        </div>

        {/* 实时曲线图 */}
        <div className="card p-4">
          <h3 className="mb-3 text-sm font-semibold text-slate-700">角度-时间曲线</h3>
          {frames.length > 0 ? (
            <VideoAngleChart results={frames} />
          ) : (
            <div className="flex h-72 items-center justify-center text-sm text-slate-400">
              开始预测后将显示实时曲线
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
