/** 触发浏览器下载 */
export function downloadBlob(content: BlobPart, filename: string, mime: string) {
  const blob = new Blob([content], { type: mime })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

/** 下载 JSON */
export function downloadJson(data: unknown, filename: string) {
  downloadBlob(JSON.stringify(data, null, 2), filename, 'application/json')
}

/** 将对象数组导出为 CSV */
export function downloadCsv(
  rows: Record<string, unknown>[],
  headers: { key: string; label: string }[],
  filename: string,
) {
  const head = headers.map((h) => h.label).join(',')
  const body = rows
    .map((row) =>
      headers
        .map((h) => {
          const v = row[h.key]
          const s = v === null || v === undefined ? '' : String(v)
          // 含逗号/引号需转义
          return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
        })
        .join(','),
    )
    .join('\n')
  downloadBlob(`\uFEFF${head}\n${body}`, filename, 'text/csv;charset=utf-8')
}

/** 下载 base64 图片 */
export function downloadBase64Image(base64: string, filename: string) {
  const bytes = atob(base64)
  const arr = new Uint8Array(bytes.length)
  for (let i = 0; i < bytes.length; i++) arr[i] = bytes.charCodeAt(i)
  downloadBlob(arr, filename, 'image/jpeg')
}
