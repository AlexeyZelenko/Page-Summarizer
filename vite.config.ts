import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: 'index.html',
        content: 'src/content.ts',
        background: 'src/background.ts'
      },
      output: {
        // Ensure consistent file names for chrome extension
        entryFileNames: 'assets/[name].js',
        chunkFileNames: 'assets/[name].js',
        assetFileNames: 'assets/[name].[ext]'
      }
    }
  },
  define: {
    // Prevent Vue devtools in production
    __VUE_PROD_DEVTOOLS__: false
  }
})