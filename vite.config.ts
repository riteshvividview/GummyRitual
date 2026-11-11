import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    watch: {
      // Raw client uploads (optimized copies live in src/assets/adults).
      // Watching them crashes the dev server with EBUSY on Windows while
      // large files are still being copied in.
      ignored: ['**/Organize-adult-section/**', '**/reference-crops/**'],
    },
  },
})
