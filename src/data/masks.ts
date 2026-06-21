/** 拍摄蒙版元数据 - 对应 public/masks/ 下的 8 个资源 */
export interface MaskMeta {
  id: string
  name: string
  src: string
  category: 'round-valve' | 'red-green' | 'red-yellow'
}

export const MASKS: MaskMeta[] = [
  { id: 'round-valve-top', name: '圆形阀门·上视图', src: '/masks/round-valve-top.png', category: 'round-valve' },
  { id: 'round-valve-side', name: '圆形阀门·侧视图', src: '/masks/round-valve-side.png', category: 'round-valve' },
  { id: 'red-green-1', name: '红绿 1', src: '/masks/red-green-1.png', category: 'red-green' },
  { id: 'red-green-2', name: '红绿 2', src: '/masks/red-green-2.png', category: 'red-green' },
  { id: 'red-green-3', name: '红绿 3', src: '/masks/red-green-3.png', category: 'red-green' },
  { id: 'red-yellow-1', name: '红黄 1', src: '/masks/red-yellow-1.png', category: 'red-yellow' },
  { id: 'red-yellow-2', name: '红黄 2', src: '/masks/red-yellow-2.png', category: 'red-yellow' },
  { id: 'red-yellow-3', name: '红黄 3', src: '/masks/red-yellow-3.png', category: 'red-yellow' },
]
