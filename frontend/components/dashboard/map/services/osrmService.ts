import { Coordinates, RouteInfo } from "../types";

export const getOSRMRoute = async (
    pickup: Coordinates,
    dropoff: Coordinates
): Promise<RouteInfo | null> => {
    try {
        const url = `https://router.project-osrm.org/route/v1/driving/${pickup.lng},${pickup.lat};${dropoff.lng},${dropoff.lat}?overview=full&geometries=geojson`;
        const response = await fetch(url);
        const data = await response.json();

        if (data.code === "Ok" && data.routes && data.routes.length > 0) {
            const route = data.routes[0];
            const distanceKm = Number((route.distance / 1000).toFixed(1));
            const durationMins = Math.ceil(route.duration / 60);
            
            const coordinates: [number, number][] = route.geometry.coordinates.map(
                ([lng, lat]: [number, number]) => [lat, lng]
            );

            return {
                distanceKm,
                durationMins,
                coordinates,
            };
        }

        return null;
    } catch (error) {
        console.error("OSRM Routing Service Error:", error);
        return null;
    }
};
