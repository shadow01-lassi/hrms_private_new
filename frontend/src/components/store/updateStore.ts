import { create } from "zustand";

interface UpdateState {
    mustUpdate: boolean;
    setMustUpdate: (status: boolean) => void;
}

export const useUpdateStore = create<UpdateState>((set) => ({
    mustUpdate: false,
    setMustUpdate: (status) => set({ mustUpdate: status }),
}));

// Helper to trigger from non-react files (like api.ts)
export const triggerForcedUpdate = () => {
    useUpdateStore.getState().setMustUpdate(true);
};
