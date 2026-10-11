import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import app from '../app.js';
import { isValidEmail, isValidDate, parsePagination, ALLOWED_ASSET_STATUSES } from '../middleware/validate.js';
import { handleDatabaseError } from '../utils/dbErrors.js';

let server;
let baseUrl;

before(async () => {
  await new Promise((resolve) => {
    server = app.listen(0, () => {
      const port = server.address().port;
      baseUrl = `http://127.0.0.1:${port}`;
      resolve();
    });
  });
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
      headers: { 'Content-Type': 'application/json' },
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
      headers: { 'Content-Type': 'application/json' },
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
      headers: { 'Content-Type': 'application/json' },
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
      headers: { 'Content-Type': 'application/json' },
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
      headers: { 'Content-Type': 'application/json' },
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
      headers: { 'Content-Type': 'application/json' },
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
