import { apiRequest } from './client'
import type {
  PredictOptions,
  PredictResponse,
  BatchPredictResponse,
  VideoPredictResponse,
  VideoFrameMode,
  HealthResponse,
  InfoResponse,
  OcvPredictOptions,
  OcvPredictResponse,
  OcvBatchResultItem,
  OcvBatchPredictResponse,
} from '@/types/api'
import { ApiError } from '@/types/api'

/** POST /predict - 单张图片预测 */
export function predict(
  baseUrl: string,
  file: File,
  opts: PredictOptions = {},
): Promise<PredictResponse> {
  const fd = new FormData()
  fd.append('file', file)
  return apiRequest<PredictResponse>(baseUrl, '/predict', {
    method: 'POST',
    body: fd,
    params: opts as Record<string, unknown>,
  })
}

/** POST /predict/batch - 批量图片预测 */
export function predictBatch(
  baseUrl: string,
  files: File[],
): Promise<BatchPredictResponse> {
  const fd = new FormData()
  for (const f of files) fd.append('files', f)
  return apiRequest<BatchPredictResponse>(baseUrl, '/predict/batch', {
    method: 'POST',
    body: fd,
  })
}

/** POST /predict/video - 视频抽帧预测 */
export function predictVideo(
  baseUrl: string,
  file: File,
  mode: VideoFrameMode,
  value: number,
): Promise<VideoPredictResponse> {
  const fd = new FormData()
  fd.append('file', file)
  const params: Record<string, unknown> =
    mode === 'fps' ? { fps: value } : { frame_interval: value }
  return apiRequest<VideoPredictResponse>(baseUrl, '/predict/video', {
    method: 'POST',
    body: fd,
    params,
    timeoutMs: 300_000, // 视频处理可能较久，5 分钟
  })
}

/** GET /health - 健康检查 */
export function getHealth(baseUrl: string): Promise<HealthResponse> {
  return apiRequest<HealthResponse>(baseUrl, '/health', { timeoutMs: 5_000 })
}

/** GET /info - 模型信息 */
export function getInfo(baseUrl: string): Promise<InfoResponse> {
  return apiRequest<InfoResponse>(baseUrl, '/info', { timeoutMs: 5_000 })
}

// ===== OpenCV (OCV) 方法端点 =====

/** POST /predict/upload - OCV 单张图片预测（文件上传方式） */
export function predictOcv(
  baseUrl: string,
  apiKey: string,
  file: File,
  opts: OcvPredictOptions,
): Promise<OcvPredictResponse> {
  const fd = new FormData()
  fd.append('file', file)
  fd.append('view', opts.view)
  fd.append('model', opts.model ?? 'ocv')
  return apiRequest<OcvPredictResponse>(baseUrl, '/predict/upload', {
    method: 'POST',
    body: fd,
    headers: { 'X-API-Key': apiKey },
  })
}

/** OCV 批量预测（客户端循环调用单张接口） */
export async function predictOcvBatch(
  baseUrl: string,
  apiKey: string,
  files: File[],
  opts: OcvPredictOptions,
): Promise<OcvBatchPredictResponse> {
  const results: OcvBatchResultItem[] = []
  const startTime = performance.now()
  for (const file of files) {
    try {
      const res = await predictOcv(baseUrl, apiKey, file, opts)
      results.push({
        filename: file.name,
        angle: res.angle,
        view: res.view,
        model_family: res.model_family,
        model_type: res.model_type,
        model_version: res.model_version,
        elapsed_ms: res.elapsed_ms,
        error: null,
      })
    } catch (err) {
      results.push({
        filename: file.name,
        angle: null,
        view: opts.view,
        model_family: null,
        model_type: null,
        model_version: null,
        elapsed_ms: null,
        error: err instanceof ApiError ? err.detail : '预测失败',
      })
    }
  }
  return {
    results,
    total_time: (performance.now() - startTime) / 1000,
  }
}
