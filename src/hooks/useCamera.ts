import { useCallback, useEffect, useRef, useState } from 'react'

type FacingMode = 'environment' | 'user'

interface UseCameraReturn {
  videoRef: React.RefObject<HTMLVideoElement>
  active: boolean
  error: string
  facingMode: FacingMode
  zoom: number
  zoomRange: { min: number; max: number; step: number } | null
  start: () => Promise<void>
  stop: () => void
  switchCamera: () => void
  capture: () => File | null
  focusAt: (x: number, y: number) => void
  setZoom: (z: number) => void
}

export function useCamera(): UseCameraReturn {
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const [active, setActive] = useState(false)
  const [error, setError] = useState('')
  const [facingMode, setFacingMode] = useState<FacingMode>('environment')
  const [zoom, setZoomState] = useState(1)
  const [zoomRange, setZoomRange] = useState<{ min: number; max: number; step: number } | null>(null)

  const stop = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop())
      streamRef.current = null
    }
    if (videoRef.current) videoRef.current.srcObject = null
    setActive(false)
  }, [])

  const start = useCallback(async () => {
    setError('')
    if (!navigator.mediaDevices?.getUserMedia) {
      const isHttp = location.protocol === 'http:'
      const isLocalhost = location.hostname === 'localhost' || location.hostname === '127.0.0.1'
      if (isHttp && !isLocalhost) {
        setError(
          `相机功能需要 HTTPS 环境。请通过 https:// 访问：\n` +
          `1. 开发环境：已启用 Vite HTTPS，请用 https://${location.host} 访问\n` +
          `2. 生产环境：部署到 HTTPS 域名或通过 localhost 访问`,
        )
      } else {
        setError('当前浏览器不支持相机访问，请使用 Chrome / Edge / Safari 最新版本')
      }
      return
    }
    // 先停止旧流
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop())
      streamRef.current = null
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: facingMode }, width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play().catch(() => {})
      }
      // 读取 zoom 能力（渐进增强，不支持则保持 null）
      const track = stream.getVideoTracks()[0]
      const capabilities = (track?.getCapabilities?.() ?? {}) as MediaTrackCapabilities & {
        zoom?: { min: number; max: number; step: number }
      }
      if (capabilities.zoom) {
        setZoomRange({
          min: capabilities.zoom.min,
          max: capabilities.zoom.max,
          step: capabilities.zoom.step,
        })
        setZoomState(1)
      } else {
        setZoomRange(null)
      }
      setActive(true)
    } catch (err) {
      const name = (err as DOMException).name
      if (name === 'NotAllowedError') setError('相机权限被拒绝，请在浏览器设置中允许')
      else if (name === 'NotFoundError') setError('未找到可用的相机设备')
      else if (name === 'NotReadableError') setError('相机被其他程序占用')
      else setError(`相机启动失败：${name || '未知错误'}`)
      setActive(false)
    }
  }, [facingMode])

  const switchCamera = useCallback(() => {
    setFacingMode((m) => (m === 'environment' ? 'user' : 'environment'))
  }, [])

  // facingMode 变化时重启
  useEffect(() => {
    if (active) start()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [facingMode])

  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop())
      }
    }
  }, [])

  const capture = useCallback((): File | null => {
    const video = videoRef.current
    if (!video || !video.videoWidth) return null
    const canvas = document.createElement('canvas')
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    const ctx = canvas.getContext('2d')
    if (!ctx) return null
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
    const dataUrl = canvas.toDataURL('image/jpeg', 0.92)
    const arr = dataUrl.split(',')[1]
    const bytes = atob(arr)
    const u8 = new Uint8Array(bytes.length)
    for (let i = 0; i < bytes.length; i++) u8[i] = bytes.charCodeAt(i)
    return new File([u8], `capture_${Date.now()}.jpg`, { type: 'image/jpeg' })
  }, [])

  const focusAt = useCallback((x: number, y: number) => {
    const stream = streamRef.current
    if (!stream) return
    const track = stream.getVideoTracks()[0]
    if (!track) return
    const capabilities = (track.getCapabilities?.() ?? {}) as MediaTrackCapabilities & {
      focusMode?: string[]
      pointsOfInterest?: unknown
    }
    // 仅在支持时尝试
    if (capabilities.focusMode) {
      try {
        track.applyConstraints({
          advanced: [
            { focusMode: 'manual', pointsOfInterest: [{ x, y }] } as MediaTrackConstraintSet,
          ],
        })
      } catch {
        // 不支持则静默忽略
      }
    }
  }, [])

  const setZoom = useCallback((z: number) => {
    const track = streamRef.current?.getVideoTracks()[0]
    if (!track) return
    try {
      track.applyConstraints({
        advanced: [{ zoom: z } as MediaTrackConstraintSet],
      })
      setZoomState(z)
    } catch {
      // 不支持则静默忽略
    }
  }, [])

  return { videoRef, active, error, facingMode, zoom, zoomRange, start, stop, switchCamera, capture, focusAt, setZoom }
}
