-- ==============================================================================
-- IT Asset & Inventory Management System - Complete PostgreSQL Schema Reference
-- ==============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Automated updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 1. Categories Table
CREATE TABLE IF NOT EXISTS categories (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_categories_name ON categories (name);

DROP TRIGGER IF EXISTS trg_categories_updated_at ON categories;
CREATE TRIGGER trg_categories_updated_at
  BEFORE UPDATE ON categories
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 2. Employees Table
CREATE TABLE IF NOT EXISTS employees (
  id VARCHAR(50) PRIMARY KEY,
  employee_code VARCHAR(50) NOT NULL UNIQUE,
  name VARCHAR(150) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  department VARCHAR(100) NOT NULL,
  position VARCHAR(100) NOT NULL,
  location VARCHAR(150) NOT NULL,
  phone VARCHAR(50),
  status VARCHAR(20) NOT NULL DEFAULT 'Active' CHECK (status IN ('Active', 'Inactive')),
  joined_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_employees_code ON employees (employee_code);
CREATE INDEX IF NOT EXISTS idx_employees_email ON employees (email);
CREATE INDEX IF NOT EXISTS idx_employees_dept ON employees (department);
CREATE INDEX IF NOT EXISTS idx_employees_status ON employees (status);

DROP TRIGGER IF EXISTS trg_employees_updated_at ON employees;
CREATE TRIGGER trg_employees_updated_at
  BEFORE UPDATE ON employees
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 3. Assets Table
CREATE TABLE IF NOT EXISTS assets (
  id VARCHAR(50) PRIMARY KEY,
  asset_code VARCHAR(50) NOT NULL UNIQUE,
  asset_name VARCHAR(200) NOT NULL,
  category_id VARCHAR(50) NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
  brand VARCHAR(100) NOT NULL,
  model VARCHAR(150) NOT NULL DEFAULT '—',
  serial_number VARCHAR(100) NOT NULL UNIQUE,
  purchase_date DATE NOT NULL DEFAULT CURRENT_DATE,
  purchase_price NUMERIC(12, 2) NOT NULL DEFAULT 0.00 CHECK (purchase_price >= 0),
  warranty_end DATE,
  location VARCHAR(150) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'In Stock'
    CHECK (status IN ('In Stock', 'Assigned', 'In Use', 'In Repair', 'Returned', 'Disposed')),
  assigned_to_employee_id VARCHAR(50) REFERENCES employees(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_assets_code ON assets (asset_code);
CREATE INDEX IF NOT EXISTS idx_assets_serial ON assets (serial_number);
CREATE INDEX IF NOT EXISTS idx_assets_category_id ON assets (category_id);
CREATE INDEX IF NOT EXISTS idx_assets_status ON assets (status);
CREATE INDEX IF NOT EXISTS idx_assets_assigned_emp ON assets (assigned_to_employee_id);

DROP TRIGGER IF EXISTS trg_assets_updated_at ON assets;
CREATE TRIGGER trg_assets_updated_at
  BEFORE UPDATE ON assets
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 4. Assignments Table
CREATE TABLE IF NOT EXISTS assignments (
  id VARCHAR(50) PRIMARY KEY,
  asset_id VARCHAR(50) NOT NULL REFERENCES assets(id) ON DELETE RESTRICT,
  employee_id VARCHAR(50) NOT NULL REFERENCES employees(id) ON DELETE RESTRICT,
  assigned_date DATE NOT NULL DEFAULT CURRENT_DATE,
  expected_return_date DATE,
  returned_date DATE,
  notes TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'Active' CHECK (status IN ('Active', 'Returned')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT chk_assignments_expected_date CHECK (expected_return_date IS NULL OR expected_return_date >= assigned_date),
  CONSTRAINT chk_assignments_return_date CHECK (returned_date IS NULL OR returned_date >= assigned_date)
);

CREATE INDEX IF NOT EXISTS idx_assignments_asset_id ON assignments (asset_id);
CREATE INDEX IF NOT EXISTS idx_assignments_employee_id ON assignments (employee_id);
CREATE INDEX IF NOT EXISTS idx_assignments_status ON assignments (status);
CREATE INDEX IF NOT EXISTS idx_assignments_assigned_date ON assignments (assigned_date);

-- Partial Unique Index: Only one 'Active' assignment per asset
CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_active_asset_assignment
  ON assignments (asset_id)
  WHERE status = 'Active';

DROP TRIGGER IF EXISTS trg_assignments_updated_at ON assignments;
CREATE TRIGGER trg_assignments_updated_at
  BEFORE UPDATE ON assignments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 5. Asset Status History Table
CREATE TABLE IF NOT EXISTS asset_status_history (
  id VARCHAR(50) PRIMARY KEY,
  asset_id VARCHAR(50) NOT NULL REFERENCES assets(id) ON DELETE RESTRICT,
  previous_status VARCHAR(20) CHECK (
    previous_status IS NULL OR
    previous_status IN ('In Stock', 'Assigned', 'In Use', 'In Repair', 'Returned', 'Disposed')
  ),
  new_status VARCHAR(20) NOT NULL CHECK (
    new_status IN ('In Stock', 'Assigned', 'In Use', 'In Repair', 'Returned', 'Disposed')
  ),
  reason TEXT,
  actor VARCHAR(150),
  timestamp TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_status_history_asset_id ON asset_status_history (asset_id);
CREATE INDEX IF NOT EXISTS idx_status_history_timestamp ON asset_status_history (timestamp DESC);
