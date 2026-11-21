import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  // Relative assets work both at the Vite dev root and under the
  // /<repo-name>/ path used by GitHub Pages project sites.
  base: "./",
  plugins: [react()],
  server: {
    port: 5173,
  },
});