import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // GitHub Pages: set base to repo name, e.g. '/ring-test/'
  // For local dev or root hosting, use '/'
  base: process.env.GITHUB_PAGES ? '/ring-test/' : '/',
})
