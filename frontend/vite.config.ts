import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      react: path.resolve(__dirname, "node_modules/react"),
      "react-dom": path.resolve(__dirname, "node_modules/react-dom"),
      "@mr-igorinni/react-yandex-maps-fork": path.resolve(
        __dirname,
        "node_modules/@mr-igorinni/react-yandex-maps-fork/dist/react-yandex-maps-fork.esm.js"
      ),
    },
    dedupe: ["react", "react-dom"],
  },
  optimizeDeps: {
    include: [
      "react",
      "react-dom",
      "react-router-dom",
      "@mr-igorinni/react-yandex-maps-fork",
    ],
  },
  build: {
    commonjsOptions: {
      include: [/react-yandex-maps-fork/, /node_modules/],
      transformMixedEsModules: true,
    },
    rollupOptions: {
      output: {
        assetFileNames: (assetInfo) => {
          // Картинки в отдельную директорию images
          if (
            assetInfo.name &&
            /\.(png|jpg|jpeg|gif|svg|webp|ico)$/i.test(assetInfo.name)
          ) {
            return "images/[name][extname]";
          }
          // Остальные ассеты в assets
          return "assets/[name]-[hash][extname]";
        },
      },
    },
  },
});
