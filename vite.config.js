import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3005,
    host: '0.0.0.0',
    allowedHosts: ['phulonghotels.com', '0.0.0.0'],
    proxy: {
      '/api/v1': {
        target: 'http://localhost:3001',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/v1/, '/api/v1'),
      },
    },
  },
})
