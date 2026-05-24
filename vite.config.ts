import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Base path: "/" — деплой на Vercel (root домен).
export default defineConfig(() => ({
  plugins: [react()],
  base: '/',
  build: {
    target: ['es2017', 'safari11'],  // iOS Telegram WebApp v6.0 WebView baseline
  },
  server: {
    host: '0.0.0.0',
    port: 5180,
    allowedHosts: ['.trycloudflare.com', '204.168.187.59', 'localhost'],
    cors: true,
  },
}))
