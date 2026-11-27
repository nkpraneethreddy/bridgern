/**
 * Zustand store for tracking online/offline status and pending sync queue.
 */

import { create } from 'zustand';
import { offlineStorage } from '../services/offlineStorage';

interface OfflineState {
  isOffline: boolean;
  pendingSyncCount: number;
  lastSyncedAt: string | null;
  isSyncing: boolean;

  setOffline: (offline: boolean) => void;
  syncNow: () => Promise<void>;
  updatePendingCount: () => void;
}

export const useOfflineStore = create<OfflineState>((set, get) => ({
  isOffline: false,
  pendingSyncCount: offlineStorage.getPendingSyncCount(),
  lastSyncedAt: null,
  isSyncing: false,

  setOffline: (offline: boolean) => {
    offlineStorage.setOnline(!offline);
    set({
      isOffline: offline,
      pendingSyncCount: offlineStorage.getPendingSyncCount(),
    });
  },

  updatePendingCount: () => {
    set({ pendingSyncCount: offlineStorage.getPendingSyncCount() });
  },

  syncNow: async () => {
    if (get().isSyncing) return;
    set({ isSyncing: true });
    try {
      await offlineStorage.flushQueue();
      set({
        pendingSyncCount: offlineStorage.getPendingSyncCount(),
        lastSyncedAt: new Date().toLocaleTimeString(),
      });
    } finally {
      set({ isSyncing: false });
    }
  },
}));
