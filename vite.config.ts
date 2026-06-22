import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { getCertificate } from '@vitejs/plugin-basic-ssl'
import path from 'node:path'

// 开发环境启用 HTTPS（手机端访问相机需要 HTTPS 或 localhost）
// 使用 @vitejs/plugin-basic-ssl 的 getCertificate 自动生成自签名证书
// 证书缓存在 node_modules/.vite/basic-ssl/_cert.pem，过期后自动重新生成
export default defineConfig(async () => {
  const cert = await getCertificate('node_modules/.vite/basic-ssl')
  return {
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      port: 5173,
      host: true,
      https: { cert, key: cert },
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            recharts: ['recharts'],
            react: ['react', 'react-dom', 'react-router-dom'],
          },
        },
      },
    },
  }
})
