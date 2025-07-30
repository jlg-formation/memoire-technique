import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
  base: "/memoire-technique/", // ← Ajouté pour GitHub Pages
  plugins: [react(), tailwindcss()],
  build: {
    // Adjusted chunk size limit to 5 megabits (~5 MB)
    chunkSizeWarningLimit: 5000,
    rollupOptions: {
      external: ["mammoth"],
    },
  },
});
