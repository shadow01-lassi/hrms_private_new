22# HRMS Backend Service

This folder contains the server-side REST API application for the HRMS project. It is built using **Node.js**, **Express**, **TypeScript**, **PostgreSQL** as the primary relational database, and **Redis** for in-memory caching and session-based rate limiting.

---

## ⚡ Key Pipeline Middlewares

The Express application pipeline ([`src/server.ts`](file:///Users/dhruv/Desktop/hrms/backend/src/server.ts)) executes several specialized middlewares in sequence to secure and optimize request handling:

1.  **Response Compression:** `compression()` compresses response payloads exceeding 1KB to optimize network bandwidth.
2.  **Health Monitor:** `express-status-monitor()` hosts a server status page detailing memory, CPU, and network usage.
3.  **CORS Guard:** Restricts requests to allowed origins (including development domains, localhost, and secure production subdomains) and exposes custom encryption and version headers.
4.  **Request Logging:** Custom `requestLoggerMiddleware` captures request properties and routes them to a local file logger (`src/utils/logWriter.ts`).
5.  **Security Headers:** Enforces security headers (HSTS, frame options, content security policies) to prevent scripting attacks.
6.  **XSS Shield:** Custom `xssMiddleware` sanitizes query and request parameters against HTML injection using the `xss` library.
7.  **Platform Check:** `detectPlatform` identifies the client origin via user agents and requests headers (`x-platform-id`).
8.  **Payload Cryptography:** `encryptionMiddleware` automatically decrypts incoming payloads and encrypts outgoing response data objects if `x-encrypted: "true"` is present.

---

## 📂 Directory Layout (`/src`)

```
src/
├── Controllers/       # API controllers managing business logic
│   ├── user.controller.ts     # User login, OTP validation, passwords, tokens
│   ├── email.controller.ts    # Compilation and sending of transaction emails
│   ├── style.controller.ts    # Custom app layout color theme settings
│   └── utils/                 # Global error responders and utility controllers
├── Interfaces/        # TypeScript structure and interface models
├── dao/               # Data Access Objects encapsulating raw SQL queries
├── data/              # Default configuration collections and static lists
├── lib/               # Shared engine connectors
│   ├── db.ts          # PostgreSQL connection pool using pg
│   └── redis.ts       # Redis client handling connections, caches, and rate limits
├── middleware/        # Intercepting functions (auth checks, rate limiters, crypto)
├── routes/            # Route modules mapping paths to controllers
├── super-router/      # Central router mounting submodules and applying middleware
│   └── app.router.ts  # Master API route coordinator
├── sql/               # Relational SQL schemas
│   ├── tables.sql     # Database tables declarations
│   ├── functions.sql  # Database functions and operations logic
│   └── triggers.sql   # Relational triggers for audit tables
├── templates/         # Nodemailer HTML template files
└── server.ts          # App configuration, server startup, and listener
```

---

## 🗄️ Database Schema & Tables Map

The relational schema is configured in PostgreSQL as defined in [`sql/tables.sql`](file:///Users/dhruv/Desktop/hrms/backend/sql/tables.sql). It contains 29 core tables:

### 1. Versioning & Configuration
*   **`changelog`**: Tracks application updates and releases (`c_version`, `c_date`, `c_title`, arrays for improvements, fixes, patches).
*   **`permission_master`**: Individual features and action codes (`pm_code`, `pm_description`).
*   **`role_master`**: User access roles (`rm_name`, access array, tracking logs).
*   **`role_permissions`**: Pivot table mapping roles to permission codes (`rp_rm_id` ➔ `role_master`, `rp_pm_id` ➔ `permission_master`).
*   **`menu_master`**: Administers the layout and permissions of the sidebar navigation panel (`mm_name`, parent pointers, icons, links, order, permission key).
*   **`reason_master`**: Catalog of deactivation or status change reasons.

### 2. Tenant & Subscription Masters
*   **`company_master`**: Mapped to housing societies or corporate tenants using the system (`cm_name`, status, Pan/GST details, bank accounts, logo, UPI parameters).
*   **`company_subscription`**: Tracks subscription timelines, billing, grace periods, pricing, and status.

### 3. Department, Designations & Calendars
*   **`department_master`**: List of operational departments within each company.
*   **`designation_master`**: Job titles/positions mapped to companies.
*   **`leave_type_master`**: Types of leaves (casual, medical, sick) and status (paid/unpaid) mapped per company.
*   **`holiday_master`**: Calendar events representing holidays per company, with restricted holiday options.
*   **`skill_master`**: Skill category catalogs for talent evaluation.
*   **`expense_category_master`**: Classifications for corporate expense claims (e.g., travel, food).

### 4. Employee Profile & KYC
*   **`employee_master`**: Core records for personal, contact, address, joining, termination, notice period, and status details.
*   **`employee_kyc`**: Maps files, profile images, and document categories (Aadhar, PAN, Voter ID) to employee records.
*   **`employee_login`**: Credentials mapping employee records to standard usernames, roles, and bcrypt password hashes.

### 5. Shift Attendance & Work Loggers
*   **`attendance_logs`**: Logs daily clock-in/out timestamps, working hours, and presence statuses.
*   **`employee_leave_applications`**: Handles leave submissions, approval status, total days count, and approval signatures.
*   **`leave_balances`**: Tracks allocations vs used balances year-by-year per leave type for each employee.

### 6. Payroll & Expense Operations
*   **`employee_payroll`**: Tracks base salaries, banking details, PF compliance flags, leave counts, and mobile attendance settings.
*   **`salary_master`**: Monthly salary runs metadata (month, year, totals, payment statuses).
*   **`salary_details`**: Relates salary run IDs to salary breakdown items (basic pay, HRA, DA, unpaid leaves deductions, fines, allowances).
*   **`employee_expenses`**: Employee expense claims, upload proofs, payment references, and approval tracking.
*   **`employee_advances_deductions`**: Tracks cash advances, fine deductions, and reimbursements.

### 7. Performance & Attachments
*   **`performance_review_cycles`**: Time ranges for review cycles.
*   **`employee_reviews`**: Self-ratings, manager ratings, and review comments mapped to review cycles.
*   **`employee_skills`**: Tracks skills and proficiency levels (Beginner, Intermediate, Expert) per employee.
*   **`document_master`**: Uploaded document folders (contracts, certificates) mapped per employee.

---

## 🗺️ API Routing Map

All requests target endpoints registered through the main coordinator [`src/super-router/app.router.ts`](file:///Users/dhruv/Desktop/hrms/backend/src/super-router/app.router.ts):

### Public / Open Endpoints (No Auth Session Required)
*   **`/api/open/*`**: Mounted to [`src/routes/open.route.ts`](file:///Users/dhruv/Desktop/hrms/backend/src/routes/open.route.ts). Exposes non-protected assets, layouts, styles, and public registration.
*   **`/api/onboard/*`**: Mounted to [`src/routes/onboard.route.ts`](file:///Users/dhruv/Desktop/hrms/backend/src/routes/onboard.route.ts). Initial onboarding of companies and admin registers.
*   **`/api/login`**: Rate-limited (5 attempts per minute). Performs credentials verification.
*   **`/api/verify-otp`**: Rate-limited (5 attempts per minute). Verifies 2FA device OTP.
*   **`/api/resend-otp`**: Rate-limited (5 attempts per minute). Re-triggers OTP email delivery.
*   **`/api/refresh-token`**: Issues new access tokens using refresh token cookies.
*   **`/api/set-password`**: Rate-limited. Saves new login passwords.
*   **`/api/password/*`**: Mounted to [`src/routes/password.route.ts`](file:///Users/dhruv/Desktop/hrms/backend/src/routes/password.route.ts). Handles reset-token checks.
*   **`/api/error/*`**: Mounted to [`src/routes/error.router.ts`](file:///Users/dhruv/Desktop/hrms/backend/src/routes/error.router.ts). Captures errors and compiles stack logs.
*   **`/api/style`**: Public configuration get method to fetch company styling.

### Protected Endpoints (VerifyToken Middleware Enforced)
*   **`/api/logout`**: Termines user token session.
*   **`/api/user/*`**: Mounted to [`src/routes/user.router.ts`](file:///Users/dhruv/Desktop/hrms/backend/src/routes/user.router.ts). Profile editing and user management.
*   **`/api/sidebar/*`**: Mounted to [`src/routes/sidebar.route.ts`](file:///Users/dhruv/Desktop/hrms/backend/src/routes/sidebar.route.ts). Populates side menus according to role arrays.
*   **`/api/role/*`**: Mounted to [`src/routes/role.route.ts`](file:///Users/dhruv/Desktop/hrms/backend/src/routes/role.route.ts). Manages role definitions.
*   **`/api/permission/*`**: Mounted to [`src/routes/permission.route.ts`](file:///Users/dhruv/Desktop/hrms/backend/src/routes/permission.route.ts). Fetches permissions lists.
*   **`/api/report/*`**: Mounted to [`src/routes/reports.route.ts`](file:///Users/dhruv/Desktop/hrms/backend/src/routes/reports.route.ts). Executes filters, reports, and compiles records.
*   **`/api/master/*`**: Mounted to [`src/routes/master.route.ts`](file:///Users/dhruv/Desktop/hrms/backend/src/routes/master.route.ts). General data-entry records controllers.
*   **`/api/upload/*`**: Mounted to [`src/routes/upload.route.ts`](file:///Users/dhruv/Desktop/hrms/backend/src/routes/upload.route.ts). Encapsulates AWS S3 uploads logic.
*   **`/api/style` (PATCH)**: Updates company styling options.

---

## ⚙️ Development & Server Configuration

Create a `.env` file in the `/backend` folder:

```env
# Frontend communication
FRONTEND_URL="http://localhost:5173"
PRODUCTION_FRONTEND_URL="https://yourdomain.com"

# API Port
PORT=5056

# Auth & Signing (Keys must match frontend config)
JWT_SECRET="your_jwt_signing_secret_here"
REFRESH_TOKEN_SECRET="your_refresh_token_secret_here"
ENCRYPTION_SECRET_KEY="32_character_aes_secret_key_here"

# Email Configuration
FROM_EMAIL="your_system_email@gmail.com"
GMAIL_TRANSPORTER_PASSWORD="your_app_specific_password"

# Database Configuration (PostgreSQL)
DB_USER="your_db_username"
DB_HOST="your_db_host"
DB_NAME="your_db_name"
DB_PASSWORD="your_db_password"
DB_PORT=5432

# AWS S3 Storage
AWS_ACCESS_KEY_ID="your_aws_key_id"
AWS_SECRET_ACCESS_KEY="your_aws_secret_key"
AWS_REGION="eu-north-1"
AWS_BUCKET_NAME="your_s3_bucket"

# Redis cache Configuration
REDIS_HOST="127.0.0.1"
REDIS_PORT="6379"
REDIS_PASSWORD="your_redis_password"

# PWA Web Push (VAPID Keys)
VAPID_PUBLIC_KEY="your_vapid_public_key"
VAPID_PRIVATE_KEY="your_vapid_private_key"
VAPID_SUBJECT="mailto:your_admin_email@domain.com"

# WhatsApp Business API Config
WHATSAPP_API_KEY="your_whatsapp_token"
WHATSAPP_PHONE_NUMBER_ID="your_whatsapp_phone_id"
WHATSAPP_TEMPLATE_NAME="your_template_name"
WHATSAPP_TEMPLATE_LANG="en"
```

### CLI Command List

```bash
# Install package dependencies
npm install

# Start local server under Nodemon watching code changes
npm run dev

# Generate VAPID key pair for PWA notifications
npm run generate-vapid-keys

# Compile TypeScript files into JavaScript (in /dist)
npm run build

# Start the compiled production service
npm run start
```
