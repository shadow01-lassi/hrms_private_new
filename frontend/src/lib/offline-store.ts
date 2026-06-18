type Listener = (online: boolean) => void;

let online = navigator.onLine;
const listeners = new Set<Listener>();

export function isOnline() {
    return online;
}

export function subscribe(listener: Listener) {
    listeners.add(listener);
    return () => listeners.delete(listener);
}

function notify() {
    listeners.forEach(l => l(online));
}

window.addEventListener("online", () => {
    online = true;
    notify();
});

window.addEventListener("offline", () => {
    online = false;
    notify();
});
