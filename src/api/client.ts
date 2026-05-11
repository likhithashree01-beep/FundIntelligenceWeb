import { tokenStorage } from '../auth/tokenStorage';
import type { AuthTokens } from './types';

// Empty string → relative URLs in dev (vite proxy handles routing).
// Set VITE_API_BASE_URL to an absolute URL in production builds.
const BASE_URL = (import.meta.env.VITE_API_BASE_URL ?? '').replace(/\/$/, '');

// Subscribers are notified when the refresh attempt itself fails — that means
// the user is no longer authenticated and the React layer should redirect to
// /login. Using an event pattern keeps the API client free of React imports.
type AuthExpiredListener = () => void;
const authExpiredListeners = new Set<AuthExpiredListener>();
export const onAuthExpired = (listener: AuthExpiredListener) => {
  authExpiredListeners.add(listener);
  return () => authExpiredListeners.delete(listener);
};
const emitAuthExpired = () => {
  authExpiredListeners.forEach((fn) => fn());
};

// Deduplicate concurrent refresh attempts: if N requests fire at once and all
// receive 401, only the first kicks off /api/auth/refresh; the rest await it.
let refreshInFlight: Promise<AuthTokens | null> | null = null;

const performRefresh = async (refreshToken: string): Promise<AuthTokens | null> => {
  try {
    const res = await fetch(`${BASE_URL}/api/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });
    if (!res.ok) return null;
    return (await res.json()) as AuthTokens;
  } catch {
    return null;
  }
};

const refreshTokens = (): Promise<AuthTokens | null> => {
  if (refreshInFlight) return refreshInFlight;
  const stored = tokenStorage.read();
  if (!stored) return Promise.resolve(null);

  refreshInFlight = performRefresh(stored.refreshToken).then((tokens) => {
    refreshInFlight = null;
    if (tokens) {
      tokenStorage.write({
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      });
    }
    return tokens;
  });
  return refreshInFlight;
};

export class ApiError extends Error {
  status: number;
  body?: unknown;

  constructor(status: number, message: string, body?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.body = body;
  }
}

interface RequestOptions extends Omit<RequestInit, 'body'> {
  body?: unknown;
  // Skip the Authorization header entirely — used by login/refresh themselves.
  skipAuth?: boolean;
}

const buildHeaders = (options: RequestOptions, accessToken: string | null): HeadersInit => {
  const headers = new Headers(options.headers);
  if (!headers.has('Content-Type') && options.body !== undefined) {
    headers.set('Content-Type', 'application/json');
  }
  if (!options.skipAuth && accessToken) {
    headers.set('Authorization', `Bearer ${accessToken}`);
  }
  return headers;
};

const parseBody = async (res: Response): Promise<unknown> => {
  const text = await res.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
};

const doFetch = async (path: string, options: RequestOptions): Promise<Response> => {
  const stored = tokenStorage.read();
  const headers = buildHeaders(options, stored?.accessToken ?? null);
  return fetch(`${BASE_URL}${path}`, {
    ...options,
    headers,
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
  });
};

export const apiRequest = async <T>(path: string, options: RequestOptions = {}): Promise<T> => {
  let res = await doFetch(path, options);

  // Transparent refresh-and-retry on 401, but only for authed routes — login
  // itself can return 401 for bad credentials and we want that to bubble up.
  if (res.status === 401 && !options.skipAuth) {
    const tokens = await refreshTokens();
    if (tokens) {
      res = await doFetch(path, options);
    } else {
      tokenStorage.clear();
      emitAuthExpired();
    }
  }

  const body = await parseBody(res);
  if (!res.ok) {
    const message =
      body && typeof body === 'object' && 'error' in body
        ? String((body as { error: unknown }).error)
        : `Request failed with status ${res.status}`;
    throw new ApiError(res.status, message, body);
  }
  return body as T;
};
