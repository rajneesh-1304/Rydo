"use client";

import React, { useState, useEffect, useRef } from "react";
import {
    Box,
    Button,
    TextField,
    Typography,
    IconButton,
    Tooltip,
} from "@mui/material";
import { RouteInfo } from "../../types";
import styles from "./SearchOverlay.module.scss";
import ClearIcon from "@mui/icons-material/Clear";
import SearchIcon from "@mui/icons-material/Search";
import MyLocationIcon from "@mui/icons-material/MyLocation";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import {
    searchLocationSuggestions,
    LocationSuggestion,
} from "../../services/geocodingService";

interface SearchOverlayProps {
    pickupAddress: string;
    setPickupAddress: (val: string) => void;
    dropoffAddress: string;
    setDropoffAddress: (val: string) => void;
    routeInfo: RouteInfo | null;
    nearbyCabsCount?: number;
    onUseCurrentLocation: () => void;
    onFindCabs: (pickup: string, dropoff: string) => void;
    onClearRoute: () => void;
}

export const SearchOverlay: React.FC<SearchOverlayProps> = ({
    pickupAddress,
    setPickupAddress,
    dropoffAddress,
    setDropoffAddress,
    routeInfo,
    nearbyCabsCount = 4,
    onUseCurrentLocation,
    onFindCabs,
    onClearRoute,
}) => {
    const isReady = pickupAddress.trim().length > 0 && dropoffAddress.trim().length > 0;

    const [pickupSuggestions, setPickupSuggestions] = useState<LocationSuggestion[]>([]);
    const [dropoffSuggestions, setDropoffSuggestions] = useState<LocationSuggestion[]>([]);
    const overlayRef = useRef<HTMLDivElement>(null);

    // Debounced search for pickup
    useEffect(() => {
        if (!pickupAddress || pickupAddress.trim().length < 3) {
            setPickupSuggestions([]);
            return;
        }
        const timer = setTimeout(async () => {
            const results = await searchLocationSuggestions(pickupAddress);
            setPickupSuggestions(results);
        }, 350);
        return () => clearTimeout(timer);
    }, [pickupAddress]);

    // Debounced search for dropoff
    useEffect(() => {
        if (!dropoffAddress || dropoffAddress.trim().length < 3) {
            setDropoffSuggestions([]);
            return;
        }
        const timer = setTimeout(async () => {
            const results = await searchLocationSuggestions(dropoffAddress);
            setDropoffSuggestions(results);
        }, 350);
        return () => clearTimeout(timer);
    }, [dropoffAddress]);

    // Close on outside click
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (overlayRef.current && !overlayRef.current.contains(e.target as Node)) {
                setPickupSuggestions([]);
                setDropoffSuggestions([]);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!isReady) return;
        setPickupSuggestions([]);
        setDropoffSuggestions([]);
        onFindCabs(pickupAddress.trim(), dropoffAddress.trim());
    };

    const handleClearDropoff = () => {
        setDropoffAddress("");
        setDropoffSuggestions([]);
        onClearRoute();
    };

    const handleSelectPickupSuggestion = (s: LocationSuggestion) => {
        const full = s.displayName + (s.secondaryText ? `, ${s.secondaryText}` : "");
        setPickupAddress(full);
        setPickupSuggestions([]);
    };

    const handleSelectDropoffSuggestion = (s: LocationSuggestion) => {
        const full = s.displayName + (s.secondaryText ? `, ${s.secondaryText}` : "");
        setDropoffAddress(full);
        setDropoffSuggestions([]);
    };

    return (
        <Box className={styles.searchOverlay} ref={overlayRef}>
            <Box className={styles.overlayHeader}>
                <Typography className={styles.overlayTitle}>
                    Book a Ride
                </Typography>

                <Box className={styles.badgeGroup}>
                    <span className={styles.statusChip}>
                        ● {nearbyCabsCount} Cabs Nearby
                    </span>
                </Box>
            </Box>

            <Box
                className={styles.inputGroup}
                component="form"
                onSubmit={handleSubmit}
            >
                {/* Pickup Field */}
                <Box className={styles.inputFieldWrapper}>
                    <TextField
                        type="text"
                        fullWidth
                        size="small"
                        value={pickupAddress}
                        onChange={(e) => setPickupAddress(e.target.value)}
                        className={styles.inputField}
                        placeholder="Enter pickup location"
                        slotProps={{
                            input: {
                                startAdornment: (
                                    <Box className={styles.pickupDot} />
                                ),
                                endAdornment: (
                                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                                        {pickupAddress && (
                                            <IconButton
                                                size="small"
                                                aria-label="Clear pickup"
                                                onClick={() => {
                                                    setPickupAddress("");
                                                    setPickupSuggestions([]);
                                                }}
                                            >
                                                <ClearIcon fontSize="small" />
                                            </IconButton>
                                        )}
                                        <Tooltip title="Fetch current GPS location" arrow>
                                            <IconButton
                                                size="small"
                                                aria-label="Use current location"
                                                onClick={onUseCurrentLocation}
                                                sx={{ color: "#059669" }}
                                            >
                                                <MyLocationIcon fontSize="small" />
                                            </IconButton>
                                        </Tooltip>
                                    </Box>
                                ),
                            },
                        }}
                    />

                    {pickupSuggestions.length > 0 && (
                        <Box className={styles.suggestionsDropdown}>
                            {pickupSuggestions.map((s, idx) => (
                                <button
                                    key={`${s.displayName}-${idx}`}
                                    type="button"
                                    className={styles.suggestionItem}
                                    onClick={() => handleSelectPickupSuggestion(s)}
                                >
                                    <LocationOnIcon className={styles.suggestionIcon} />
                                    <Box className={styles.suggestionDetails}>
                                        <Typography className={styles.suggestionPrimary}>
                                            {s.displayName}
                                        </Typography>
                                        {s.secondaryText && (
                                            <Typography className={styles.suggestionSecondary}>
                                                {s.secondaryText}
                                            </Typography>
                                        )}
                                    </Box>
                                </button>
                            ))}
                        </Box>
                    )}
                </Box>

                {/* Dropoff Field */}
                <Box className={styles.inputFieldWrapper}>
                    <TextField
                        type="text"
                        fullWidth
                        size="small"
                        value={dropoffAddress}
                        onChange={(e) => setDropoffAddress(e.target.value)}
                        className={styles.inputField}
                        placeholder="Where to? (or locate on map)"
                        slotProps={{
                            input: {
                                startAdornment: (
                                    <Box className={styles.dropoffDot} />
                                ),
                                endAdornment: dropoffAddress ? (
                                    <IconButton
                                        size="small"
                                        aria-label="Clear dropoff"
                                        onClick={handleClearDropoff}
                                    >
                                        <ClearIcon fontSize="small" />
                                    </IconButton>
                                ) : (
                                    <SearchIcon sx={{ color: "#94a3b8", fontSize: 20, mr: 0.5 }} />
                                ),
                            },
                        }}
                    />

                    {dropoffSuggestions.length > 0 && (
                        <Box className={styles.suggestionsDropdown}>
                            {dropoffSuggestions.map((s, idx) => (
                                <button
                                    key={`${s.displayName}-${idx}`}
                                    type="button"
                                    className={styles.suggestionItem}
                                    onClick={() => handleSelectDropoffSuggestion(s)}
                                >
                                    <LocationOnIcon className={styles.suggestionIcon} />
                                    <Box className={styles.suggestionDetails}>
                                        <Typography className={styles.suggestionPrimary}>
                                            {s.displayName}
                                        </Typography>
                                        {s.secondaryText && (
                                            <Typography className={styles.suggestionSecondary}>
                                                {s.secondaryText}
                                            </Typography>
                                        )}
                                    </Box>
                                </button>
                            ))}
                        </Box>
                    )}
                </Box>

                <Button
                    type="submit"
                    variant="contained"
                    fullWidth
                    disabled={!isReady}
                    className={styles.submitBtn}
                >
                    Find Cabs
                </Button>

                {routeInfo && (
                    <Box className={styles.routeInfoBanner}>
                        <Box className={styles.routeMetrics}>
                            <Box className={styles.metricItem}>
                                <Typography className={styles.metricLabel}>
                                    Distance
                                </Typography>
                                <Typography className={styles.metricValue}>
                                    {routeInfo.distanceKm} km
                                </Typography>
                            </Box>

                            <Box className={styles.metricItem}>
                                <Typography className={styles.metricLabel}>
                                    Duration
                                </Typography>
                                <Typography className={styles.metricValue}>
                                    {routeInfo.durationMins} mins
                                </Typography>
                            </Box>
                        </Box>

                        <button
                            className={styles.resetRouteBtn}
                            onClick={handleClearDropoff}
                            type="button"
                        >
                            Clear Route
                        </button>
                    </Box>
                )}
            </Box>
        </Box>
    );
};

export default SearchOverlay;
