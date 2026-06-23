import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost',
        changeOrigin: true,
        // Rewrite cookies so the browser stores them for localhost:5173
        // and sends them back on subsequent proxied requests
        cookieDomainRewrite: {
          'localhost': 'localhost'
        },
        configure: (proxy) => {
          proxy.on('proxyRes', (proxyRes) => {
            const cookies = proxyRes.headers['set-cookie'];
            if (cookies) {
              // Remove Secure flag in dev so cookies work on http://localhost:5173
              proxyRes.headers['set-cookie'] = cookies.map(cookie =>
                cookie.replace(/; Secure/gi, '').replace(/; SameSite=None/gi, '; SameSite=Lax')
              );
            }
          });
        },
      },
      '/ws': {
        target: 'ws://localhost',
        ws: true,
        changeOrigin: true,
      }
    }
  }
})