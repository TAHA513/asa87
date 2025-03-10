import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import themePlugin from "@replit/vite-plugin-shadcn-theme-json";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig(() => {
  const plugins = [
    react(),
    runtimeErrorOverlay(),
    themePlugin(),
  ];

  if (process.env.NODE_ENV !== "production" && process.env.REPL_ID !== undefined) {
    import("@replit/vite-plugin-cartographer").then(({ cartographer }) => {
      plugins.push(cartographer());
    });
  }

  return {
    plugins,
    resolve: {
      alias: [
        { find: '@', replacement: path.resolve(__dirname, 'client/src') },
        { find: '@shared', replacement: path.resolve(__dirname, 'shared') }
      ],
    },
    root: path.resolve(__dirname), // جعل root هو المجلد الرئيسي للمشروع
    build: {
      outDir: path.resolve(__dirname, "dist"),
      emptyOutDir: true,
    },
  };
});