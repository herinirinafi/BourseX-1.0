import { API_BASE_URL, DEFAULT_HEADERS, REQUEST_TIMEOUT, MAX_RETRIES, ENDPOINTS } from '../config/api';
import { getAuthToken, getRefreshToken, setAuthToken } from './authToken';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

interface RequestOptions {
  method?: HttpMethod;
  headers?: Record<string, string>;
  body?: any;
  timeout?: number;
  retries?: number;
  token?: string | null;
}

const sleep = (ms: number) => new Promise(res => setTimeout(res, ms));

const withTimeout = async (promise: Promise<Response>, ms: number) => {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), ms);
  try {
    // Recreate promise with signal
    const response = await promise;
    clearTimeout(timeout);
    return response;
  } catch (err) {
    clearTimeout(timeout);
    throw err;
  }
};

let currentToken: string | null = null;
export const setApiAuthToken = (token: string | null) => { currentToken = token; };

export class ApiClient {
  baseURL: string;

  constructor(baseURL = API_BASE_URL) {
    this.baseURL = baseURL;
  }

  async request(path: string, options: RequestOptions = {}) {
    const {
      method = 'GET',
      headers = {},
      body,
      timeout = REQUEST_TIMEOUT,
      retries = MAX_RETRIES,
  token = null,
    } = options;

    const mergedHeaders: Record<string, string> = {
      ...DEFAULT_HEADERS,
      ...headers,
    };
    // Avoid sending Content-Type when there is no request body (prevents unnecessary CORS preflight on GET)
    if (body === undefined) {
      delete mergedHeaders['Content-Type'];
    }
  const effectiveToken = token ?? currentToken ?? getAuthToken();
  if (effectiveToken) mergedHeaders['Authorization'] = `Bearer ${effectiveToken}`;

    const url = `${this.baseURL}${path}`;
    const payload: RequestInit = {
      method,
      headers: mergedHeaders,
    };
    if (body !== undefined) {
      payload.body = typeof body === 'string' ? body : JSON.stringify(body);
    }

    let attempt = 0;
    let hasRetriedWithRefresh = false;
    while (true) {
      try {
        const response = await withTimeout(fetch(url, payload), timeout);
        if (!response.ok) {
          const text = await response.text().catch(() => '');
          let message = `HTTP ${response.status}`;
          try {
            const data = text ? JSON.parse(text) : null;
            message = (data?.detail || data?.message || message);
          } catch {}
          // If unauthorized, try refresh token flow once (except on auth endpoints themselves)
          if (response.status === 401 && !hasRetriedWithRefresh && path !== ENDPOINTS.LOGIN && path !== ENDPOINTS.REFRESH_TOKEN) {
            const refresh = getRefreshToken?.() as string | null;
            if (refresh) {
              try {
                // attempt refresh
                const refreshRes = await withTimeout(
                  fetch(`${this.baseURL}${ENDPOINTS.REFRESH_TOKEN}`,
                    {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
                      body: JSON.stringify({ refresh }),
                    }
                  ),
                  timeout
                );
                if (refreshRes.ok) {
                  const refreshJson: any = await refreshRes.json();
                  const newAccess = refreshJson?.access as string | undefined;
                  if (newAccess) {
                    setAuthToken?.(newAccess);
                    setApiAuthToken(newAccess);
                    // retry original request with new token
                    mergedHeaders['Authorization'] = `Bearer ${newAccess}`;
                    payload.headers = mergedHeaders;
                    hasRetriedWithRefresh = true;
                    continue; // loop to retry
                  }
                }
              } catch {
                // fallthrough to throw
              }
            }
          }
          const error = new Error(message) as any;
          (error.status = response.status);
          throw error;
        }
        const contentType = response.headers.get('content-type') || '';
        if (contentType.includes('application/json')) {
          return await response.json();
        }
        return await response.text();
      } catch (err: any) {
        const isAbort = err?.name === 'AbortError';
        const isNetwork = err?.message?.includes('Network request failed');
        if (attempt < retries && (isAbort || isNetwork)) {
          attempt++;
          await sleep(500 * attempt);
          continue;
        }
        throw err;
      }
    }
  }

  get(path: string, options?: RequestOptions) {
    return this.request(path, { ...options, method: 'GET' });
  }
  post(path: string, body?: any, options?: RequestOptions) {
    return this.request(path, { ...options, method: 'POST', body });
  }
  patch(path: string, body?: any, options?: RequestOptions) {
    return this.request(path, { ...options, method: 'PATCH', body });
  }
  delete(path: string, options?: RequestOptions) {
    return this.request(path, { ...options, method: 'DELETE' });
  }
}

export const apiClient = new ApiClient();
