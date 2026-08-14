import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { nodePolyfills } from "vite-plugin-node-polyfills";
import wasm from "vite-plugin-wasm";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    wasm(),
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
  optimizeDeps: {
    // Exclude WASM packages from pre-bundling so Vite handles them correctly
    exclude: ["@midnightntwrk/ledger-v9"],
    esbuildOptions: {
      target: "es2022",
    },
  },
  build: {
    target: "es2022",
    rollupOptions: {
      output: {
        manualChunks: {
          react: ["react", "react-dom"],
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