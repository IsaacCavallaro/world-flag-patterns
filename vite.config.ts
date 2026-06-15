import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  base: "/world-flag-patterns/",
  plugins: [react()],
});
