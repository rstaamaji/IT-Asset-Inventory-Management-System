/**
 * Centralized API Client
 * Configurable via VITE_API_BASE_URL environment variable.
 * Seamlessly routes via Vite dev proxy when VITE_API_BASE_URL is not set.
 */

const RAW_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';
export const API_BASE_URL = RAW_BASE_URL.replace(/\/+$/, '');

export class ApiError extends Error {
  constructor(message, status = 500, errors = null, raw = null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.errors = errors;
    this.raw = raw;
  }
}

/**
 * Normalizes query parameter object into a URL search query string
 */
function buildQueryString(params = {}) {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== '' && value !== 'ALL') {
      query.append(key, String(value));
    }
  }
  const str = query.toString();
  return str ? `?${str}` : '';
}

/**
 * Core HTTP fetch wrapper
 */
async function request(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const config = {
    ...options,
    credentials: options.credentials || 'include',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...options.headers,
    },
  };

  try {
    const res = await fetch(url, config);
    let payload;

    const contentType = res.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      payload = await res.json();
    } else {
      payload = await res.text();
    }

    if (!res.ok) {
      const message =
        (typeof payload === 'object' && payload?.message) ||
        (typeof payload === 'string' && payload) ||
        `HTTP Request failed with status ${res.status}`;

      const errors = typeof payload === 'object' ? payload?.errors : null;
      throw new ApiError(message, res.status, errors, payload);
    }

    return payload?.data !== undefined ? payload.data : payload;
  } catch (err) {
    if (err instanceof ApiError) {
      throw err;
    }
    // Network / offline connection failure
    throw new ApiError(
      `Network connection failed. Unable to communicate with backend server at ${url}.`,
      0,
      null,
      err
    );
  }
}

export const apiClient = {
  get(endpoint, params = {}) {
    const qs = buildQueryString(params);
    return request(`${endpoint}${qs}`, { method: 'GET' });
  },

  post(endpoint, body = {}) {
    return request(endpoint, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  },

  put(endpoint, body = {}) {
    return request(endpoint, {
      method: 'PUT',
      body: JSON.stringify(body),
    });
  },

  patch(endpoint, body = {}) {
    return request(endpoint, {
      method: 'PATCH',
      body: JSON.stringify(body),
    });
  },

  delete(endpoint) {
    return request(endpoint, { method: 'DELETE' });
  },
};

export default apiClient;
