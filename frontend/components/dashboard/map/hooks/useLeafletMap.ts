import { useEffect, useRef, useState, useCallback } from "react";
import { Coordinates, NearbyCab } from "../types";
import { loadLeaflet } from "../services/leafletLoader";
import { createCarIcon, createPinIcon } from "../services/markerIcons";

interface UseLeafletMapOptions {
    initialCenter: Coordinates;
    zoom: number;
    nearbyCabs?: NearbyCab[];
    onMapClick?: (coords: Coordinates) => void;
    onPickupDragEnd?: (coords: Coordinates) => void;
    onDropoffDragEnd?: (coords: Coordinates) => void;
}

export const useLeafletMap = ({
    initialCenter,
    zoom,
    nearbyCabs = [],
    onMapClick,
    onPickupDragEnd,
    onDropoffDragEnd,
}: UseLeafletMapOptions) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const mapRef = useRef<any>(null);
    const pickupMarkerRef = useRef<any>(null);
    const dropoffMarkerRef = useRef<any>(null);
    const routePolylineRef = useRef<any>(null);

    // Keep handler refs up to date to prevent stale closures
    const onMapClickRef = useRef(onMapClick);
    onMapClickRef.current = onMapClick;

    const onPickupDragEndRef = useRef(onPickupDragEnd);
    onPickupDragEndRef.current = onPickupDragEnd;

    const onDropoffDragEndRef = useRef(onDropoffDragEnd);
    onDropoffDragEndRef.current = onDropoffDragEnd;

    const [isLoading, setIsLoading] = useState(true);

    // Initialize Leaflet Map
    useEffect(() => {
        let isMounted = true;
        let resizeTimer: any = null;

        const init = async () => {
            try {
                const L = await loadLeaflet();
                if (!isMounted || !containerRef.current) return;

                if (mapRef.current) {
                    mapRef.current.remove();
                    mapRef.current = null;
                }

                // 1. Create Leaflet Map Instance
                const map = L.map(containerRef.current, {
                    center: [initialCenter.lat, initialCenter.lng],
                    zoom: zoom,
                    zoomControl: false,
                });
                mapRef.current = map;

                // 2. Add OpenStreetMap Tile Layer
                L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
                    attribution:
                        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
                    maxZoom: 19,
                }).addTo(map);

                // 3. Add Pickup Marker
                const pickupIcon = createPinIcon(L, "#10b981", "Pickup");
                const pickupMarker = L.marker([initialCenter.lat, initialCenter.lng], {
                    icon: pickupIcon,
                    draggable: true,
                }).addTo(map);
                pickupMarkerRef.current = pickupMarker;

                pickupMarker.on("dragend", () => {
                    const pos = pickupMarker.getLatLng();
                    onPickupDragEndRef.current?.({ lat: pos.lat, lng: pos.lng });
                });

                // 4. Add Nearby Cabs
                const carIcon = createCarIcon(L);
                nearbyCabs.forEach((cab) => {
                    L.marker([cab.lat, cab.lng], { icon: carIcon })
                        .bindTooltip(`${cab.type} • ${cab.eta}`, {
                            direction: "top",
                            offset: [0, -10],
                        })
                        .addTo(map);
                });

                // 5. Map Click Listener for setting destination
                map.on("click", (e: any) => {
                    onMapClickRef.current?.({ lat: e.latlng.lat, lng: e.latlng.lng });
                });

                // Crucial: Invalidate size after mount to prevent 0x0 rendering
                resizeTimer = setTimeout(() => {
                    if (mapRef.current) {
                        mapRef.current.invalidateSize();
                    }
                }, 150);

                setIsLoading(false);
            } catch (err) {
                console.error("Leaflet initialization error:", err);
                setIsLoading(false);
            }
        };

        init();

        return () => {
            isMounted = false;
            if (resizeTimer) clearTimeout(resizeTimer);
            if (mapRef.current) {
                mapRef.current.remove();
                mapRef.current = null;
            }
        };
    }, []);

    // Set or move Dropoff Marker
    const setDropoffMarker = useCallback(async (coords: Coordinates) => {
        if (!mapRef.current) return;
        const L = await loadLeaflet();

        if (!dropoffMarkerRef.current) {
            const dropoffIcon = createPinIcon(L, "#ef4444", "Drop-off");
            const dropMarker = L.marker([coords.lat, coords.lng], {
                icon: dropoffIcon,
                draggable: true,
            }).addTo(mapRef.current);

            dropMarker.on("dragend", () => {
                const pos = dropMarker.getLatLng();
                onDropoffDragEndRef.current?.({ lat: pos.lat, lng: pos.lng });
            });

            dropoffMarkerRef.current = dropMarker;
        } else {
            dropoffMarkerRef.current.setLatLng([coords.lat, coords.lng]);
        }
    }, []);

    // Set or move Pickup Marker
    const setPickupMarker = useCallback((coords: Coordinates) => {
        if (pickupMarkerRef.current) {
            pickupMarkerRef.current.setLatLng([coords.lat, coords.lng]);
        }
    }, []);

    // Draw OSRM polyline and fit bounds
    const drawRoutePolyline = useCallback(async (coordinates: [number, number][]) => {
        if (!mapRef.current) return;
        const L = await loadLeaflet();

        if (routePolylineRef.current) {
            mapRef.current.removeLayer(routePolylineRef.current);
        }

        const polyline = L.polyline(coordinates, {
            color: "#2563eb",
            weight: 5,
            opacity: 0.85,
            lineJoin: "round",
        }).addTo(mapRef.current);

        routePolylineRef.current = polyline;
        mapRef.current.fitBounds(polyline.getBounds(), { padding: [60, 60] });
    }, []);

    // Clear route polyline and dropoff marker
    const clearRouteFromMap = useCallback(() => {
        if (dropoffMarkerRef.current && mapRef.current) {
            mapRef.current.removeLayer(dropoffMarkerRef.current);
            dropoffMarkerRef.current = null;
        }
        if (routePolylineRef.current && mapRef.current) {
            mapRef.current.removeLayer(routePolylineRef.current);
            routePolylineRef.current = null;
        }
    }, []);

    // Recenter
    const recenterMap = useCallback((coords: Coordinates) => {
        if (mapRef.current) {
            mapRef.current.setView([coords.lat, coords.lng], 15);
            mapRef.current.invalidateSize();
        }
    }, []);

    // Zoom controls
    const zoomIn = useCallback(() => {
        if (mapRef.current) mapRef.current.zoomIn();
    }, []);

    const zoomOut = useCallback(() => {
        if (mapRef.current) mapRef.current.zoomOut();
    }, []);

    return {
        containerRef,
        map: mapRef.current,
        isLoading,
        setPickupMarker,
        setDropoffMarker,
        drawRoutePolyline,
        clearRouteFromMap,
        recenterMap,
        zoomIn,
        zoomOut,
    };
};
