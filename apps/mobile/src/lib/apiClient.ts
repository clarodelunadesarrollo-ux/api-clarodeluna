import type { AuthTokens } from '@claro-de-luna/shared';
import { useAuthStore } from '../features/auth/authStore';
import { API_URL } from './config';

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function parse<T>(response: Response): Promise<T> {
  const text = await response.text();
  const body = text ? (JSON.parse(text) as unknown) : null;

  if (!response.ok) {
    const message =
      (body as { message?: string } | null)?.message ?? 'Ocurrió un error inesperado';
    throw new ApiError(response.status, message);
  }

  return body as T;
}

/** For unauthenticated endpoints (OTP, refresh). */
export async function publicFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...init?.headers },
  });
  return parse<T>(response);
}

let refreshPromise: Promise<boolean> | null = null;

async function refreshTokens(): Promise<boolean> {
  const { refreshToken, updateTokens, clearSession } = useAuthStore.getState();
  if (!refreshToken) {
    return false;
  }

  try {
    const tokens = await publicFetch<AuthTokens>('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    });
    await updateTokens(tokens.accessToken, tokens.refreshToken);
    return true;
  } catch {
    await clearSession();
    return false;
  }
}

/** For authenticated endpoints: injects the access token and retries once after a refresh. */
export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const doRequest = () => {
    const { accessToken } = useAuthStore.getState();
    return fetch(`${API_URL}${path}`, {
      ...init,
      headers: {
        'Content-Type': 'application/json',
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        ...init?.headers,
      },
    });
  };

  let response = await doRequest();

  if (response.status === 401) {
    refreshPromise ??= refreshTokens();
    const refreshed = await refreshPromise;
    refreshPromise = null;
    if (refreshed) {
      response = await doRequest();
    }
  }

  return parse<T>(response);
}
