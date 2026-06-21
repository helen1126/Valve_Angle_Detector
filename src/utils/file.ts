import JSZip from 'jszip'

export const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/bmp']
export const ACCEPTED_IMAGE_EXTS = ['.jpg', '.jpeg', '.png', '.bmp']
export const ACCEPTED_VIDEO_TYPES = ['video/mp4', 'video/x-msvideo', 'video/quicktime', 'video/x-matroska']
export const ACCEPTED_VIDEO_EXTS = ['.mp4', '.avi', '.mov', '.mkv']

/** 判断是否为支持的图片 */
export function isAcceptedImage(file: File): boolean {
  const ext = file.name.toLowerCase().match(/\.[^.]+$/)?.[0] || ''
  return ACCEPTED_IMAGE_TYPES.includes(file.type) || ACCEPTED_IMAGE_EXTS.includes(ext)
}

/** 判断是否为支持的视频 */
export function isAcceptedVideo(file: File): boolean {
  const ext = file.name.toLowerCase().match(/\.[^.]+$/)?.[0] || ''
  return ACCEPTED_VIDEO_TYPES.includes(file.type) || ACCEPTED_VIDEO_EXTS.includes(ext)
}

/** 判断是否为 zip 压缩包 */
export function isZipFile(file: File): boolean {
  return file.name.toLowerCase().endsWith('.zip') || file.type === 'application/zip'
}

/** 从 zip 中提取图片文件 */
export async function extractImagesFromZip(file: File): Promise<File[]> {
  const zip = await JSZip.loadAsync(file)
  const images: File[] = []
  const entries = Object.values(zip.files).filter((e) => !e.dir)
  for (const entry of entries) {
    const ext = entry.name.toLowerCase().match(/\.[^.]+$/)?.[0] || ''
    if (!ACCEPTED_IMAGE_EXTS.includes(ext)) continue
    const blob = await entry.async('blob')
    const name = entry.name.split('/').pop() || entry.name
    images.push(new File([blob], name, { type: `image/${ext.slice(1) === 'jpg' ? 'jpeg' : ext.slice(1)}` }))
  }
  return images
}
