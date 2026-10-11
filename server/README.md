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

---

## 7. REST CRUD API Endpoints & cURL Reference

### 7.1 Categories API (`/api/categories`)

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/categories` | List all categories with dynamic `assetCount` (optional `?q=search`) |
| `GET` | `/api/categories/:id` | Get single category by ID with dynamic `assetCount` |
| `POST` | `/api/categories` | Create new category (enforces unique name) |
| `PUT` | `/api/categories/:id` | Update category name and/or description |
| `DELETE` | `/api/categories/:id` | Delete category (blocked with `409 Conflict` if assets belong to it) |

#### Examples:

**List Categories:**
```bash
curl -X GET "http://localhost:5000/api/categories"
```

**Create Category:**
```bash
curl -X POST "http://localhost:5000/api/categories" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Tablet",
    "description": "Portable touchscreen computers and drawing pads"
  }'
```

**Update Category:**
```bash
curl -X PUT "http://localhost:5000/api/categories/cat-001" \
  -H "Content-Type: application/json" \
  -d '{
    "description": "Enterprise ultraportable and creator laptops"
  }'
```

**Delete Category (Safe Deletion Protection):**
```bash
curl -X DELETE "http://localhost:5000/api/categories/cat-001"
# Returns 409 Conflict if assets are associated with this category:
# {"status":"fail","message":"Cannot delete category \"Laptop\" because it is currently assigned to 4 asset(s)..."}
```

---

### 7.2 Employees API (`/api/employees`)

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/employees` | Paginated employee list (`?page=1&limit=20&q=&department=&status=`) |
| `GET` | `/api/employees/:id` | Get employee by ID with `assignedAssetCount` and active equipment list |
| `POST` | `/api/employees` | Register new employee (unique `employeeCode` & `email`) |
| `PUT` | `/api/employees/:id` | Update employee information |
| `DELETE` | `/api/employees/:id` | Delete employee (blocked with `409 Conflict` if active/historical assignments exist) |

#### Examples:

**List Employees (with filters & pagination):**
```bash
curl -X GET "http://localhost:5000/api/employees?page=1&limit=10&department=Engineering&status=Active"
```

**Create Employee:**
```bash
curl -X POST "http://localhost:5000/api/employees" \
  -H "Content-Type: application/json" \
  -d '{
    "employeeCode": "EMP-020",
    "name": "Jordan Lee",
    "email": "jordan.lee@company.com",
    "department": "Engineering",
    "position": "Site Reliability Engineer",
    "location": "Jakarta HQ - Floor 4",
    "phone": "+62 812-9988-7766",
    "status": "Active"
  }'
```

**Get Employee Details (includes assigned equipment):**
```bash
curl -X GET "http://localhost:5000/api/employees/emp-001"
```

**Delete Employee (Safe Audit Trail Protection):**
```bash
curl -X DELETE "http://localhost:5000/api/employees/emp-001"
# Returns 409 Conflict if active or historical assignment records exist to maintain compliance.
```

---

### 7.3 Assets API (`/api/assets`)

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/assets` | Paginated asset list (`?page=1&limit=20&q=&status=&category=&department=`) |
| `GET` | `/api/assets/:id` | Get asset by ID with category, assigned employee, active assignment, and lifecycle history |
| `POST` | `/api/assets` | Register new asset (automatically logs initial status history) |
| `PUT` | `/api/assets/:id` | Update asset attributes & status (records transitions into `asset_status_history`) |
| `DELETE` | `/api/assets/:id` | Delete unassigned asset (blocked with `409 Conflict` if assignment history exists) |

#### Examples:

**List Assets (filtered by status and category):**
```bash
curl -X GET "http://localhost:5000/api/assets?status=In%20Stock&category=cat-001"
```

**Register Asset:**
```bash
curl -X POST "http://localhost:5000/api/assets" \
  -H "Content-Type: application/json" \
  -d '{
    "assetCode": "AST-100",
    "assetName": "ThinkPad P16 Gen 2",
    "categoryId": "cat-001",
    "brand": "Lenovo",
    "model": "Intel Core i9-13980HX 64GB",
    "serialNumber": "PF-998877",
    "purchaseDate": "2024-06-01",
    "purchasePrice": 2899.00,
    "warrantyEnd": "2027-06-01",
    "location": "Jakarta HQ - Floor 3",
    "status": "In Stock"
  }'
```

**Update Asset / Change Lifecycle Status:**
```bash
curl -X PUT "http://localhost:5000/api/assets/ast-001" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "In Repair",
    "reason": "Display backlight flickering issue reported",
    "actor": "Hardware Tech Team"
  }'
```

**Delete Asset (Historical Integrity Protection):**
```bash
curl -X DELETE "http://localhost:5000/api/assets/ast-001"
# If the asset has any assignment history, returns 409 Conflict:
# {"status":"fail","message":"Cannot delete asset ... because it has historical assignment records..."}
```

---

## 8. Automated API Test Suite

Run the automated backend test suite:

```bash
npm run test:api
```

The test runner tests:
- Service discovery and root informational endpoint (`GET /`)
- Custom 404 handler for unmatched paths
- Pagination parser bounds, offset calculations, and sanitization
- Email and date format validators
- Lifecycle status enum validation (`In Stock`, `Assigned`, `In Use`, `In Repair`, `Returned`, `Disposed`)
- PostgreSQL constraint error mappers (`23505` duplicate key, `23503` foreign key, `23514` check constraints)
- Endpoint payload validations for Categories, Employees, and Assets

