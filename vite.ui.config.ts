import reactRefresh from '@vitejs/plugin-react-refresh'
import { defineConfig } from 'vite'
import { viteSingleFile } from 'vite-plugin-singlefile'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  root: './src',
  plugins: [reactRefresh(), viteSingleFile()],
  esbuild: {
    jsxFactory: 'jsx',
    jsxInject: `import { jsx } from "@emotion/react"`,
  },
  build: {
    outDir: '../dist',
    emptyOutDir: false,
    target: 'esnext',
    assetsInlineLimit: 100000000,
    chunkSizeWarningLimit: 100000000,
    cssCodeSplit: false,
    brotliSize: false,
    rollupOptions: {
      inlineDynamicImports: true,
      output: {
        manualChunks: () => 'everything.js', // for viteSingleFile
      },
    },
    watch: mode === 'production' ? null : {},
    sourcemap: mode === 'production' ? false : 'inline',
  },
}))
