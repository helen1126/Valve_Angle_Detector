import { apiRequest } from './client'
import type {
  PredictOptions,
  PredictResponse,
  BatchPredictResponse,
  VideoPredictResponse,
  VideoFrameMode,
  HealthResponse,
  InfoResponse,
} from '@/types/api'

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
