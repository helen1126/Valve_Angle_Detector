interface AngleGaugeProps {
  angle: number // 0~80
  size?: number
}

const MAX_ANGLE = 80

/** 角度 → 颜色 */
function angleColor(angle: number): string {
  if (angle < 30) return '#22c55e' // green
  if (angle < 60) return '#f59e0b' // amber
  return '#ef4444' // red
}

/** 阀门角度 → SVG 坐标（半圆，左 0° → 右 80°） */
function polar(cx: number, cy: number, r: number, valveAngle: number) {
  const svgAngle = Math.PI * (1 - valveAngle / MAX_ANGLE) // 180°→0°
  return {
    x: cx + r * Math.cos(svgAngle),
    y: cy - r * Math.sin(svgAngle),
  }
}

export function AngleGauge({ angle, size = 240 }: AngleGaugeProps) {
  const cx = 100
  const cy = 100
  const r = 80
  const w = 200
  const h = 120

  const clamped = Math.max(0, Math.min(MAX_ANGLE, angle))
  const needle = polar(cx, cy, r - 8, clamped)
  const color = angleColor(clamped)

  // 刻度：0, 20, 40, 60, 80
  const ticks = [0, 20, 40, 60, 80]

  // 背景弧
  const start = polar(cx, cy, r, 0)
  const end = polar(cx, cy, r, MAX_ANGLE)

  return (
    <div className="flex flex-col items-center" style={{ width: size }}>
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full">
        {/* 背景弧 */}
        <path
          d={`M ${start.x} ${start.y} A ${r} ${r} 0 0 1 ${end.x} ${end.y}`}
          fill="none"
          stroke="#e2e8f0"
          strokeWidth={12}
          strokeLinecap="round"
        />
        {/* 彩色进度弧 */}
        <path
          d={`M ${start.x} ${start.y} A ${r} ${r} 0 0 1 ${needle.x} ${needle.y}`}
          fill="none"
          stroke={color}
          strokeWidth={12}
          strokeLinecap="round"
        />
        {/* 刻度 */}
        {ticks.map((t) => {
          const p1 = polar(cx, cy, r + 6, t)
          const p2 = polar(cx, cy, r - 6, t)
          const label = polar(cx, cy, r + 16, t)
          return (
            <g key={t}>
              <line x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} stroke="#94a3b8" strokeWidth={1.5} />
              <text x={label.x} y={label.y} fontSize={9} fill="#64748b" textAnchor="middle" dominantBaseline="middle">
                {t}°
              </text>
            </g>
          )
        })}
        {/* 指针 */}
        <line x1={cx} y1={cy} x2={needle.x} y2={needle.y} stroke={color} strokeWidth={3} strokeLinecap="round" />
        <circle cx={cx} cy={cy} r={5} fill={color} />
      </svg>
      <div className="-mt-2 text-center">
        <div className="text-3xl font-bold" style={{ color }}>
          {clamped.toFixed(1)}°
        </div>
        <div className="text-xs text-slate-400">预测角度</div>
      </div>
    </div>
  )
}
