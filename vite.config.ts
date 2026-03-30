import { defineConfig } from 'vite'

export default defineConfig({
  base: './',
  build: {
    assetsDir: '.',
  },
  server: {
    host: true,
    port: 5173,
  },
})
