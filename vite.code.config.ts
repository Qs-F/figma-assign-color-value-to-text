import path from 'path'
import { defineConfig } from 'vite'
import { viteSingleFile } from 'vite-plugin-singlefile'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  root: './src',
  plugins: [viteSingleFile()],
  build: {
    outDir: '../dist',
    emptyOutDir: false,
    target: 'es2015',
    assetsInlineLimit: 100000000,
    chunkSizeWarningLimit: 100000000,
    cssCodeSplit: false,
    brotliSize: false,
    rollupOptions: {
      inlineDynamicImports: true,
      output: {
        manualChunks: () => 'index.js',
      },
    },
    watch: mode === 'production' ? null : {},
    sourcemap: mode === 'production' ? false : 'inline',
    lib: {
      entry: path.resolve(__dirname, 'src/index.ts'),
      formats: ['es'],
      fileName: () => `index.js`,
    },
  },
}))
