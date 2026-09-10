import type {
    CheckinDto,
    CheckinResponse,
    CheckinStatusResponse,
    EntranceCodeResponse,
} from '@claro-de-luna/shared';
import { apiFetch } from '../../lib/apiClient';

export function postCheckin(qrToken: string): Promise<CheckinResponse> {
  const body: CheckinDto = { qrToken };
  return apiFetch('/checkin', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export function getCheckinStatus(): Promise<CheckinStatusResponse> {
  return apiFetch('/checkin/status');
}

// Reads the active 4-digit entrance code (qa/admin only).
export function getEntranceCode(): Promise<EntranceCodeResponse> {
  return apiFetch('/checkin/entrance-code');
}

// Forces a new random entrance code (admin only).
export function rotateEntranceCode(): Promise<EntranceCodeResponse> {
  return apiFetch('/checkin/entrance-code/rotate', { method: 'POST' });
}
