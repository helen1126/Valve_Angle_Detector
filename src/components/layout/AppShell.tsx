import { NavLink, Outlet } from 'react-router-dom'
import { Image, Images, Video, Camera, Settings, Gauge, Activity } from 'lucide-react'
import { HealthBadge } from './HealthBadge'

const NAV_ITEMS = [
  { to: '/', label: '单张', icon: Image, end: true },
  { to: '/batch', label: '批量', icon: Images, end: false },
  { to: '/video', label: '视频', icon: Video, end: false },
  { to: '/live', label: '实时', icon: Activity, end: false },
  { to: '/camera', label: '拍摄', icon: Camera, end: false },
  { to: '/settings', label: '设置', icon: Settings, end: false },
]

export function AppShell() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* 桌面端顶部导航 */}
      <header className="sticky top-0 z-30 hidden border-b border-slate-200 bg-white/90 backdrop-blur md:block">
        <div className="mx-auto flex h-14 max-w-6xl items-center gap-6 px-6">
          <NavLink to="/" className="flex items-center gap-2 font-semibold text-slate-900">
            <Gauge className="text-brand-600" size={22} />
            <span>阀门角度检测</span>
          </NavLink>
          <nav className="flex flex-1 items-center gap-1">
            {NAV_ITEMS.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
                    isActive ? 'bg-brand-50 text-brand-700' : 'text-slate-600 hover:bg-slate-100'
                  }`
                }
              >
                <item.icon size={16} />
                {item.label}
              </NavLink>
            ))}
          </nav>
          <HealthBadge />
        </div>
      </header>

      {/* 移动端顶部精简栏 */}
      <header className="sticky top-0 z-30 flex h-12 items-center justify-between border-b border-slate-200 bg-white/90 px-4 backdrop-blur md:hidden">
        <NavLink to="/" className="flex items-center gap-2 font-semibold text-slate-900">
          <Gauge className="text-brand-600" size={18} />
          <span className="text-sm">阀门角度检测</span>
        </NavLink>
        <HealthBadge />
      </header>

      {/* 主体 */}
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-4 pb-24 md:px-6 md:py-6 md:pb-6">
        <Outlet />
      </main>

      {/* 移动端底部 Tab Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-30 flex border-t border-slate-200 bg-white/95 backdrop-blur md:hidden">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) =>
              `flex flex-1 flex-col items-center gap-0.5 py-2 text-[10px] ${
                isActive ? 'text-brand-600' : 'text-slate-500'
              }`
            }
          >
            <item.icon size={20} />
            {item.label}
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
