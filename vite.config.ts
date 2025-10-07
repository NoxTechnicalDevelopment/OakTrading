import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'

// https://vite.dev/config/
export default defineConfig({
  plugins: [svelte()],
  // Prevent production build .map files
  build: {
    sourcemap: false
  },

  // Prevent CSS dev sourcemaps (Vite option)
  css: {
    devSourcemap: false
  },

  // Prevent esbuild from generating sourcemaps during transforms
  esbuild: {
    sourcemap: false
  }
})
