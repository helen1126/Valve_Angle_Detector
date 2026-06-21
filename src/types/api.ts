// API 请求/响应类型定义 - 严格对应 docs/API文档.md

/** 单张预测请求参数 */
export interface PredictOptions {
  return_image?: boolean
  smart_crop?: boolean
  multi_scale?: boolean
}

/** 单张预测响应 */
export interface PredictResponse {
  angle: number
  time: number
  image: string | null
}

/** 批量预测单项结果 */
export interface BatchResultItem {
  filename: string
  angle: number | null
  time: number
  error: string | null
}

/** 批量预测响应 */
export interface BatchPredictResponse {
  results: BatchResultItem[]
  total_time: number
}

/** 视频抽帧模式 */
export type VideoFrameMode = 'fps' | 'frame_interval'

/** 视频预测单项结果 */
export interface VideoFrameResult {
  frame_idx: number
  timestamp: number
  angle: number
  time: number
}

/** 视频预测响应 */
export interface VideoPredictResponse {
  total_frames: number
  processed_frames: number
  total_time: number
  results: VideoFrameResult[]
}

/** 健康检查响应 */
export interface HealthResponse {
  status: 'ok' | 'model_not_loaded'
  model_loaded: boolean
}

/** 模型信息响应 */
export interface InfoResponse {
  model_name: string
  model_path: string
  image_size: number
  angle_range: string
  device: string
  optimization_enabled: boolean
  smart_crop_enabled: boolean
  multi_scale_enabled: boolean
}

/** API 错误（统一 { detail } 格式） */
export class ApiError extends Error {
  status: number
  detail: string

  constructor(status: number, detail: string) {
    super(detail)
    this.name = 'ApiError'
    this.status = status
    this.detail = detail
  }
}
