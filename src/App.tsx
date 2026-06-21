import { Routes, Route } from 'react-router-dom'
import { ApiConfigProvider } from '@/context/ApiConfigContext'
import { AppShell } from '@/components/layout/AppShell'
import SinglePredict from '@/pages/SinglePredict'
import BatchPredict from '@/pages/BatchPredict'
import VideoPredict from '@/pages/VideoPredict'
import CameraCapture from '@/pages/CameraCapture'
import Settings from '@/pages/Settings'

export default function App() {
  return (
    <ApiConfigProvider>
      <Routes>
        <Route element={<AppShell />}>
          <Route index element={<SinglePredict />} />
          <Route path="batch" element={<BatchPredict />} />
          <Route path="video" element={<VideoPredict />} />
          <Route path="camera" element={<CameraCapture />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </ApiConfigProvider>
  )
}
