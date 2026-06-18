// UTILITY FUNCTIONS

export function customReplaceAll(str: string, search: string, replacement: string): string {
    if (search === "") return str; // prevent infinite loop
    return str.split(search).join(replacement);
}

export function formatDate(inputDate: Date) {
    const date = inputDate.getDate();
    const month = inputDate.getMonth() + 1;
    const year = inputDate.getFullYear();

    const newDate = date.toString().padStart(2, '0');
    const newMonth = month.toString().padStart(2, '0');

    return `${year}-${newMonth}-${newDate}`;
}

export function formatDateReverse(inputDate: Date) {
    const date = inputDate.getDate();
    const month = inputDate.getMonth() + 1;
    const year = inputDate.getFullYear();

    const newDate = date.toString().padStart(2, '0');
    const newMonth = month.toString().padStart(2, '0');

    return `${newDate}-${newMonth}-${year}`;
}

export async function getISTFormattedDate(date: Date) {
    // Get the UTC time
    const utcDate = new Date(date.getTime() + date.getTimezoneOffset() * 60000);

    // Add 5 hours and 30 minutes for IST
    const istDate = new Date(utcDate.getTime() + 5.5 * 60 * 60 * 1000);

    // Format the IST date manually
    const year = istDate.getFullYear();
    const month = String(istDate.getMonth() + 1).padStart(2, "0"); // Months are 0-indexed
    const day = String(istDate.getDate()).padStart(2, "0");
    const hours = String(istDate.getHours()).padStart(2, "0");
    const minutes = String(istDate.getMinutes()).padStart(2, "0");
    const seconds = String(istDate.getSeconds()).padStart(2, "0");

    return `${day}-${month}-${year} ${hours}:${minutes}:${seconds}`;
}

// HELPER: Parse JSON array photos in gel_photo_url
export const processEntryPhotos = (row: any) => {
    const entry = { ...row };
    const rawPhoto = entry.photoUrl;

    if (rawPhoto && rawPhoto.startsWith('[')) {
        try {
            const photos = JSON.parse(rawPhoto);
            if (Array.isArray(photos)) {
                entry.photoUrl = photos[0] || null;
                // Only provide the rest of the photos to avoid duplication in frontend galleries
                entry.additionalPhotos = JSON.stringify(photos.slice(1));
            }
        } catch (e) {
            console.error("Failed to parse photoUrl as JSON", e);
        }
    }
    return entry;
};