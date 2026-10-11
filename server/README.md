# Backend Foundation & PostgreSQL Database Architecture

IT Asset & Inventory Management System backend architecture built with **Node.js**, **Express**, and **PostgreSQL** (`pg` connection pool).

---

## 1. Directory Structure

```
server/
├── config/
│   └── db.js                       # PostgreSQL connection pool with error handling
├── db/
│   ├── migrations/
│   │   └── 001_initial_schema.sql  # Version-controlled idempotent schema migration
│   ├── schema.sql                  # Canonical full schema reference
│   ├── migrate.js                  # Automated migration runner script
│   └── seed.js                     # Mock dataset seeder script
├── middleware/
│   └── errorHandler.js             # 404 handler & centralized structured error handling
├── routes/
│   └── health.js                   # Public health probe endpoint (GET /api/health)
├── app.js                          # Express app configuration & middleware mounts
├── index.js                        # Server entry point & graceful shutdown listener
└── README.md                       # Complete backend and database documentation
```

---

## 2. Environment Configuration

Copy `.env.example` in the project root to `.env`:

```bash
cp .env.example .env
```

Edit `.env` with your PostgreSQL database credentials:

```ini
PORT=5000
NODE_ENV=development

# PostgreSQL Connection Settings
PGHOST=localhost
PGPORT=5432
PGDATABASE=it_asset_management
PGUSER=postgres
PGPASSWORD=your_actual_password

# Or connection string (optional):
# DATABASE_URL=postgresql://postgres:your_actual_password@localhost:5432/it_asset_management

# Pool Settings
PGMAX_CLIENTS=10
PGIDLE_TIMEOUT_MS=30000
PGCONN_TIMEOUT_MS=5000
PGSSL=false
```

> [!CAUTION]
> Never commit real database passwords or `.env` files to Git. The `.gitignore` file is configured to exclude all `.env*` files automatically.

---

## 3. Database Setup & Migration

### Step 1: Create PostgreSQL Database

Using `psql` (PostgreSQL CLI):

```sql
CREATE DATABASE it_asset_management;
```

Or via terminal:

```bash
createdb -U postgres it_asset_management
```

### Step 2: Apply Schema Migrations

Run the automated migration script:

```bash
npm run db:migrate
```

This applies `server/db/migrations/001_initial_schema.sql`, creating:
1. `categories` table
2. `employees` table
3. `assets` table (with category and employee foreign keys)
4. `assignments` table (with partial unique index preventing multiple active assignments)
5. `asset_status_history` table (preserving complete lifecycle audit logs)
6. Automated `updated_at` trigger functions on all mutable tables

### Step 3 (Optional): Seed Initial Data

To populate the database with the enterprise catalog from the mock dataset:

```bash
npm run db:seed
```

---

## 4. Starting the Server

### Development Mode (with native file watcher):
```bash
npm run server:dev
```

### Production Mode:
```bash
npm run server
```

The server will listen at `http://localhost:5000`.

---

## 5. Health Probe Endpoint

### `GET /api/health`

Reports application status, uptime, and database connectivity without exposing connection secrets.

#### Example Response (Database Connected - HTTP 200):
```json
{
  "status": "healthy",
  "service": "it-asset-management-api",
  "uptimeSeconds": 42,
  "timestamp": "2026-10-11T09:35:00.000Z",
  "environment": "development",
  "database": {
    "status": "connected",
    "latencyMs": 4,
    "serverVersion": "PostgreSQL 16.2",
    "dbTimestamp": "2026-10-11T09:35:00.123Z"
  }
}
```

#### Example Response (Database Offline - HTTP 503):
```json
{
  "status": "degraded",
  "service": "it-asset-management-api",
  "uptimeSeconds": 15,
  "timestamp": "2026-10-11T09:35:00.000Z",
  "environment": "development",
  "database": {
    "status": "disconnected",
    "message": "Database connection failed. Verify PostgreSQL service and credentials.",
    "error": "connect ECONNREFUSED 127.0.0.1:5432"
  }
}
```

---

## 6. Relational Table Schema & Constraints

```
+------------------+         +----------------------------+
|    categories    |         |         employees          |
+------------------+         +----------------------------+
| id (PK)          |         | id (PK)                    |
| name (UNIQUE)    |         | employee_code (UNIQUE)     |
| description      |         | name                       |
| created_at       |         | email (UNIQUE)             |
| updated_at       |         | department                 |
+--------+---------+         | position                   |
         |                   | location                   |
         | 1:N               | phone                      |
         v                   | status ('Active'/'Inactive)|
+--------------------------+ | joined_date                |
|          assets          | | created_at                 |
+--------------------------+ | updated_at                 |
| id (PK)                  | +-------------+--------------+
| asset_code (UNIQUE)      |               |
| asset_name               |               |
| category_id (FK->categ.) |               | 1:N
| brand                    |               | (custodian)
| model                    |               |
| serial_number (UNIQUE)   | <-------------+
| purchase_date            |
| purchase_price           |
| warranty_end             |
| location                 |
| status (6 stages)        |
| assigned_to_employee_id  |
| created_at               |
| updated_at               |
+------------+-------------+
             |
             +-----------------------+
             | 1:N                   | 1:N
             v                       v
+--------------------------+   +------------------------------+
|       assignments        |   |     asset_status_history     |
+--------------------------+   +------------------------------+
| id (PK)                  |   | id (PK)                      |
| asset_id (FK -> assets)  |   | asset_id (FK -> assets)      |
| employee_id (FK -> empl) |   | previous_status              |
| assigned_date            |   | new_status                   |
| expected_return_date     |   | reason                       |
| returned_date            |   | actor                        |
| notes                    |   | timestamp                    |
| status ('Active'/'Ret.') |   +------------------------------+
| created_at               |
| updated_at               |
+--------------------------+
* UNIQUE INDEX (asset_id) WHERE status = 'Active'
```

### Constraint Guarantees:
1. **Single Active Assignment Constraint**:
   ```sql
   CREATE UNIQUE INDEX idx_unique_active_asset_assignment 
   ON assignments (asset_id) 
   WHERE status = 'Active';
   ```
   Enforces at the database engine level that no asset can have two active assignments concurrently.
2. **Safe Deletion Policies**:
   - `assignments.asset_id` and `assignments.employee_id` use `ON DELETE RESTRICT` to ensure assignment transaction history can never be silently destroyed.
   - `asset_status_history.asset_id` uses `ON DELETE RESTRICT` to preserve compliance audit logs.
   - `assets.category_id` uses `ON DELETE RESTRICT` so categories cannot be dropped if assets are cataloged under them.
3. **No Redundant Counts**:
   Category asset counts and employee assigned equipment counts are computed dynamically via SQL queries rather than stored denormalized.
