import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import tailwindcss from "@tailwindcss/vite";
import { VitePWA } from "vite-plugin-pwa";
import { NodeGlobalsPolyfillPlugin } from "@esbuild-plugins/node-globals-polyfill";
import type { RuntimeCaching } from "workbox-build";

const apiCaching: RuntimeCaching = {
  urlPattern: ({ url, request }) => {
    return (
      request.method === 'GET' &&
      url.pathname.startsWith('/api') &&
      !url.pathname.startsWith('/api/login') &&
      !url.pathname.startsWith('/api/user')
    );
  },
  handler: 'NetworkFirst',
  options: {
    cacheName: 'api-cache',
    networkTimeoutSeconds: 3,
    expiration: {
      maxEntries: 50,
      maxAgeSeconds: 60 * 5
    },
    cacheableResponse: {
      statuses: [0, 200]
    }
  }
};

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: "prompt",
      injectRegister: "auto",
      includeAssets: ["favicon.ico", "apple-touch-icon.png", "mask-icon.svg"],
      devOptions: {
        enabled: false
      },
      strategies: "injectManifest",
      srcDir: "src",
      filename: "sw.ts",
      injectManifest: {
        maximumFileSizeToCacheInBytes: 10 * 1024 * 1024,
      },
      workbox: {
        cleanupOutdatedCaches: true,
        globPatterns: [],
        runtimeCaching: [
          {
            urlPattern: ({ request }) => request.destination === 'image',
            handler: 'CacheFirst',
            options: {
              cacheName: 'image-cache',
              expiration: {
                maxEntries: 200,
                maxAgeSeconds: 60 * 60 * 24 * 30
              }
            }
          },
          apiCaching
        ],
        navigateFallback: null
      },
      manifest: {
        name: "Conversational AI",
        short_name: "Conversational AI",
        description: "Conversational AI",
        theme_color: "#101010",
        background_color: "#ffffff",
        display: "standalone",
        start_url: "/",
        scope: "/",
        icons: [
          { src: "pwa-64x64.png", sizes: "64x64", type: "image/png" },
          { src: "pwa-192x192.png", sizes: "192x192", type: "image/png" },
          { src: "pwa-512x512.png", sizes: "512x512", type: "image/png" },
          { src: "maskable-icon-512x512.png", sizes: "512x512", type: "image/png", purpose: "maskable" }
        ]
      }
    })
  ],

  server: {
    host: '0.0.0.0',
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:5056',
        changeOrigin: true,
        secure: false,
      },
    },
    watch: {
      usePolling: true,           // ← Yeh line add ki hai (macOS fix)
      interval: 1000,
    },
    hmr: {
      overlay: false
    }
  },

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },

  optimizeDeps: {
    include: [
      "react", "react-dom", "react-router-dom", "zustand", "axios", "date-fns",
      "dayjs", "lucide-react", "framer-motion", "recharts", "d3",
      "@tiptap/core", "@tiptap/react", "@tiptap/starter-kit",
      // ... baaki tere existing optimizeDeps same rakh
    ],
    esbuildOptions: {
      plugins: [
        NodeGlobalsPolyfillPlugin({
          buffer: true,
          process: true,
        }),
      ],
      define: {
        global: 'globalThis',
        process: JSON.stringify({ env: { NODE_ENV: '"development"' } }),
      },
    },
  },

  define: {
    global: 'globalThis',
    process: JSON.stringify({ env: { NODE_ENV: '"development"' } }),
  },

  build: {
    chunkSizeWarningLimit: 1500,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router-dom')) return 'vendor-react';
            if (id.includes('@tiptap') || id.includes('prosemirror')) return 'vendor-editor';
            if (id.includes('recharts') || id.includes('d3')) return 'vendor-charts';
            if (id.includes('lucide-react')) return 'vendor-icons';
            if (id.includes('xlsx')) return 'vendor-xlsx';
            if (id.includes('html2pdf') || id.includes('jspdf')) return 'vendor-pdf';
            if (id.includes('@radix-ui') || id.includes('framer-motion')) return 'vendor-ui';
            return 'vendor-core';
          }
        }
      }
    }
  },
});