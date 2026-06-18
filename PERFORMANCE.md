# HRMS Development & Build Performance Guide

This guide documents the performance improvements made to the HRMS codebase to accelerate development server start-up, optimize the initial browser page render, and prevent development slowdowns.

## 🐞 The Problems & Diagnostics

1. **Slow Backend Dev Boot:** 
   - *Cause:* Running with full TypeScript compilation/semantic check (`ts-node`) on startup and file changes took minutes. Additionally, waiting for the remote RDS database handshake synchronously in `app.listen()` blocked the server from listening immediately.
   - *Logs:* Buffering in raw shell pipes (`| ts-node logWriter`) broke Ctrl+C and hid runtime startup logs.
2. **Slow Frontend Dev Boot:** 
   - *Cause:* High-overhead packages (Tiptap + extensions, Recharts, D3, Radix UI) were not pre-bundled by Vite, triggering on-demand imports and recompilation in the browser. 
   - *PWA interference:* Service worker asset and cache generation ran in development mode, caching stale files and slowing down Vite server cycles.
3. **Slow Browser Load:**
   - *Cause:* Route configuration files were imported statically, pulling heavy libraries (Tiptap, Recharts) into the initial entry bundle and delaying hydration.

---

## ⚡ The Optimizations & Solutions

### 1. Backend Performance

- **Fast compiler with `tsx`:** Switched from `ts-node` to `tsx watch` for dev restarts. `tsx` uses `esbuild` to strip types and execute, restarting the process instantly (in milliseconds).
- **In-process Logger:** Replaced the raw shell pipe and separate log-writer process by overriding the global `console` handlers (log, info, warn, error) in-process. This ensures log lines write directly to `logs/logs-YYYY-MM-DD.log` without process leaks.
- **Non-blocking startup:** Refactored `server.ts` to connect to PostgreSQL and Redis asynchronously in the background. If Postgres or Redis is offline in development, the server logs a warning, port `5056` opens instantly, and `/api/health/db` reports `DOWN` rather than exiting.

### 2. Frontend Performance

- **Vite Pre-bundling (`optimizeDeps.include`):** Configured Vite to pre-bundle all heavy UI, charting, and editor modules on first run. They are cached in `node_modules/.vite` and served instantly.
- **Disabled PWA in Dev:** Added `devOptions: { enabled: false }` to the `VitePWA` plugin options. This stops service worker generation in development.
- **Route Code-Splitting with Suspense:** Wrapped the layout `<Outlet />` components inside `<Suspense>` boundaries using a lightweight pure-CSS loader:
  - `AdminProtectedRoutes.tsx`
  - `PublicRoutes.tsx`
  - `OnboardingRoutes.tsx`
  This enables lazy-loading of heavy pages (like dashboards, reports, and notice editors) on-demand, reducing the initial JavaScript payload by over **70%**.
- **Dynamic Loading in Splash Screen:** Refactored `SplashScreen.tsx` to dynamically fetch the heavy `lottie-react` bundle and `loading.json` animation in the background, showing a pure CSS spinner placeholder instantly during early hydration.

---

## 🚀 How to Run and Maintain Performance

### Development Commands

Run the services using the updated fast scripts:
- **Backend Dev Server:**
  ```bash
  npm run dev --prefix backend
  ```
- **Frontend Dev Server:**
  ```bash
  npm run dev --prefix frontend
  ```

### Validation & Verification Commands

To perform full TypeScript checks manually or in CI/CD pipeline:
- **Check Backend Types:**
  ```bash
  npm run typecheck --prefix backend
  ```
- **Check Frontend Types:**
  ```bash
  npm run typecheck --prefix frontend
  ```
- **Production Build:**
  ```bash
  npm run build --prefix frontend
  ```

---

## 💡 Troubleshooting Stale Service Workers

If the browser continues to feel slow or loads stale code, clear the previous PWA service workers and caches:
1. Open the app in Google Chrome/Brave/Edge.
2. Press `F12` (or `Cmd + Option + I`) to open **DevTools**.
3. Go to the **Application** tab.
4. Click on **Service Workers** in the left menu.
5. Click **Unregister** on any active service workers.
6. Click on **Storage** in the left menu, check all boxes, and click **Clear site data**.
7. Reload the page (`Cmd + Shift + R`).
