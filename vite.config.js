import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: './',
  plugins: [react()],
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    rollupOptions: {
      output: {
        entryFileNames: 'assets/index-da0676e1.js', // ← Force nama file JS tetap
        chunkFileNames: 'assets/[name]-da0676e1.js',
        assetFileNames: (assetInfo) => {
          if (assetInfo.name.endsWith('.css')) {
            return 'assets/index-a20a3ee9.css'; // ← Force nama file CSS tetap
          }
          return 'assets/[name]-[hash].[ext]'; // Other assets pakai hash
        }
      }
    }
  }
})