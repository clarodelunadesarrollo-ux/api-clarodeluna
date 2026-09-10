import type {
    AuthResponse,
    RequestOtpDto,
    User,
    VerifyOtpDto,
} from '@claro-de-luna/shared';
import { apiFetch, publicFetch } from '../../lib/apiClient';

export function requestOtp(body: RequestOtpDto): Promise<{ message: string; devCode?: string }> {
  return publicFetch('/auth/request-otp', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export function verifyOtp(body: VerifyOtpDto): Promise<AuthResponse> {
  return publicFetch('/auth/verify-otp', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export function logout(refreshToken: string): Promise<void> {
  return publicFetch('/auth/logout', {
    method: 'POST',
    body: JSON.stringify({ refreshToken }),
  });
}

export function getMe(): Promise<User> {
  return apiFetch('/users/me');
}
