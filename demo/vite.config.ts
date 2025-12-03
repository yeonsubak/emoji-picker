import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";
import { defineConfig, PluginOption } from "vite";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()] as PluginOption[],
  base: "/",
  build: {
    outDir: "dist",
  },
  resolve: {
    alias: [
      {
        find: "@ferrucc-io/emoji-picker",
        replacement: resolve(
          __dirname,
          "../packages/emoji-picker/src/index.ts"
        ),
      },
      {
        find: "@",
        replacement: resolve(__dirname, "../packages/emoji-picker/src"),
      },
    ],
  },
});
