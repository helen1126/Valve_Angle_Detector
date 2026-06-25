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

// ===== OpenCV (OCV) 方法相关类型 =====

/** 预测方法 */
export type PredictMethod = 'dl' | 'ocv'

/** OCV 拍摄视角 */
export type OcvView = 'top' | 'side'

/** OCV 预测参数 */
export interface OcvPredictOptions {
  view: OcvView
  model?: 'ocv'
}

/** OCV 单张预测响应 */
export interface OcvPredictResponse {
  angle: number
  view: OcvView
  camera: string
  model_family: string
  model_type: string
  model_version: string
  elapsed_ms: number
}

/** OCV 批量预测单项结果（客户端组装） */
export interface OcvBatchResultItem {
  filename: string
  angle: number | null
  view: OcvView
  model_family: string | null
  model_type: string | null
  model_version: string | null
  elapsed_ms: number | null
  error: string | null
}

/** OCV 批量预测响应（客户端组装） */
export interface OcvBatchPredictResponse {
  results: OcvBatchResultItem[]
  total_time: number
}

/** OCV 视频抽帧单帧结果 */
export interface OcvVideoFrameResult {
  frame_index: number
  timestamp_sec: number
  angle: number
  view: OcvView
  camera: string
  model_family: string
  model_type: string
  model_version: string
  features: Record<string, number>
}

/** OCV 视频抽帧预测响应 */
export interface OcvVideoPredictResponse {
  total_frames: number
  extracted_frames: number
  source_fps: number
  results: OcvVideoFrameResult[]
  elapsed_ms: number
}

/** 实时预测单帧结果（客户端组装） */
export interface LiveFrameResult {
  frame_idx: number
  timestamp: number
  angle: number
  elapsed_ms: number
  method: PredictMethod
  error: string | null
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
