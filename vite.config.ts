import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import cssInjectedByJsPlugin from 'vite-plugin-css-injected-by-js'

export default defineConfig({
  define: {
    'process.env': {},
    'process.env.NODE_ENV': JSON.stringify('production'),
  },
  plugins: [
    react(),
    cssInjectedByJsPlugin(),
  ],
  assetsInclude: ['**/*.css?inline'],
  resolve: {
    alias: {
      '@': '/src',
    },
  },
  build: {
    lib: {
      entry: 'src/embed.tsx',
      name: 'PaniecoWidget',
      formats: ['iife'],
      fileName: () => 'panieco-widget.js',
    },
    rollupOptions: {
      external: [],
      output: {
        inlineDynamicImports: true,
      },
    },
    cssCodeSplit: false, // ⚠️ CSS est injecté dans le JS (et pas un fichier à part)
    minify: true,
  },
})
