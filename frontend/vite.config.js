import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: "0.0.0.0",
    port: 5173,
    allowedHosts: [
      "localhost",
      "127.0.0.1",
      "209b-114-33-10-41.ngrok-free.app",
      "966b-114-33-10-41.ngrok-free.app"
    ],
  },
  build: {
    outDir: "build",
    rollupOptions: {
      output: {
        // Avoid native Rollup optimizations
        preferConst: true,
      },
    },
  },
});
