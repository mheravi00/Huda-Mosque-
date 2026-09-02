import { supabase } from '../supabase';

export class ApiError extends Error {
  constructor(status, code, message, details) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.details = details;
  }
}

export function queryString(params = {}) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') query.set(key, String(value));
  });
  const value = query.toString();
  return value ? `?${value}` : '';
}

export async function apiRequest(path, options = {}) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.access_token) {
    window.dispatchEvent(new Event('huda:unauthorized'));
    throw new ApiError(401, 'UNAUTHORIZED', 'Your session has expired. Please sign in again.');
  }
  const headers = new Headers(options.headers);
  headers.set('Authorization', `Bearer ${session.access_token}`);
  if (options.body && !(options.body instanceof FormData)) headers.set('Content-Type', 'application/json');
  const response = await fetch(path, { ...options, headers, body: options.body instanceof FormData ? options.body : options.body === undefined ? undefined : JSON.stringify(options.body) });
  if (response.status === 204) return { data: null, meta: null };
  let payload;
  try { payload = await response.json(); } catch { payload = null; }
  if (!response.ok) {
    const error = payload?.error;
    if (response.status === 401) window.dispatchEvent(new Event('huda:unauthorized'));
    throw new ApiError(response.status, error?.code || 'REQUEST_FAILED', error?.message || 'The request could not be completed.', error?.details);
  }
  return payload || { data: null };
}

export const api = {
  get: (path, params) => apiRequest(`${path}${queryString(params)}`),
  post: (path, body) => apiRequest(path, { method: 'POST', body }),
  patch: (path, body) => apiRequest(path, { method: 'PATCH', body }),
  delete: path => apiRequest(path, { method: 'DELETE' }),
  upload: (path, body) => apiRequest(path, { method: 'POST', body }),
};
