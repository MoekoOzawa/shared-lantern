// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// 👇 GitHub のリポジトリ名と合わせる
export default defineConfig({
  base: "/shared-lantern/",
  plugins: [react()],
});
