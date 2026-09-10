import { create } from 'zustand';
import { getCheckinStatus } from './api';

type AccessStatus = 'unknown' | 'ready';

interface CheckinState {
  status: AccessStatus;
  checkedIn: boolean;
  checkedInAt: string | null;
  // True only right after checking in this session, until the welcome is dismissed.
  // Keeps the "Llegada" tab visible so the guest can read the welcome screen.
  justCheckedIn: boolean;
  // Fetches the current check-in state from the backend to gate navigation.
  hydrate: () => Promise<void>;
  markCheckedIn: (checkedInAt: string) => void;
  acknowledgeArrival: () => void;
  reset: () => void;
}

export const useCheckinStore = create<CheckinState>((set) => ({
  status: 'unknown',
  checkedIn: false,
  checkedInAt: null,
  justCheckedIn: false,

  hydrate: async () => {
    try {
      const result = await getCheckinStatus();
      set({
        status: 'ready',
        checkedIn: result.checkedIn,
        checkedInAt: result.checkedInAt,
        justCheckedIn: false,
      });
    } catch {
      // No reservation, expired session, or offline: treat as not checked in.
      set({ status: 'ready', checkedIn: false, checkedInAt: null, justCheckedIn: false });
    }
  },

  markCheckedIn: (checkedInAt) => {
    set({ status: 'ready', checkedIn: true, checkedInAt, justCheckedIn: true });
  },

  acknowledgeArrival: () => {
    set({ justCheckedIn: false });
  },

  reset: () => {
    set({ status: 'unknown', checkedIn: false, checkedInAt: null, justCheckedIn: false });
  },
}));
