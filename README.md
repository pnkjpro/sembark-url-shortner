# Sembark URL Shortener

A Laravel-based URL shortener with role-based access control (RBAC), a company-scoped invitation system, and a dashboard for managing short URLs.

> **Author's Note:** Every service, endpoint, and architectural decision in this project was fully conceptualized and implemented by me. The only exceptions are minimal debugging support and the dashboard UI, where I used AI assistance, as the dashboard UI was not part of the core evaluation criteria for this assignment.

---

## Features

### Authentication & Authorization
- Three user roles: **SuperAdmin**, **Admin**, and **Member**.
- SuperAdmin account is created via a Database Seeder.
- Token-based authentication using **Laravel Sanctum** (login / logout).

### Invitation System
- **SuperAdmin** can invite an Admin into a new company (a new company is created automatically alongside the invitation).
- **Admin** can invite another Admin or a Member within their own company.
- A public invitation acceptance endpoint allows invited users to register by providing their token, name, and password.

### URL Shortener
- **Admin** and **Member** can create short URLs.
- **SuperAdmin** cannot create short URLs.
- **SuperAdmin** can see the list of all short URLs across every company.
- **Admin** can only see short URLs created within their own company.
- **Member** can only see the short URLs they created themselves.
- All short URLs are publicly resolvable and redirect to the original URL (no authentication required).

### Dashboard (AI-Assisted UI)
- Role-scoped statistics (total URLs, companies, users, pending invitations — scoped per role).
- Role-scoped user listing for SuperAdmin and Admin.

---

## Tech Stack

- **Framework:** Laravel 12
- **Authentication:** Laravel Sanctum (API token-based)
- **Database:** SQLite (default) — configurable to MySQL/PostgreSQL
- **Frontend Build:** Vite
- **PHP:** >= 8.2

---

## Project Structure

```
app/
├── Controllers/
│   ├── AuthController.php          # Login, logout, current user
│   ├── DashboardController.php     # Dashboard stats & user listing
│   ├── InvitationController.php    # Create, list & accept invitations
│   ├── RedirectController.php      # Public short URL redirect
│   └── ShortUrlController.php      # Create & list short URLs
├── Enums/
│   └── UserRole.php                # SuperAdmin, Admin, Member
├── Models/
│   ├── Company.php
│   ├── Invitation.php
│   ├── ShortUrl.php
│   └── User.php
├── Policies/
│   ├── InvitationPolicy.php        # Authorization for invitation actions
│   └── ShortUrlPolicy.php          # Authorization for short URL actions
└── Traits/
    └── JsonResponseTrait.php       # Consistent JSON API response format
```

---

## Setup and Installation

### Prerequisites

- PHP >= 8.2
- Composer
- Node.js & npm

### Steps

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd sembark-url-shortner
   ```

2. **Install PHP dependencies:**
   ```bash
   composer install
   ```

3. **Install Node.js dependencies:**
   ```bash
   npm install
   ```

4. **Environment setup:**
   ```bash
   cp .env.example .env
   ```

5. **Generate application key:**
   ```bash
   php artisan key:generate
   ```

6. **Database setup:**
   The project uses SQLite by default. Create the database file:
   ```bash
   # Linux / macOS
   touch database/database.sqlite

   # Windows (PowerShell)
   New-Item database/database.sqlite
   ```

7. **Run migrations and seed the SuperAdmin account:**
   ```bash
   php artisan migrate --seed
   ```
   This creates all the required tables and seeds the SuperAdmin user:
   - **Email:** `superadmin@sembark.com`
   - **Password:** `password`

8. **Build frontend assets:**
   ```bash
   npm run build
   ```

---

## Running the Project

**Start the development server:**
```bash
php artisan serve
```

The application will be accessible at **http://localhost:8000**.

**For full development mode** (server + queue + logs + Vite hot-reload):
```bash
composer dev
```

---

## API Endpoints

### Public (No Authentication)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/login` | Login and receive an API token |
| `POST` | `/api/invitations/accept` | Accept an invitation and register |
| `GET` | `/{shortCode}` | Resolve a short URL and redirect |

### Authenticated (Bearer Token via Sanctum)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/logout` | Logout (revoke current token) |
| `GET` | `/api/user` | Get current authenticated user |
| `GET` | `/api/dashboard/stats` | Get role-scoped dashboard statistics |
| `GET` | `/api/users` | List users (SuperAdmin / Admin only) |
| `GET` | `/api/invitations` | List invitations (SuperAdmin / Admin only) |
| `POST` | `/api/invitations` | Create an invitation (SuperAdmin / Admin only) |
| `GET` | `/api/short-urls` | List short URLs (role-scoped) |
| `POST` | `/api/short-urls` | Create a short URL (Admin / Member only) |

---

## Architectural Highlights

- **Laravel Policies** for clean, centralized authorization logic.
- **PHP Enums** (`UserRole`) for type-safe role definitions.
- **`JsonResponseTrait`** for a consistent API response structure across all controllers.
- **Role-scoped data isolation** using `match` expressions in controllers, ensuring each role only sees data they are permitted to access.
- **Database transactions** for multi-step operations like invitation creation (SuperAdmin flow) and invitation acceptance.
