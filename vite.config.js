//import { defineConfig } from 'vite'
//import react from '@vitejs/plugin-react'

// https://vite.dev/config/
//export default defineConfig({
//  plugins: [react()],
//})

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api/v1': {
        target: 'http://localhost:8080', // seu backend rodando aqui
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/v1/, ''), // remove "/api/v1"
      }
    }
  }
})
