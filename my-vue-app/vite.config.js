import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  server: {
    proxy: {
      // 所有 /api 开头的请求都会代理到本地后端
      '/api': {
        target: 'http://192.168.187.167:8080', // Spring Boot 服务地址
        changeOrigin: true,               // 必须
        rewrite: path => path.replace(/^\/api/, '')
      }
    }
  }
})
