import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts'
import type { VideoFrameResult } from '@/types/api'

interface VideoAngleChartProps {
  results: VideoFrameResult[]
}

export function VideoAngleChart({ results }: VideoAngleChartProps) {
  if (!results.length) return null

  const data = results.map((r) => ({
    timestamp: Number(r.timestamp.toFixed(2)),
    angle: r.angle,
    frame_idx: r.frame_idx,
  }))

  return (
    <div className="h-72 w-full md:h-80">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 10, right: 10, bottom: 20, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis
            dataKey="timestamp"
            type="number"
            domain={['dataMin', 'dataMax']}
            tickFormatter={(v) => `${v}s`}
            tick={{ fontSize: 11, fill: '#64748b' }}
            label={{ value: '时间 (秒)', position: 'bottom', offset: 0, fontSize: 11, fill: '#64748b' }}
          />
          <YAxis
            domain={[0, 80]}
            tick={{ fontSize: 11, fill: '#64748b' }}
            label={{ value: '角度 (°)', angle: -90, position: 'insideLeft', fontSize: 11, fill: '#64748b' }}
          />
          <Tooltip
            formatter={(v: number) => [`${v.toFixed(1)}°`, '角度']}
            labelFormatter={(l) => `时间: ${l}s`}
            contentStyle={{ fontSize: 12, borderRadius: 8 }}
          />
          <ReferenceLine y={30} stroke="#22c55e" strokeDasharray="4 4" opacity={0.4} />
          <ReferenceLine y={60} stroke="#f59e0b" strokeDasharray="4 4" opacity={0.4} />
          <Line
            type="monotone"
            dataKey="angle"
            stroke="#2563eb"
            strokeWidth={2}
            dot={{ r: 2, fill: '#2563eb' }}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
