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
    // prend tous les import 'xxx.css' et les injecte au runtime
    cssInjectedByJsPlugin(),
  ],
  resolve: {
    alias: {
      '@': '/src',
    },
  },
  build: {
    lib: {
      entry: 'src/embed.tsx',    // votre point d’entrée
      name: 'PaniecoWidget',     // exposé en global : window.PaniecoWidget
      formats: ['iife'],         // unique bundle auto-exécutable
      fileName: () => 'panieco-widget.js',
    },
    rollupOptions: {
      // on embarque **tout** dans le bundle
      external: [],
      output: {
        // pour s’assurer de ne pas créer de chunks dynamiques
        inlineDynamicImports: true,
      },
    },
    // IMPORTANT : désactive le découpage CSS en fichiers séparés
    cssCodeSplit: false,
    minify: true,
  },
  assetsInclude: ['**/*.css?inline'],
})
