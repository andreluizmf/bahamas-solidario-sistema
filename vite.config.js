import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  cacheDir: 'node_modules/.vite-bento',
  plugins: [react()],
})
