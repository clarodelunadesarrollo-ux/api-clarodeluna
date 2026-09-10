import type { ItineraryResponse } from '@claro-de-luna/shared';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'claro-de-luna:itinerary';

export async function saveItinerary(data: ItineraryResponse): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export async function loadItinerary(): Promise<ItineraryResponse | null> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  if (!raw) return null;

  try {
    const parsed: unknown = JSON.parse(raw);
    return isItineraryResponse(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export async function hasSavedItinerary(): Promise<boolean> {
  const raw = await AsyncStorage.getItem(STORAGE_KEY);
  return raw !== null;
}

// Defensive check: stored payloads may be stale from an older app version.
function isItineraryResponse(value: unknown): value is ItineraryResponse {
  if (typeof value !== 'object' || value === null) return false;
  const candidate = value as Record<string, unknown>;
  return (
    ('reservationId' in candidate) &&
    Array.isArray(candidate.milestones)
  );
}
