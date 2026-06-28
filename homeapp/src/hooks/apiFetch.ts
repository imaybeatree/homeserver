import { getBackendUrl } from './backendUrl';

const backend = getBackendUrl();
const TOKEN_KEY = 'appToken';

export function getToken(): string | null {
  return sessionStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  sessionStorage.setItem(TOKEN_KEY, token);
}

export function clearToken(): void {
  sessionStorage.removeItem(TOKEN_KEY);
}

export function getUserFromToken(): string | null {
  const token = getToken();
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')));
    return typeof payload.user === 'string' ? payload.user : null;
  } catch {
    return null;
  }
}

export async function apiFetch(path: string, options: RequestInit = {}): Promise<Response> {
  const token = getToken();
  const headers = new Headers(options.headers);

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(`${backend}${path}`, { ...options, headers });

  const refreshed = response.headers.get('X-Refresh-Token');
  if (refreshed) {
    setToken(refreshed);
  }

  if (response.status === 401) {
    sessionStorage.clear();
    window.location.href = '/';
  }

  return response;
}
