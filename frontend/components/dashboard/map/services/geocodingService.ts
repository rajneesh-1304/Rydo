import { Coordinates } from "../types";

/**
 * Service to search locations using OpenStreetMap Nominatim API (100% Free)
 */
export const searchLocation = async (query: string): Promise<Coordinates | null> => {
    if (!query || query.trim().length < 3) return null;

    try {
        const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
            query
        )}&limit=1`;
        const res = await fetch(url);
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
 * Reverse geocode coordinates into a human-readable street/area address
 */
export const reverseGeocodeLocation = async (coords: Coordinates): Promise<string | null> => {
    try {
        const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${coords.lat}&lon=${coords.lng}`;
        const res = await fetch(url);
        const data = await res.json();

        if (data && data.display_name) {
            const parts = data.display_name.split(",");
            return parts.slice(0, 3).join(",").trim();
        }
        return null;
    } catch (err) {
        return null;
    }
};
