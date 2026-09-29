# Pragya AI - Backend Service & MySQL Database

This backend service provides enterprise-grade, air-gapped authentication and API management for Pragya AI.

---

## 1. Database Architecture (MySQL)

- **Database Name**: `pragya_ai`
- **Schema File**: [`schema.sql`](file:///c:/Users/chinm/Documents/117/backend/schema.sql)

### Tables

1. **`users`** (Primary Authentication Table)
   - `id`: INT (Primary Key, Auto-increment)
   - `username`: VARCHAR(100) UNIQUE (Login identifier)
   - `email`: VARCHAR(255) UNIQUE (User email)
   - `password_hash`: VARCHAR(255) (Bcrypt salted hash)
   - `full_name`: VARCHAR(150) (Display name)
   - `role`: ENUM ('admin', 'engineer', 'auditor', 'analyst')
   - `auth_provider`: ENUM ('local', 'ldap', 'sso', 'airgap_token')
   - `is_active`: TINYINT(1)
   - `last_login_at`: TIMESTAMP
   - `created_at` / `updated_at`: TIMESTAMP

2. **`auth_sessions`** (Session & JWT Token Management)
   - `id`: VARCHAR(64) PRIMARY KEY
   - `user_id`: INT (Foreign Key -> `users.id`)
   - `token_hash`: VARCHAR(255)
   - `ip_address`: VARCHAR(45)
   - `user_agent`: VARCHAR(500)
   - `is_revoked`: TINYINT(1)
   - `expires_at`: TIMESTAMP
   - `created_at`: TIMESTAMP

3. **`airgap_api_keys`** (Air-Gapped Master Keys & Scopes)
   - `id`: INT (Primary Key)
   - `user_id`: INT (Foreign Key -> `users.id`)
   - `key_name`: VARCHAR(100)
   - `key_prefix`: VARCHAR(16)
   - `key_hash`: VARCHAR(255)
   - `permissions`: JSON
   - `is_active`: TINYINT(1)

4. **`audit_logs`** (SOC2 / ISO-27001 On-Premises Audit Trail)
   - `id`: BIGINT PRIMARY KEY
   - `user_id`: INT (Foreign Key -> `users.id`)
   - `action`: VARCHAR(100)
   - `resource`: VARCHAR(150)
   - `ip_address`: VARCHAR(45)
   - `details`: JSON
   - `created_at`: TIMESTAMP

---

## 2. Setup & Initialization

### Prerequisites
- MySQL 8.0+ running on `localhost:3306`

### Configure Environment
Create or edit `.env` in the `backend/` directory:
```env
PORT=5000
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=pragya_ai
JWT_SECRET=pragya_super_secret_jwt_key_2026_airgapped
```

### Initialize Database & Create Tables
Run the migration script:
```bash
npm run init-db
```
Or import `schema.sql` directly into MySQL:
```bash
mysql -u root -p < schema.sql
```

### Start the Backend Server
```bash
npm run dev
```
The server will start on `http://localhost:5000`.

---

## 3. Auth API Endpoints

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/api/auth/register` | Register new enterprise user | No |
| `POST` | `/api/auth/login` | Authenticate user & get JWT token | No |
| `GET` | `/api/auth/me` | Fetch authenticated user profile | Yes (Bearer Token) |
| `GET` | `/api/auth/users` | List all registered users | Yes (Bearer Token) |
| `GET` | `/health` | Service health & MySQL status | No |
