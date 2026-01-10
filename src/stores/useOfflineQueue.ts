"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { PendingEntry } from "@/types";

interface OfflineQueueStore {
  queue: PendingEntry[];
  isOnline: boolean;

  // Actions
  addEntry: (entry: Omit<PendingEntry, "status">) => void;
  markSyncing: (localId: string) => void;
  markFailed: (localId: string) => void;
  removeEntry: (localId: string) => void;
  setOnline: (online: boolean) => void;
  getPending: () => PendingEntry[];
}

export const useOfflineQueue = create<OfflineQueueStore>()(
  persist(
    (set, get) => ({
      queue: [],
      isOnline: typeof navigator !== "undefined" ? navigator.onLine : true,

      addEntry: (entry) =>
        set((state) => ({
          queue: [...state.queue, { ...entry, status: "pending" }],
        })),

      markSyncing: (localId) =>
        set((state) => ({
          queue: state.queue.map((e) =>
            e.localId === localId ? { ...e, status: "syncing" } : e
          ),
        })),

      markFailed: (localId) =>
        set((state) => ({
          queue: state.queue.map((e) =>
            e.localId === localId ? { ...e, status: "failed" } : e
          ),
        })),

      removeEntry: (localId) =>
        set((state) => ({
          queue: state.queue.filter((e) => e.localId !== localId),
        })),

      setOnline: (online) => set({ isOnline: online }),

      getPending: () => get().queue.filter((e) => e.status === "pending"),
    }),
    {
      name: "mood-meter-offline-queue",
      partialize: (state) => ({ queue: state.queue }),
    }
  )
);
