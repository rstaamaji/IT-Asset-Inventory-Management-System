import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import app from '../app.js';
import { isValidEmail, isValidDate, parsePagination, ALLOWED_ASSET_STATUSES } from '../middleware/validate.js';
import { handleDatabaseError } from '../utils/dbErrors.js';
import { generateToken } from '../middleware/auth.js';

let server;
let baseUrl;
let adminHeaders;
let staffHeaders;

before(async () => {
  await new Promise((resolve) => {
    server = app.listen(0, () => {
      const port = server.address().port;
      baseUrl = `http://127.0.0.1:${port}`;
      resolve();
    });
  });

  const adminToken = generateToken({
    id: 'test-admin-id',
    name: 'Test Administrator',
    email: 'admin.test@company.com',
    role: 'Admin',
  });

  const staffToken = generateToken({
    id: 'test-staff-id',
    name: 'Test Staff',
    email: 'staff.test@company.com',
    role: 'Staff',
  });

  adminHeaders = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${adminToken}`,
  };

  staffHeaders = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${staffToken}`,
  };
});

after(async () => {
  if (server) {
    await new Promise((resolve) => server.close(resolve));
  }
});

describe('1. API Foundation & Root Endpoints', () => {
  test('GET / returns API service metadata', async () => {
    const res = await fetch(`${baseUrl}/`);
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.service, 'IT Asset & Inventory Management API');
    assert.ok(Array.isArray(body.endpoints));
    assert.ok(body.endpoints.includes('/api/assets'));
    assert.ok(body.endpoints.includes('/api/categories'));
    assert.ok(body.endpoints.includes('/api/employees'));
    assert.ok(body.endpoints.includes('/api/assignments'));
    assert.ok(body.endpoints.includes('/api/dashboard/stats'));
  });

  test('GET /unknown-path returns standard 404 response', async () => {
    const res = await fetch(`${baseUrl}/api/nonexistent-route-xyz`);
    assert.equal(res.status, 404);
    const body = await res.json();
    assert.equal(body.status, 'fail');
    assert.ok(body.message.includes('Resource not found'));
  });
});

describe('2. Validation & Input Normalization Helpers', () => {
  test('parsePagination normalizes limits, pages, and offsets', () => {
    const res1 = parsePagination({});
    assert.deepEqual(res1, { page: 1, limit: 20, offset: 0 });

    const res2 = parsePagination({ page: '3', limit: '10' });
    assert.deepEqual(res2, { page: 3, limit: 10, offset: 20 });

    const capped = parsePagination({ page: '-5', limit: '500' });
    assert.deepEqual(capped, { page: 1, limit: 100, offset: 0 });
  });

  test('isValidEmail detects valid and invalid formats', () => {
    assert.equal(isValidEmail('jane.doe@company.com'), true);
    assert.equal(isValidEmail('invalid-email'), false);
    assert.equal(isValidEmail(''), false);
    assert.equal(isValidEmail(null), false);
  });

  test('isValidDate verifies standard YYYY-MM-DD ISO date format', () => {
    assert.equal(isValidDate('2024-05-15'), true);
    assert.equal(isValidDate('2024-13-45'), false);
    assert.equal(isValidDate('not-a-date'), false);
    assert.equal(isValidDate(null), false);
  });

  test('ALLOWED_ASSET_STATUSES contains required 6 lifecycle states', () => {
    const expected = ['In Stock', 'Assigned', 'In Use', 'In Repair', 'Returned', 'Disposed'];
    for (const st of expected) {
      assert.ok(ALLOWED_ASSET_STATUSES.includes(st), `Missing status: ${st}`);
    }
  });
});

describe('3. Database Error Mapping & HTTP Status Codes', () => {
  test('handleDatabaseError maps 23505 unique constraint violation to 409 Conflict', () => {
    let capturedStatus;
    let capturedPayload;
    const mockRes = {
      status(s) {
        capturedStatus = s;
        return this;
      },
      json(p) {
        capturedPayload = p;
        return this;
      },
    };

    const duplicateErr = new Error('duplicate key value violates unique constraint');
    duplicateErr.code = '23505';
    duplicateErr.constraint = 'assets_asset_code_key';

    handleDatabaseError(duplicateErr, mockRes);
    assert.equal(capturedStatus, 409);
    assert.equal(capturedPayload.status, 'fail');
    assert.ok(capturedPayload.message.includes('asset code already exists'));
  });

  test('handleDatabaseError maps 23503 foreign key conflict to 409 on delete restriction', () => {
    let capturedStatus;
    let capturedPayload;
    const mockRes = {
      status(s) {
        capturedStatus = s;
        return this;
      },
      json(p) {
        capturedPayload = p;
        return this;
      },
    };

    const fkErr = new Error('update or delete on table "categories" violates foreign key constraint');
    fkErr.code = '23503';

    handleDatabaseError(fkErr, mockRes);
    assert.equal(capturedStatus, 409);
    assert.equal(capturedPayload.status, 'fail');
    assert.ok(capturedPayload.message.includes('actively referenced by existing assets'));
  });

  test('handleDatabaseError maps 23514 check constraint violation to 400 Bad Request', () => {
    let capturedStatus;
    let capturedPayload;
    const mockRes = {
      status(s) {
        capturedStatus = s;
        return this;
      },
      json(p) {
        capturedPayload = p;
        return this;
      },
    };

    const checkErr = new Error('check constraint failed');
    checkErr.code = '23514';

    handleDatabaseError(checkErr, mockRes);
    assert.equal(capturedStatus, 400);
    assert.equal(capturedPayload.status, 'fail');
    assert.ok(capturedPayload.message.includes('violates database constraints'));
  });
});

describe('4. Category Endpoint Payload Validation', () => {
  test('POST /api/categories rejects request missing required name field', async () => {
    const res = await fetch(`${baseUrl}/api/categories`, {
      method: 'POST',
      headers: adminHeaders,
      body: JSON.stringify({ description: 'A category without a name' }),
    });

    assert.equal(res.status, 400);
    const body = await res.json();
    assert.equal(body.status, 'fail');
    assert.ok(body.message.includes('Missing or empty required fields: name'));
  });
});

describe('5. Employee Endpoint Payload Validation', () => {
  test('POST /api/employees rejects missing mandatory fields', async () => {
    const res = await fetch(`${baseUrl}/api/employees`, {
      method: 'POST',
      headers: adminHeaders,
      body: JSON.stringify({ name: 'Incomplete Employee' }),
    });

    assert.equal(res.status, 400);
    const body = await res.json();
    assert.equal(body.status, 'fail');
    assert.ok(body.message.includes('Missing required fields'));
  });

  test('POST /api/employees rejects malformed email address', async () => {
    const res = await fetch(`${baseUrl}/api/employees`, {
      method: 'POST',
      headers: adminHeaders,
      body: JSON.stringify({
        employeeCode: 'EMP-999',
        name: 'Jane Tester',
        email: 'invalid-email-address',
        department: 'Engineering',
        position: 'QA Engineer',
        location: 'HQ Floor 2',
      }),
    });

    assert.equal(res.status, 400);
    const body = await res.json();
    assert.equal(body.status, 'fail');
    assert.ok(body.message.includes('Invalid email address format'));
  });

  test('POST /api/employees rejects invalid status value', async () => {
    const res = await fetch(`${baseUrl}/api/employees`, {
      method: 'POST',
      headers: adminHeaders,
      body: JSON.stringify({
        employeeCode: 'EMP-998',
        name: 'Jane Tester',
        email: 'jane@company.com',
        department: 'Engineering',
        position: 'QA Engineer',
        location: 'HQ Floor 2',
        status: 'Suspended',
      }),
    });

    assert.equal(res.status, 400);
    const body = await res.json();
    assert.equal(body.status, 'fail');
    assert.ok(body.message.includes("Invalid status 'Suspended'"));
  });
});

describe('6. Asset Endpoint Payload Validation', () => {
  test('POST /api/assets rejects missing required attributes', async () => {
    const res = await fetch(`${baseUrl}/api/assets`, {
      method: 'POST',
      headers: adminHeaders,
      body: JSON.stringify({
        assetName: 'Incomplete Asset',
      }),
    });

    assert.equal(res.status, 400);
    const body = await res.json();
    assert.equal(body.status, 'fail');
    assert.ok(body.message.includes('Missing required fields'));
  });

  test('POST /api/assets rejects invalid lifecycle status value', async () => {
    const res = await fetch(`${baseUrl}/api/assets`, {
      method: 'POST',
      headers: adminHeaders,
      body: JSON.stringify({
        assetCode: 'AST-999',
        assetName: 'Test Asset',
        brand: 'Dell',
        serialNumber: 'SN-TEST-12345',
        location: 'Storage',
        status: 'UnknownStatus',
      }),
    });

    assert.equal(res.status, 400);
    const body = await res.json();
    assert.equal(body.status, 'fail');
    assert.ok(body.message.includes("Invalid status 'UnknownStatus'"));
  });
});

describe('7. Assignment Endpoint Payload Validation', () => {
  test('POST /api/assignments rejects missing assetId or employeeId', async () => {
    const res = await fetch(`${baseUrl}/api/assignments`, {
      method: 'POST',
      headers: staffHeaders,
      body: JSON.stringify({
        notes: 'Trying to assign without specifying asset or employee',
      }),
    });

    assert.equal(res.status, 400);
    const body = await res.json();
    assert.equal(body.status, 'fail');
    assert.ok(body.message.includes('Both assetId and employeeId are required'));
  });

  test('POST /api/assignments rejects malformed assignedDate format', async () => {
    const res = await fetch(`${baseUrl}/api/assignments`, {
      method: 'POST',
      headers: staffHeaders,
      body: JSON.stringify({
        assetId: 'ast-001',
        employeeId: 'emp-001',
        assignedDate: 'not-a-date',
      }),
    });

    assert.equal(res.status, 400);
    const body = await res.json();
    assert.equal(body.status, 'fail');
    assert.ok(body.message.includes('Invalid assignedDate format'));
  });

  test('POST /api/assignments rejects expectedReturnDate earlier than assignedDate', async () => {
    const res = await fetch(`${baseUrl}/api/assignments`, {
      method: 'POST',
      headers: staffHeaders,
      body: JSON.stringify({
        assetId: 'ast-001',
        employeeId: 'emp-001',
        assignedDate: '2025-06-15',
        expectedReturnDate: '2025-06-01',
      }),
    });

    assert.equal(res.status, 400);
    const body = await res.json();
    assert.equal(body.status, 'fail');
    assert.ok(body.message.includes('Expected return date'));
    assert.ok(body.message.includes('cannot be earlier than assigned date'));
  });

  test('POST /api/assignments/:id/return rejects malformed returnedDate format', async () => {
    const res = await fetch(`${baseUrl}/api/assignments/asg-001/return`, {
      method: 'POST',
      headers: staffHeaders,
      body: JSON.stringify({
        returnedDate: '2024-99-99',
      }),
    });

    assert.equal(res.status, 400);
    const body = await res.json();
    assert.equal(body.status, 'fail');
    assert.ok(body.message.includes('Invalid returnedDate format'));
  });
});

describe('8. Asset Lifecycle Status Endpoint Validation', () => {
  test('PATCH /api/assets/:id/status rejects request with missing status', async () => {
    const res = await fetch(`${baseUrl}/api/assets/ast-001/status`, {
      method: 'PATCH',
      headers: staffHeaders,
      body: JSON.stringify({
        reason: 'Missing status payload',
      }),
    });

    assert.equal(res.status, 400);
    const body = await res.json();
    assert.equal(body.status, 'fail');
    assert.ok(body.message.includes('New status is required'));
  });

  test('PATCH /api/assets/:id/status rejects invalid lifecycle status value', async () => {
    const res = await fetch(`${baseUrl}/api/assets/ast-001/status`, {
      method: 'PATCH',
      headers: staffHeaders,
      body: JSON.stringify({
        status: 'LostForever',
      }),
    });

    assert.equal(res.status, 400);
    const body = await res.json();
    assert.equal(body.status, 'fail');
    assert.ok(body.message.includes("Invalid status 'LostForever'"));
  });
});

describe('9. Database Concurrency & Constraint Error Mappers', () => {
  test('handleDatabaseError maps unique_active_asset_assignment partial index to 409 Conflict', () => {
    let capturedStatus;
    let capturedPayload;
    const mockRes = {
      status(s) {
        capturedStatus = s;
        return this;
      },
      json(p) {
        capturedPayload = p;
        return this;
      },
    };

    const conflictErr = new Error('duplicate key value violates unique constraint');
    conflictErr.code = '23505';
    conflictErr.constraint = 'idx_unique_active_asset_assignment';

    handleDatabaseError(conflictErr, mockRes);
    assert.equal(capturedStatus, 409);
    assert.equal(capturedPayload.status, 'fail');
    assert.ok(capturedPayload.message.includes('already has an active assignment in progress'));
  });
});

describe('10. Authentication, Session Management, and Role-Based Access Control', () => {
  test('POST /api/auth/login validates required email and password fields', async () => {
    const res = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });

    assert.equal(res.status, 400);
    const body = await res.json();
    assert.equal(body.status, 'fail');
    assert.ok(body.message.includes('Email and password are required'));
  });

  test('POST /api/auth/login rejects invalid email formats', async () => {
    const res = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'not-an-email', password: 'secretpassword' }),
    });

    assert.equal(res.status, 400);
    const body = await res.json();
    assert.equal(body.status, 'fail');
    assert.ok(body.message.includes('valid email address is required'));
  });

  test('GET /api/auth/me returns 401 when no session cookie or token is provided', async () => {
    const res = await fetch(`${baseUrl}/api/auth/me`);
    assert.equal(res.status, 401);
    const body = await res.json();
    assert.equal(body.status, 'fail');
    assert.ok(body.message.includes('Authentication required'));
  });

  test('Protected endpoint returns 401 when invalid token is provided', async () => {
    const res = await fetch(`${baseUrl}/api/categories`, {
      headers: {
        Authorization: 'Bearer invalid.token.payload',
      },
    });
    assert.equal(res.status, 401);
    const body = await res.json();
    assert.equal(body.status, 'fail');
    assert.ok(body.message.includes('Invalid authentication token'));
  });

  test('POST /api/auth/logout clears session and returns success', async () => {
    const res = await fetch(`${baseUrl}/api/auth/logout`, {
      method: 'POST',
    });
    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.status, 'success');
    assert.ok(body.message.includes('Logged out successfully'));
  });

  test('Staff token is forbidden (403) from Admin mutating actions (e.g. POST /api/categories)', async () => {
    const res = await fetch(`${baseUrl}/api/categories`, {
      method: 'POST',
      headers: staffHeaders,
      body: JSON.stringify({
        name: 'Forbidden Hardware',
      }),
    });

    assert.equal(res.status, 403);
    const body = await res.json();
    assert.equal(body.status, 'fail');
    assert.ok(body.message.includes('Access denied'));
    assert.ok(body.message.includes('Admin'));
  });

  test('Staff token is forbidden (403) from Admin mutating actions (e.g. POST /api/employees)', async () => {
    const res = await fetch(`${baseUrl}/api/employees`, {
      method: 'POST',
      headers: staffHeaders,
      body: JSON.stringify({
        employeeCode: 'EMP-999',
        name: 'Staff Trying Create',
        email: 'staff.attempt@company.com',
        department: 'Engineering',
        position: 'Developer',
        location: 'HQ Floor 1',
      }),
    });

    assert.equal(res.status, 403);
    const body = await res.json();
    assert.equal(body.status, 'fail');
    assert.ok(body.message.includes('Access denied'));
  });

  test('Staff token is forbidden (403) from Admin asset creation (POST /api/assets)', async () => {
    const res = await fetch(`${baseUrl}/api/assets`, {
      method: 'POST',
      headers: staffHeaders,
      body: JSON.stringify({
        assetCode: 'AST-STAFF-FORBIDDEN',
        assetName: 'Staff Attempt Asset',
        brand: 'Dell',
        serialNumber: 'SN-FORBIDDEN-01',
        location: 'HQ',
        categoryId: 'cat-1',
      }),
    });

    assert.equal(res.status, 403);
    const body = await res.json();
    assert.equal(body.status, 'fail');
    assert.ok(body.message.includes('Access denied'));
  });
});
