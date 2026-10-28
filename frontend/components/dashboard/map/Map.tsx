"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Box } from "@mui/material";

// Import Leaflet styles directly into the bundle
import "leaflet/dist/leaflet.css";

import { Coordinates, MapProps, RouteInfo } from "./types";
import { useLeafletMap } from "./hooks/useLeafletMap";
import { getOSRMRoute } from "./services/osrmService";
import { searchLocation, reverseGeocodeLocation } from "./services/geocodingService";
import { MapControls } from "./components/MapControls/MapControls";
import { SearchOverlay } from "./components/SearchOverlay/SearchOverlay";
import { MapLoading } from "./components/MapLoading/MapLoading";

import styles from "./Map.module.scss";

const DEFAULT_CENTER: Coordinates = { lat: 30.7333, lng: 76.7794 };

export const MapComponent: React.FC<MapProps> = ({
    initialCenter = DEFAULT_CENTER,
    zoom = 14,
    showSearchOverlay = false,
    showControls = true,
    nearbyCabs = [],
    pickupCoords: externalPickup,
    dropoffCoords: externalDropoff,
    onMapClickCoords,
    onPickupChange,
    onDropoffChange,
    onRouteChange,
    drawRouteDirectly,
}) => {
    const [pickupCoords, setPickupCoords] = useState<Coordinates>(externalPickup || initialCenter);
    const [dropoffCoords, setDropoffCoords] = useState<Coordinates | null>(externalDropoff || null);
    const [pickupAddress, setPickupAddress] = useState("Sector 22, Chandigarh");
    const [resolvedPickupAddress, setResolvedPickupAddress] = useState("Sector 22, Chandigarh");
    const [dropoffAddress, setDropoffAddress] = useState("");
    const [routeInfo, setRouteInfo] = useState<RouteInfo | null>(null);

    // Calculate driving route using OSRM Service
    const calculateRoute = useCallback(
        async (pickup: Coordinates, dropoff: Coordinates) => {
            const route = await getOSRMRoute(pickup, dropoff);
            if (route && route.coordinates) {
                setRouteInfo(route);
                drawRoutePolyline(route.coordinates);
                onRouteChange?.(route);
            }
        },
        [onRouteChange]
    );

    // Hook: Handles all Leaflet map and marker logic
    const {
        containerRef,
        isLoading,
        setPickupMarker,
        setDropoffMarker,
        drawRoutePolyline,
        clearRouteFromMap,
        recenterMap,
        zoomIn,
        zoomOut,
    } = useLeafletMap({
        initialCenter,
        zoom,
        nearbyCabs,
        // When user clicks the map:
        onMapClick: async (coords) => {
            if (onMapClickCoords) {
                onMapClickCoords(coords);
            } else {
                setDropoffCoords(coords);
                setDropoffMarker(coords);
                onDropoffChange?.(coords);

                const address = await reverseGeocodeLocation(coords);
                setDropoffAddress(address || `${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)}`);
            }
        },
        // When user drags pickup marker:
        onPickupDragEnd: async (coords) => {
            setPickupCoords(coords);
            onPickupChange?.(coords);

            const address = await reverseGeocodeLocation(coords);
            const resolved = address || `${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)}`;
            setPickupAddress(resolved);
            setResolvedPickupAddress(resolved);
        },
        // When user drags dropoff marker:
        onDropoffDragEnd: async (coords) => {
            setDropoffCoords(coords);
            onDropoffChange?.(coords);

            const address = await reverseGeocodeLocation(coords);
            setDropoffAddress(address || `${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)}`);
        },
    });

    // Sync external pickup coordinates
    useEffect(() => {
        if (externalPickup) {
            setPickupCoords(externalPickup);
            setPickupMarker(externalPickup);
        }
    }, [externalPickup, setPickupMarker]);

    // Sync external dropoff coordinates
    useEffect(() => {
        if (externalDropoff) {
            setDropoffCoords(externalDropoff);
            setDropoffMarker(externalDropoff);
        }
    }, [externalDropoff, setDropoffMarker]);

    // Calculate route when both coordinates are available
    useEffect(() => {
        const p = externalPickup || pickupCoords;
        const d = externalDropoff !== undefined ? externalDropoff : dropoffCoords;
        if (p && d) {
            calculateRoute(p, d);
        }
    }, [externalPickup, externalDropoff, calculateRoute]);

    // Draw route directly if provided
    useEffect(() => {
        if (drawRouteDirectly && drawRouteDirectly.length > 0) {
            drawRoutePolyline(drawRouteDirectly);
        }
    }, [drawRouteDirectly, drawRoutePolyline]);

    const handleClearRoute = () => {
        clearRouteFromMap();
        setDropoffCoords(null);
        setDropoffAddress("");
        setRouteInfo(null);
        onRouteChange?.(null);
        onDropoffChange?.(null);
        recenterMap(pickupCoords);
    };

    const handleFindCabs = async (pickupQuery: string, dropoffQuery: string) => {
        let pCoords = pickupCoords;

        const isPickupAlreadySet =
            pickupQuery === "Current Location" ||
            pickupQuery === resolvedPickupAddress ||
            pickupQuery === pickupAddress;

        if (!isPickupAlreadySet && pickupQuery.trim()) {
            const targetPickup = await searchLocation(pickupQuery);
            if (targetPickup) {
                pCoords = targetPickup;
                setPickupCoords(targetPickup);
                setPickupMarker(targetPickup);
                setResolvedPickupAddress(pickupQuery);
                onPickupChange?.(targetPickup);
            }
        }

        let dCoords = dropoffCoords;
        if (!dCoords || dropoffQuery !== dropoffAddress) {
            const targetDropoff = await searchLocation(dropoffQuery);
            if (targetDropoff) {
                dCoords = targetDropoff;
                setDropoffCoords(targetDropoff);
                setDropoffMarker(targetDropoff);
                onDropoffChange?.(targetDropoff);
            }
        }

        if (pCoords && dCoords) {
            calculateRoute(pCoords, dCoords);
        }
    };

    const handleFetchCurrentLocation = () => {
        if (!navigator.geolocation) {
            alert("Geolocation is not supported by your browser");
            return;
        }

        navigator.geolocation.getCurrentPosition(
            async (pos) => {
                const coords: Coordinates = {
                    lat: pos.coords.latitude,
                    lng: pos.coords.longitude,
                };
                setPickupCoords(coords);
                setPickupMarker(coords);
                recenterMap(coords);
                onPickupChange?.(coords);

                const address = await reverseGeocodeLocation(coords);
                const resolved = address || "Current Location";
                setPickupAddress(resolved);
                setResolvedPickupAddress(resolved);
            },
            (err) => {
                console.warn("Geolocation error:", err.message);
                alert("Please allow location access in your browser to detect current location.");
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0,
            }
        );
    };

    return (
        <Box className={styles.mapWrapper}>
            {isLoading && <MapLoading message="Loading Map..." />}

            <div ref={containerRef} className={styles.mapContainer} />

            {showSearchOverlay && (
                <SearchOverlay
                    pickupAddress={pickupAddress}
                    setPickupAddress={setPickupAddress}
                    dropoffAddress={dropoffAddress}
                    setDropoffAddress={setDropoffAddress}
                    routeInfo={routeInfo}
                    nearbyCabsCount={nearbyCabs.length}
                    onUseCurrentLocation={handleFetchCurrentLocation}
                    onFindCabs={handleFindCabs}
                    onClearRoute={handleClearRoute}
                />
            )}

            {showControls && (
                <MapControls
                    onRecenter={handleFetchCurrentLocation}
                    onZoomIn={zoomIn}
                    onZoomOut={zoomOut}
                />
            )}
        </Box>
    );
};

export default MapComponent;
