import { create } from "zustand";

interface NetworkState {
    isOnline: boolean;
    syncing: boolean;
    queueCount: number;
    setOnline: (status: boolean) => void;
    setSyncing: (status: boolean) => void;
    setQueueCount: (count: number) => void;
}

export const useNetworkStore = create<NetworkState>((set) => ({
    isOnline: navigator.onLine,
    syncing: false,
    queueCount: 0,
    setOnline: (status) => set({ isOnline: status }),
    setSyncing: (status) => set({ syncing: status }),
    setQueueCount: (count) => set({ queueCount: count }),
}));
