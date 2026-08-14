import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  base: '/AI-Writing/',
  plugins: [react()],
  server: {
    proxy: {
      // Kimi Code API 代理配置
      '/api/kimi': {
        target: 'https://api.moonshot.cn',  // Moonshot API 地址
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/kimi/, ''),
      },
    },
  },
})
