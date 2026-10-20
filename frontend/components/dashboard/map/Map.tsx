"use client";

import React, { useState, useCallback } from "react";
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

const DEFAULT_CENTER: Coordinates = { lat: 28.6139, lng: 77.209 };

const DEFAULT_NEARBY_CABS = [
    { id: 1, lat: 28.618, lng: 77.214, type: "Sedan", eta: "2 min" },
    { id: 2, lat: 28.611, lng: 77.204, type: "Taxi", eta: "4 min" },
    { id: 3, lat: 28.622, lng: 77.203, type: "EV", eta: "3 min" },
    { id: 4, lat: 28.608, lng: 77.219, type: "Auto", eta: "5 min" },
];

export const MapComponent: React.FC<MapProps> = ({
    initialCenter = DEFAULT_CENTER,
    zoom = 14,
    height = "100%",
    showSearchOverlay = true,
    showControls = true,
    nearbyCabs = DEFAULT_NEARBY_CABS,
    onPickupChange,
    onDropoffChange,
    onRouteChange,
}) => {
    const [pickupCoords, setPickupCoords] = useState<Coordinates>(initialCenter);
    const [dropoffCoords, setDropoffCoords] = useState<Coordinates | null>(null);
    const [pickupAddress, setPickupAddress] = useState("Current Location");
    const [resolvedPickupAddress, setResolvedPickupAddress] = useState("Current Location");
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
        // When user clicks the map to place dropoff pin:
        onMapClick: async (coords) => {
            setDropoffCoords(coords);
            setDropoffMarker(coords);
            onDropoffChange?.(coords);

            // Immediately reverse geocode and set in the dropoff textfield!
            const address = await reverseGeocodeLocation(coords);
            setDropoffAddress(address || `${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)}`);
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

        // ONLY geocode pickup if user manually typed a new location that is NOT already matched to the pin/GPS
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

        // Dropoff resolution
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
