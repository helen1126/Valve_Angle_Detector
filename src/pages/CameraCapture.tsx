import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCamera } from '@/hooks/useCamera'
import { MaskSelector } from '@/components/camera/MaskSelector'
import { MaskOverlay } from '@/components/camera/MaskOverlay'
import type { MaskMeta } from '@/data/masks'
import { Camera, RefreshCw, Check, X, AlertCircle, Power } from 'lucide-react'

export default function CameraCapture() {
  const navigate = useNavigate()
  const { videoRef, active, error, switchCamera, start, stop, capture, focusAt } = useCamera()
  const [mask, setMask] = useState<MaskMeta | null>(null)
  const [opacity, setOpacity] = useState(0.6)
  const [captured, setCaptured] = useState<string>('')
  const [capturedFile, setCapturedFile] = useState<File | null>(null)

  useEffect(() => {
    return () => stop()
  }, [stop])

  function handleCapture() {
    const file = capture()
    if (file) {
      setCapturedFile(file)
      setCaptured(URL.createObjectURL(file))
    }
  }

  function handleRetake() {
    setCaptured('')
    setCapturedFile(null)
  }

  function handleUseForPredict() {
    if (!capturedFile) return
    stop()
    navigate('/', { state: { file: capturedFile } })
  }

  function handleVideoClick(e: React.MouseEvent<HTMLVideoElement>) {
    const video = videoRef.current
    if (!video) return
    const rect = video.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width
    const y = (e.clientY - rect.top) / rect.height
    focusAt(x, y)
  }

  // 预览态
  if (captured) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col bg-black">
        <div className="flex-1">
          <img src={captured} alt="拍摄结果" className="h-full w-full object-contain" />
        </div>
        <div className="flex items-center justify-center gap-4 bg-black py-4">
          <button
            onClick={handleRetake}
            className="flex flex-col items-center gap-1 text-white"
          >
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20">
              <RefreshCw size={22} />
            </span>
            <span className="text-xs">重拍</span>
          </button>
          <button
            onClick={handleUseForPredict}
            className="flex flex-col items-center gap-1 text-white"
          >
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-600">
              <Check size={26} />
            </span>
            <span className="text-xs">用此图预测</span>
          </button>
        </div>
      </div>
    )
  }

  // 相机未启动 / 错误态
  if (!active) {
    return (
      <div className="space-y-4">
        <h1 className="text-lg font-semibold text-slate-900 md:text-xl">相机拍摄</h1>
        {error ? (
          <div className="flex items-start gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-700">
            <AlertCircle size={16} className="mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        ) : (
          <div className="card flex flex-col items-center gap-4 py-12">
            <Camera size={48} className="text-slate-300" />
            <p className="text-sm text-slate-500">点击下方按钮启动相机进行拍摄</p>
            <p className="text-xs text-slate-400">手机端请通过 https:// 访问本应用（开发服务器已启用 HTTPS）</p>
          </div>
        )}
        <div className="space-y-3">
          <div className="card p-3">
            <p className="mb-2 text-xs font-medium text-slate-600">选择拍摄蒙版（启动后可切换）</p>
            <MaskSelector selectedId={mask?.id ?? null} onSelect={setMask} />
          </div>
          <button className="btn-primary btn-lg w-full" onClick={start}>
            <Power size={18} />
            启动相机
          </button>
        </div>
      </div>
    )
  }

  // 相机活跃态
  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black">
      {/* 顶部：关闭 + 蒙版选择 */}
      <div className="flex items-center gap-2 bg-black/50 px-3 py-2">
        <button
          onClick={() => {
            stop()
            navigate(-1)
          }}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20 text-white"
        >
          <X size={20} />
        </button>
        <div className="flex-1 overflow-hidden">
          <MaskSelector selectedId={mask?.id ?? null} onSelect={setMask} />
        </div>
      </div>

      {/* 相机预览 + 蒙版 */}
      <div className="relative flex-1 overflow-hidden">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          onClick={handleVideoClick}
          className="h-full w-full object-cover"
        />
        <MaskOverlay mask={mask} opacity={opacity} onOpacityChange={setOpacity} />
        {/* 对焦提示 */}
        <div className="pointer-events-none absolute left-1/2 top-4 -translate-x-1/2 rounded-full bg-black/40 px-3 py-1 text-xs text-white">
          点击画面可对焦
        </div>
      </div>

      {/* 底部控制 */}
      <div className="flex items-center justify-center gap-8 bg-black py-5">
        <button
          onClick={switchCamera}
          className="flex flex-col items-center gap-1 text-white"
        >
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white/20">
            <RefreshCw size={20} />
          </span>
          <span className="text-[10px]">翻转</span>
        </button>
        <button
          onClick={handleCapture}
          className="flex h-16 w-16 items-center justify-center rounded-full border-4 border-white bg-white/30"
          aria-label="拍摄"
        >
          <span className="h-12 w-12 rounded-full bg-white" />
        </button>
        <button
          onClick={() => {
            stop()
          }}
          className="flex flex-col items-center gap-1 text-white"
        >
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-white/20">
            <Power size={20} />
          </span>
          <span className="text-[10px]">关闭</span>
        </button>
      </div>
    </div>
  )
}
