import api from "./api";
import { toast } from "sonner";

type QueuedRequest = {
    config: any;
};

const queue: QueuedRequest[] = [];

export function enqueueRequest(config: any) {
    queue.push({ config });
    toast.info("You’re offline. Action queued.");
}

export async function flushQueue() {
    while (queue.length) {
        const { config } = queue.shift()!;
        try {
            await api(config);
        } catch {
            // If still failing, re-queue and stop
            queue.unshift({ config });
            break;
        }
    }
}

window.addEventListener("online", flushQueue);
