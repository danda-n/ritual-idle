import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

export default defineConfig({
  // GitHub Pages serves the site under /ritual-idle/; the deploy workflow sets VITE_BASE.
  base: process.env.VITE_BASE ?? "/",
  plugins: [react()],
  test: {
    include: ["src/**/*.test.ts"],
  },
});
