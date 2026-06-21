/** 格式化角度 */
export function formatAngle(angle: number | null): string {
  if (angle === null || angle === undefined) return '-'
  return `${angle.toFixed(1)}°`
}

/** 格式化耗时（秒） */
export function formatTime(seconds: number): string {
  if (seconds < 1) return `${(seconds * 1000).toFixed(0)} ms`
  return `${seconds.toFixed(3)} s`
}

/** 格式化时间戳 */
export function formatTimestamp(seconds: number): string {
  return `${seconds.toFixed(2)}s`
}

/** 格式化文件大小 */
export function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`
}
