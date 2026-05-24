import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Base path: production -> "/iishnitsa-miniapp/" (GitHub Pages subpath), dev -> "/".
export default defineConfig(({ mode }) => ({
  plugins: [react()],
  base: mode === 'production' ? '/iishnitsa-miniapp/' : '/',
  build: {
    target: ['es2017', 'safari11'],
  },
  server: {
    host: '0.0.0.0',
    port: 5180,
    allowedHosts: ['.trycloudflare.com', '204.168.187.59', 'localhost'],
    cors: true,
  },
}))
