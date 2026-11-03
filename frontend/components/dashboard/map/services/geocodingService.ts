import { Coordinates } from "../types";

export interface LocationSuggestion {
    displayName: string;
    secondaryText?: string;
    coords: Coordinates;
}

/**
 * Service to search locations using OpenStreetMap Nominatim API (100% Free)
 */
export const searchLocation = async (query: string): Promise<Coordinates | null> => {
    if (!query || query.trim().length < 3) return null;

    try {
        const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
            query
        )}&limit=1`;
        const res = await fetch(url, { headers: { "Accept-Language": "en" } });
        const data = await res.json();

        if (data && data.length > 0) {
            return {
                lat: parseFloat(data[0].lat),
                lng: parseFloat(data[0].lon),
            };
        }
        return null;
    } catch (err) {
        console.error("Geocoding Service Error:", err);
        return null;
    }
};

/**
 * Search autocomplete suggestions for live place search
 */
export const searchLocationSuggestions = async (
    query: string
): Promise<LocationSuggestion[]> => {
    if (!query || query.trim().length < 2) return [];

    try {
        const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
            query
        )}&limit=5&addressdetails=1`;
        const res = await fetch(url, { headers: { "Accept-Language": "en" } });
        const data = await res.json();

        if (Array.isArray(data)) {
            return data.map((item: any) => {
                const parts = (item.display_name || "").split(",");
                const main = parts[0]?.trim() || query;
                const secondary = parts.slice(1, 3).join(",").trim();

                return {
                    displayName: main,
                    secondaryText: secondary || undefined,
                    coords: {
                        lat: parseFloat(item.lat),
                        lng: parseFloat(item.lon),
                    },
                };
            });
        }
        return [];
    } catch (err) {
        console.warn("Location suggestions error:", err);
        return [];
    }
};

/**
 * Reverse geocode coordinates into a human-readable street/area address
 */
export const reverseGeocodeLocation = async (coords: Coordinates): Promise<string | null> => {
    try {
        const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${coords.lat}&lon=${coords.lng}`;
        const res = await fetch(url, { headers: { "Accept-Language": "en" } });
        const data = await res.json();

        if (data && data.display_name) {
            const parts = data.display_name.split(",");
            return parts.slice(0, 3).join(",").trim();
        }
        return null;
    } catch {
        return null;
    }
};
