import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '')
  const backendPort = env.PORT || '3007'
  return {
    plugins: [react()],
    server: {
      port: 3006,
      host: '0.0.0.0',
      allowedHosts: ['phulonghotels.com', '0.0.0.0'],
      proxy: {
        '/api/v1': {
          target: `http://localhost:${backendPort}`,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api\/v1/, '/api/v1'),
        },
      },
    },
  }
})
