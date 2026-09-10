import type {
    CreateReservationDto,
    Reservation,
    UpdateReservationDto,
} from '@claro-de-luna/shared';
import { apiFetch } from '../../lib/apiClient';

export function getMyReservations(): Promise<Reservation[]> {
  return apiFetch('/reservations/me');
}

export function createReservation(body: CreateReservationDto): Promise<Reservation> {
  return apiFetch('/reservations', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export function updateReservation(
  id: string,
  body: UpdateReservationDto,
): Promise<Reservation> {
  return apiFetch(`/reservations/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(body),
  });
}

export function deleteReservation(id: string): Promise<void> {
  return apiFetch(`/reservations/${id}`, { method: 'DELETE' });
}
