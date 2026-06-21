import { useEffect, useMemo, useState } from 'react'
import { FileDropzone } from '@/components/ui/FileDropzone'
import { Spinner } from '@/components/ui/Spinner'
import { FrameModeSelector } from '@/components/video/FrameModeSelector'
import { VideoAngleChart } from '@/components/video/VideoAngleChart'
import { useApiConfig } from '@/context/ApiConfigContext'
import { predictVideo } from '@/api/endpoints'
import { ApiError, type VideoFrameMode, type VideoPredictResponse } from '@/types/api'
import { isAcceptedVideo } from '@/utils/file'
import { formatTime, formatAngle, formatTimestamp } from '@/utils/format'
import { downloadCsv, downloadJson } from '@/utils/download'
import { AlertCircle, Video, Download, ChevronDown, ChevronUp } from 'lucide-react'

export default function VideoPredict() {
  const { baseUrl } = useApiConfig()
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState('')
  const [mode, setMode] = useState<VideoFrameMode>('fps')
  const [fpsValue, setFpsValue] = useState(2)
  const [intervalValue, setIntervalValue] = useState(30)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<VideoPredictResponse | null>(null)
  const [error, setError] = useState('')
  const [showTable, setShowTable] = useState(false)

  useEffect(() => {
    if (!file) {
      setPreview('')
      return
    }
    const url = URL.createObjectURL(file)
    setPreview(url)
    return () => URL.revokeObjectURL(url)
  }, [file])

  useEffect(() => {
    setResult(null)
    setError('')
  }, [file, mode, fpsValue, intervalValue])

  function handleFiles(files: File[]) {
    const f = files[0]
    if (f && isAcceptedVideo(f)) {
      setFile(f)
    } else {
      setError('不支持的视频格式，请上传 mp4/avi/mov/mkv')
    }
  }

  async function handlePredict() {
    if (!file) return
    setLoading(true)
    setError('')
    setResult(null)
    try {
      const value = mode === 'fps' ? fpsValue : intervalValue
      const res = await predictVideo(baseUrl, file, mode, value)
      setResult(res)
    } catch (err) {
      setError(err instanceof ApiError ? err.detail : '视频预测失败，请检查服务状态')
    } finally {
      setLoading(false)
    }
  }

  const stats = useMemo(() => {
    if (!result?.results.length) return null
    const angles = result.results.map((r) => r.angle)
    return {
      avg: angles.reduce((a, b) => a + b, 0) / angles.length,
      max: Math.max(...angles),
      min: Math.min(...angles),
    }
  }, [result])

  function exportCsv() {
    if (!result) return
    downloadCsv(
      result.results as unknown as Record<string, unknown>[],
      [
        { key: 'frame_idx', label: '帧索引' },
        { key: 'timestamp', label: '时间戳(秒)' },
        { key: 'angle', label: '角度' },
        { key: 'time', label: '耗时(秒)' },
      ],
      `video_${Date.now()}.csv`,
    )
  }

  const currentValue = mode === 'fps' ? fpsValue : intervalValue

  return (
    <div className="grid gap-4 md:grid-cols-2 md:gap-6">
      {/* 左侧：上传 + 参数 */}
      <div className="space-y-4">
        <h1 className="text-lg font-semibold text-slate-900 md:text-xl">视频抽帧预测</h1>

        {file ? (
          <div className="card overflow-hidden">
            <video
              src={preview}
              controls
              className="mx-auto max-h-64 w-full bg-black object-contain"
            />
            <div className="flex items-center justify-between border-t border-slate-100 p-3">
              <span className="truncate text-xs text-slate-500">{file.name}</span>
              <button
                onClick={() => setFile(null)}
                className="text-xs text-brand-600 hover:underline"
              >
                更换
              </button>
            </div>
          </div>
        ) : (
          <FileDropzone
            onFiles={handleFiles}
            accept="video/mp4,video/x-msvideo,video/quicktime,video/x-matroska,.mp4,.avi,.mov,.mkv"
            title="点击或拖拽视频文件"
            hint="支持 mp4 / avi / mov / mkv"
          >
            <div className="mt-2 flex items-center justify-center gap-1 text-xs text-slate-400">
              <Video size={12} />
              视频文件
            </div>
          </FileDropzone>
        )}

        <FrameModeSelector
          mode={mode}
          value={currentValue}
          onModeChange={setMode}
          onValueChange={mode === 'fps' ? setFpsValue : setIntervalValue}
        />

        <button
          className="btn-primary btn-lg w-full"
          onClick={handlePredict}
          disabled={!file || loading}
        >
          {loading ? <Spinner /> : '开始视频预测'}
        </button>

        {loading && (
          <p className="text-center text-xs text-slate-400">
            视频处理可能需要较长时间，请耐心等待...
          </p>
        )}
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

        {!loading && !result && !error && (
          <div className="card flex flex-col items-center justify-center gap-2 py-16 text-slate-400">
            <Video size={40} />
            <p className="text-sm">上传视频后将显示抽帧预测结果</p>
          </div>
        )}

        {result && !loading && (
          <div className="space-y-4">
            {/* 统计卡片 */}
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
              <div className="card p-3 text-center">
                <div className="text-xs text-slate-400">总帧数</div>
                <div className="text-lg font-bold text-slate-900">{result.total_frames}</div>
              </div>
              <div className="card p-3 text-center">
                <div className="text-xs text-slate-400">已处理</div>
                <div className="text-lg font-bold text-slate-900">{result.processed_frames}</div>
              </div>
              <div className="card p-3 text-center">
                <div className="text-xs text-slate-400">总耗时</div>
                <div className="text-lg font-bold text-slate-900">{formatTime(result.total_time)}</div>
              </div>
              {stats && (
                <>
                  <div className="card p-3 text-center">
                    <div className="text-xs text-slate-400">平均角度</div>
                    <div className="text-lg font-bold text-brand-600">{stats.avg.toFixed(1)}°</div>
                  </div>
                  <div className="card p-3 text-center">
                    <div className="text-xs text-slate-400">最大角度</div>
                    <div className="text-lg font-bold text-red-600">{stats.max.toFixed(1)}°</div>
                  </div>
                  <div className="card p-3 text-center">
                    <div className="text-xs text-slate-400">最小角度</div>
                    <div className="text-lg font-bold text-green-600">{stats.min.toFixed(1)}°</div>
                  </div>
                </>
              )}
            </div>

            {/* 曲线图 */}
            <div className="card p-4">
              <h3 className="mb-3 text-sm font-semibold text-slate-700">角度-时间曲线</h3>
              <VideoAngleChart results={result.results} />
            </div>

            {/* 数据表 */}
            <div className="card p-4">
              <div className="mb-3 flex items-center justify-between">
                <button
                  className="flex items-center gap-1 text-sm font-semibold text-slate-700"
                  onClick={() => setShowTable((v) => !v)}
                >
                  {showTable ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  帧数据明细（{result.results.length} 条）
                </button>
                <div className="flex gap-2">
                  <button className="btn-secondary btn-sm" onClick={exportCsv}>
                    <Download size={14} />
                    CSV
                  </button>
                  <button
                    className="btn-secondary btn-sm"
                    onClick={() => downloadJson(result, `video_${Date.now()}.json`)}
                  >
                    <Download size={14} />
                    JSON
                  </button>
                </div>
              </div>
              {showTable && (
                <div className="max-h-64 overflow-y-auto">
                  <table className="w-full text-sm">
                    <thead className="sticky top-0 bg-white">
                      <tr className="border-b border-slate-200 text-left text-xs text-slate-500">
                        <th className="py-2 pr-3 font-medium">帧索引</th>
                        <th className="px-3 py-2 text-right font-medium">时间戳</th>
                        <th className="px-3 py-2 text-right font-medium">角度</th>
                        <th className="py-2 pl-3 text-right font-medium">耗时</th>
                      </tr>
                    </thead>
                    <tbody>
                      {result.results.map((r, i) => (
                        <tr key={i} className="border-b border-slate-100 last:border-0">
                          <td className="py-1.5 pr-3 text-slate-600">{r.frame_idx}</td>
                          <td className="px-3 py-1.5 text-right text-slate-500">{formatTimestamp(r.timestamp)}</td>
                          <td className="px-3 py-1.5 text-right font-medium text-slate-900">{formatAngle(r.angle)}</td>
                          <td className="py-1.5 pl-3 text-right text-slate-500">{formatTime(r.time)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
