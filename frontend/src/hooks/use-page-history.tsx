import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { getLabelFromName } from "@/lib/utils";

const STORAGE_KEY = "navigation_history_stack";
const MAX_HISTORY = 20;

export interface HistoryItem {
    path: string;
    label: string;
    timestamp: number;
}

export function usePageHistory() {
    const location = useLocation();
    const [history, setHistory] = useState<HistoryItem[]>([]);

    useEffect(() => {
        // 1. Load existing history from session storage
        const stored = sessionStorage.getItem(STORAGE_KEY);
        let currentStack: HistoryItem[] = stored ? JSON.parse(stored) : [];

        const currentPath = location.pathname;

        // Generate a label (You might want to improve this label logic based on your routes)
        const segments = currentPath.split("/").filter(Boolean);
        const rawLabel = segments.length > 0 ? segments[segments.length - 1] : "Home";
        const label = getLabelFromName(rawLabel);

        const newItem: HistoryItem = {
            path: currentPath,
            label: label,
            timestamp: Date.now(),
        };

        // 2. Logic: Avoid duplicate adjacent entries (reloads shouldn't add to stack)
        const lastItem = currentStack[currentStack.length - 1];

        if (!lastItem || lastItem.path !== currentPath) {
            // If we navigated BACK to a page that already exists in the stack, 
            // we should technically truncate the "future" to keep the timeline clean.
            // Check if current path exists previously in stack
            const existingIndex = currentStack.findIndex(item => item.path === currentPath);

            if (existingIndex !== -1) {
                // We jumped back to a previous state, trim everything after it
                currentStack = currentStack.slice(0, existingIndex + 1);
            } else {
                // New page, push it
                currentStack.push(newItem);
            }

            // Cap the size
            if (currentStack.length > MAX_HISTORY) {
                currentStack.shift();
            }

            setHistory(currentStack);
            sessionStorage.setItem(STORAGE_KEY, JSON.stringify(currentStack));
        } else {
            // Even if it's the same path, ensure state is synced
            setHistory(currentStack);
        }

    }, [location.pathname]);

    const clearHistory = () => {
        setHistory([]);
        sessionStorage.removeItem(STORAGE_KEY);
    };

    return { history, clearHistory };
}