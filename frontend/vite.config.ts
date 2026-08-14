import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { nodePolyfills } from "vite-plugin-node-polyfills";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    nodePolyfills({
      // Midnight.js SDK requires these Node.js built-in polyfills in the browser
      include: ["buffer", "stream", "util", "crypto", "process"],
      globals: {
        Buffer: true,
        global: true,
        process: true,
      },
    }),
  ],
  resolve: {
    alias: {
      // Ensure correct ESM resolution for Midnight SDK packages
      "readable-stream": "vite-compatible-readable-stream",
    },
  },
  optimizeDeps: {
    // Force-include Midnight SDK for pre-bundling so Vite handles them correctly
    include: [
      "@midnight-ntwrk/dapp-connector-api",
      "@midnight-ntwrk/midnight-js-contracts",
      "@midnight-ntwrk/midnight-js-types",
    ],
    esbuildOptions: {
      target: "es2022",
    },
  },
  build: {
    target: "es2022",
    rollupOptions: {
      output: {
        manualChunks: {
          midnight: [
            "@midnight-ntwrk/dapp-connector-api",
            "@midnight-ntwrk/midnight-js-contracts",
          ],
        },
      },
    },
  },
  define: {
    // Required for some Midnight SDK internals
    "process.env.NODE_ENV": JSON.stringify(process.env.NODE_ENV || "development"),
  },
});
