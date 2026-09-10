import type { ItineraryResponse } from '@claro-de-luna/shared';
import { apiFetch } from '../../lib/apiClient';
import { loadItinerary } from './offlineStore';

export function getItinerary(): Promise<ItineraryResponse> {
  return apiFetch('/itinerary');
}

// Falls back to the route the user explicitly downloaded when the network fails.
export async function getItineraryWithOfflineFallback(): Promise<ItineraryResponse> {
  try {
    return await getItinerary();
  } catch (error) {
    const cached = await loadItinerary();
    if (cached) return cached;
    throw error;
  }
}
