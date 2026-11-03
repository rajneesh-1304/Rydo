import { useEffect, useRef, useState, useCallback } from "react";
import { Coordinates, NearbyCab } from "../types";
import { loadLeaflet } from "../services/leafletLoader";
import { createCarIcon, createPinIcon } from "../services/markerIcons";

interface UseLeafletMapOptions {
    initialCenter: Coordinates;
    zoom: number;
    nearbyCabs?: NearbyCab[];
    liveDriverCoords?: Coordinates | null;
    onMapClick?: (coords: Coordinates) => void;
    onPickupDragEnd?: (coords: Coordinates) => void;
    onDropoffDragEnd?: (coords: Coordinates) => void;
}

export const useLeafletMap = ({
    initialCenter,
    zoom,
    nearbyCabs = [],
    liveDriverCoords,
    onMapClick,
    onPickupDragEnd,
    onDropoffDragEnd,
}: UseLeafletMapOptions) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const mapRef = useRef<any>(null);
    const pickupMarkerRef = useRef<any>(null);
    const dropoffMarkerRef = useRef<any>(null);
    const driverLiveMarkerRef = useRef<any>(null);
    const routePolylineRef = useRef<any>(null);
    const cabsLayerRef = useRef<any>(null);

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

                // 4. Layer group for nearby cabs
                const cabsLayer = L.layerGroup().addTo(map);
                cabsLayerRef.current = cabsLayer;

                const carIcon = createCarIcon(L);
                nearbyCabs.forEach((cab) => {
                    L.marker([cab.lat, cab.lng], { icon: carIcon })
                        .bindTooltip(`${cab.type} • ${cab.eta}`, {
                            direction: "top",
                            offset: [0, -10],
                        })
                        .addTo(cabsLayer);
                });

                // 5. Map Click Listener
                map.on("click", (e: any) => {
                    onMapClickRef.current?.({ lat: e.latlng.lat, lng: e.latlng.lng });
                });

                // Invalidate size after mount
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

    // Update nearby cabs on layer whenever nearbyCabs prop changes
    useEffect(() => {
        const updateCabs = async () => {
            if (!mapRef.current || !cabsLayerRef.current) return;
            const L = await loadLeaflet();
            cabsLayerRef.current.clearLayers();

            const carIcon = createCarIcon(L);
            nearbyCabs.forEach((cab) => {
                L.marker([cab.lat, cab.lng], { icon: carIcon })
                    .bindTooltip(`${cab.type} • ${cab.eta}`, {
                        direction: "top",
                        offset: [0, -10],
                    })
                    .addTo(cabsLayerRef.current);
            });
        };

        updateCabs();
    }, [nearbyCabs]);

    // Live driver GPS marker tracking (updates every 5 seconds)
    useEffect(() => {
        if (!mapRef.current) return;

        const updateDriverLiveMarker = async () => {
            const L = await loadLeaflet();

            if (!liveDriverCoords) {
                if (driverLiveMarkerRef.current) {
                    mapRef.current.removeLayer(driverLiveMarkerRef.current);
                    driverLiveMarkerRef.current = null;
                }
                return;
            }

            if (!driverLiveMarkerRef.current) {
                const driverIcon = L.divIcon({
                    className: "custom-live-driver-marker",
                    html: `
                        <div style="background-color:#2563eb; color:#ffffff; width:34px; height:34px; border-radius:50%; display:flex; align-items:center; justify-content:center; box-shadow:0 0 0 5px rgba(37,99,235,0.25), 0 4px 12px rgba(0,0,0,0.35); border:2.5px solid #ffffff; transition:all 0.8s ease;">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.85 7h10.29l1.04 3H5.81l1.04-3zM19 17H5v-4.66l.12-.34h13.77l.11.34V17z"/>
                                <circle cx="7.5" cy="14.5" r="1.5"/>
                                <circle cx="16.5" cy="14.5" r="1.5"/>
                            </svg>
                        </div>
                    `,
                    iconSize: [34, 34],
                    iconAnchor: [17, 17],
                });

                const marker = L.marker([liveDriverCoords.lat, liveDriverCoords.lng], {
                    icon: driverIcon,
                    zIndexOffset: 1000,
                })
                    .bindTooltip("Captain Amit • Live GPS", {
                        direction: "top",
                        offset: [0, -12],
                    })
                    .addTo(mapRef.current);

                driverLiveMarkerRef.current = marker;
            } else {
                driverLiveMarkerRef.current.setLatLng([liveDriverCoords.lat, liveDriverCoords.lng]);
            }
        };

        updateDriverLiveMarker();
    }, [liveDriverCoords]);

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
        mapRef.current.fitBounds(polyline.getBounds(), { padding: [50, 50] });
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
