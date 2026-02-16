import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from "path"
import tailwindcss from "@tailwindcss/vite"

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
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
    target: "es2015",      // Even lower target for Tizen 3.5 (Chrome 47-era)
    modulePreload: false,  // Good - Tizen breaks on this
    cssTarget: "chrome61", // Lowest Vite supports
    minify: 'terser',      // Use terser for better ES5 compatibility
    rollupOptions: {
      output: {
        manualChunks: undefined, // Single chunk is more reliable on Tizen
      },
    },
  },
  css: {
    transformer: 'lightningcss', // Try lightningcss if postcss doesn't work
  },
})