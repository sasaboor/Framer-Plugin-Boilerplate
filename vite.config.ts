import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import mkcert from "vite-plugin-mkcert";
import framer from "vite-plugin-framer";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), mkcert(), framer()],
  build: {
    target: "ES2022",
  },
  resolve: {
    // Avoid duplicate React instances that break context
    dedupe: ["react", "react-dom"],
  },
  esbuild: {
    drop: ["debugger"],
    pure: [
      "console.log",
      "console.info",
      "console.debug",
      "console.warn"
    ],
  },
});
