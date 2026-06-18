// importing utilities
import { getFromStorage } from "@/lib/storage";

// usePermission.ts
export function usePermission(permission: string): boolean {
    const permissions = getFromStorage("permissions") as string[];

    if (!permissions || !Array.isArray(permissions)) {
        return false;
    }

    return permissions.includes(permission);
}