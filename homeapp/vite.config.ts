import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import legacy from '@vitejs/plugin-legacy'
import path from "path"

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    legacy({
      targets: ["Chrome >= 47"],
      modernPolyfills: false,
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    host: true,
    allowedHosts: ["hehexdpc.local"],
    port: 5173,
  },
  base: "/",
  build: {
    modulePreload: false,  // Good - Tizen breaks on this
    cssTarget: "chrome61",
    minify: 'terser',      // Use terser for better ES5 compatibility
    rollupOptions: {
      output: {
        manualChunks: undefined, // Single chunk is more reliable on Tizen
      },
    },
  },
})
