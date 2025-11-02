import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// Конфигурация Vite: https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 3000,
    proxy: mode === "development" ? {
      "/api": {
        target: "http://localhost:8080",
        changeOrigin: true,
      },
      "/uploads": {
        target: "http://localhost:8080",
        changeOrigin: true,
      },
    } : undefined,
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    // Оптимизация сборки для производительности
    target: "es2015",
    minify: "esbuild",
    cssMinify: true,
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          // Выделяем vendor библиотеки в отдельные чанки
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui-vendor': ['@radix-ui/react-dialog', '@radix-ui/react-select', '@radix-ui/react-tabs'],
          'query-vendor': ['@tanstack/react-query'],
        },
        // Оптимизация имен файлов для кэширования
        chunkFileNames: 'assets/js/[name]-[hash].js',
        entryFileNames: 'assets/js/[name]-[hash].js',
        assetFileNames: (assetInfo) => {
          if (assetInfo.name?.endsWith('.jpg') || assetInfo.name?.endsWith('.jpeg') || assetInfo.name?.endsWith('.png') || assetInfo.name?.endsWith('.webp')) {
            return 'assets/images/[name]-[hash][extname]';
          }
          return 'assets/[ext]/[name]-[hash][extname]';
        },
      },
    },
    // Увеличиваем лимит предупреждений о размере чанков
    chunkSizeWarningLimit: 1000,
  },
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
    css: true,
  },
}));
