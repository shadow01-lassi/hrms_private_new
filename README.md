# HRMS - Human Resource Management System ("The Society App")

Welcome to the HRMS Monorepo. This codebase is structured to serve as a comprehensive Human Resource Management System tailored for housing societies and general enterprises. It consists of a modern, fast, offline-capable single-page frontend application and a highly secure, rate-limited, encrypted backend REST API service.

## 📁 Repository Structure

The project is structured as a monorepo split into frontend and backend components:

*   **[`/`](file:///)**: Root folder containing workspace configuration, multi-directory scripts, and repository dependencies.
*   **[`/frontend`](file:///Users/dhruv/Desktop/hrms/frontend)**: Client-side Single Page Application (React, Vite, TypeScript, PWA, Tailwind CSS v4).
*   **[`/backend`](file:///Users/dhruv/Desktop/hrms/backend)**: Server-side REST API application (Node.js, Express, TypeScript, PostgreSQL, Redis).

For deep-dive technical configurations and folder details, refer to the component-specific documentation:
*   📖 **[Frontend Documentation](file:///Users/dhruv/Desktop/hrms/frontend/README.md)**
*   📖 **[Backend Documentation](file:///Users/dhruv/Desktop/hrms/backend/README.md)**

---

## ⚡ Tech Stack Overview

### Frontend Stack
*   **Framework:** React 19 + TypeScript + Vite 6
*   **Styling:** Tailwind CSS v4 + Radix UI Primitives + Lucide icons
*   **State Management:** Zustand (persisted stores)
*   **Rich Text Editor:** Tiptap Rich Text Editor Engine (custom extension set)
*   **Build Pipeline & PWA:** Vite PWA Plugin (`vite-plugin-pwa`) with Service Workers (`sw.ts`) for caching and offline queues.
*   **Network Client:** Axios (featuring global payload interceptors)

### Backend Stack
*   **Runtime & Server:** Node.js + Express (TypeScript compiled via `tsc`)
*   **Primary Database:** PostgreSQL (using `pg` driver)
*   **In-Memory Store:** Redis (caching, tracking limits, session data, and rate limiting)
*   **Logging & Security:** Morgan, Winston-based log writers, helmet-style custom security headers, and XSS sanitizers.
*   **Third-party Integrations:** AWS S3 (file uploads), Nodemailer (email service), Web-Push (PWA browser notifications), Puppeteer (PDF compilation / exporting), WhatsApp Business Cloud API.

---

## 🔐 Cryptographic Communication Pipeline

One of the most critical aspects of this workspace is the **secure, end-to-end symmetric encryption pipeline** enforced between the client and the server. This prevents plain-text visibility of payload contents over network channels.

### Encryption Details
*   **Algorithm:** `AES-256-CBC` (Advanced Encryption Standard with a 256-bit key in Cipher Block Chaining mode).
*   **Secret Key:** Managed via `ENCRYPTION_SECRET_KEY` (in `backend/.env`) and `VITE_ENCRYPTION_SECRET_KEY` (in `frontend/.env`). This key **must be exactly 32 characters long**.
*   **Initialization Vector (IV):** Generated dynamically as a cryptographically strong random 16-byte value (`CryptoJS.lib.WordArray.random(16)` on the client / `crypto.randomBytes(16)` on the server) for every individual request.
*   **Payload Format:** Encrypted data is transmitted in the format: `iv_hex:ciphertext_hex` (IV and ciphertext converted to hex strings, separated by a colon).

### Pipeline Flow
1.  **Client-to-Server Request:**
    *   The frontend detects if the platform requires security (defined by matching official client IDs).
    *   If active, the request headers include `x-encrypted: true`.
    *   The request body JSON is stringified, encrypted using `AES-256-CBC` with a random IV, and packaged into a container: `{"data": "iv_hex:ciphertext_hex"}`.
    *   The backend's `encryptionMiddleware` detects the `x-encrypted` header, extracts and decrypts the payload, and overwrites `req.body` with the parsed JSON. The routing controllers receive normal, plain-text objects.
2.  **Server-to-Client Response:**
    *   The backend's `encryptionMiddleware` wraps the Express response method (`res.json`).
    *   If the original request carried `x-encrypted: true`, the middleware intercepts the response payload, encrypts the inner `data` field, appends the `x-encrypted: true` response header, and transmits the payload.
    *   The frontend Axios interceptor intercepts the response, detects the encryption header, decrypts the payload, and resolves the plain JSON object back to the caller.

---

## ⚙️ Quick Start & Workspace Scripts

Manage both components from the root directory using the scripts defined in [package.json](file:///Users/dhruv/Desktop/hrms/package.json):

### Running Development Environments
To start the services locally:

```bash
# Install root, backend, and frontend dependencies
npm install
npm install --prefix frontend
npm install --prefix backend

# Start Backend (runs on http://localhost:5056)
# Ensure Redis and PostgreSQL are active and configured in backend/.env
npm run dev --prefix backend

# Start Frontend (runs on http://localhost:5173)
npm run dev --prefix frontend
```

### Production Build & Deployment Pipelines
Build bundles for both apps:

```bash
# Build frontend static files
npm run build:frontend

# Build backend TypeScript to JavaScript
npm run build:backend

# Build both applications sequentially
npm run build:all
```

### Git Utility Wrappers
Convenience scripts to bundle verification, staging, and push steps:
```bash
# Build the frontend and commit changes
npm run push "Your Commit Message"

# Add all files, commit and push directly
npm run git "Your Commit Message"
```

---

## 📋 HRMS Master Pages

This project includes a comprehensive implementation of Human Resource Management System (HRMS) master pages.

### 1. Frontend Routes
The following client-side routes are registered and mapped to dashboard views:
*   **Dashboard Overview:** `/dashboard`
*   **Company Master List:** `/dashboard/registers/company-master`
*   **Add Company:** `/dashboard/registers/company-master/add`
*   **Edit Company:** `/dashboard/registers/company-master/edit/:id`
*   **Employee Master List:** `/dashboard/registers/employee-master`
*   **Add Employee:** `/dashboard/registers/employee-master/add`
*   **Edit Employee:** `/dashboard/registers/employee-master/edit/:id`

### 2. Backend REST APIs
The backend includes the following endpoints under `/api`:

**Company Master (`/api/master/company-master`):**
*   `GET /api/master/company-master` — List all companies (returns generated `cm_code` dynamically)
*   `GET /api/master/company-master/dropdown` — Fetch company dropdown helper (id, name)
*   `GET /api/master/company-master/:id` — Retrieve a single company by ID
*   `POST /api/master/company-master` — Create a new company master record
*   `PUT /api/master/company-master/:id` — Update an existing company master record
*   `PATCH /api/master/company-master/:id/deactivate` — Toggle company active/inactive status

**Employee Master (`/api/master/employees`):**
*   `GET /api/master/employees` — List all employees
*   `GET /api/master/employees/:id` — Retrieve a single employee by ID
*   `POST /api/master/employees` — Create a new employee record (Full Details)
*   `POST /api/master/employees/quick-create` — Quick employee setup (creates employee_master + employee_login records in a transaction)
*   `PUT /api/master/employees/:id` — Update an existing employee record
*   `PATCH /api/master/employees/:id/status` — Toggle employee active/inactive status

**HRMS Dashboard (`/api/dashboard/hrms`):**
*   `GET /api/dashboard/hrms` — Get stats count for the HRMS Dashboard (Active/Inactive Companies, Active/Inactive Employees, and Active/Inactive Employee Login Accounts)

### 3. Features
*   **Dashboard Counts:** Display cards showing critical HRMS metrics.
*   **Company Master:** Table list using the reusable `json-new-data-table` component, full Add/Edit forms, and detail drawer sheet for displaying full rows.
*   **Employee Master:** Reusable table view, detail sheet, and Add/Edit forms featuring a dynamically loaded Company dropdown. Supports both Full Details creation and a Quick Setup workflow (creating employee profile + login account in a single transaction).
*   **Schema Compatibility:** Integrates natively with the existing PostgreSQL database schema. No DB migrations, table alters, drops, or updates are needed. Uses generated `cm_code` only for view layers and fallback fields (`em_last_editted_by`/`em_last_editted_at`) where applicable.

### 4. Run & Verification Commands
**Backend Application:**
```bash
cd backend
npm run dev
```

**Frontend Application:**
```bash
cd frontend
npm run dev
```

**Build & Typecheck Checks:**
```bash
# Backend/Frontend checks
npm run typecheck
npm run build
```

### 5. Testing Note
*   Both backend and frontend build and typecheck validations have passed on the feature branch `feature/hrms-master-pages`.

