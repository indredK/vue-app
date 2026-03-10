import { defineConfig } from 'vite'
import uni from '@dcloudio/vite-plugin-uni'

global.uniPlugin = { options: {} }

export default defineConfig({
  base: './',
  plugins: [uni()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true
      }
    }
  }
})
