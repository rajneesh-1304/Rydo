"use client";

import React from "react";
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

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!isReady) return;
        onFindCabs(pickupAddress.trim(), dropoffAddress.trim());
    };

    const handleClearDropoff = () => {
        setDropoffAddress("");
        onClearRoute();
    };

    return (
        <Box className={styles.searchOverlay}>
            <Box className={styles.overlayHeader}>
                <Typography className={styles.overlayTitle}>
                    Book a Ride
                </Typography>

                <Box className={styles.badgeGroup}>
                    <span className={styles.statusChip}>
                        {nearbyCabsCount} Cabs Nearby
                    </span>
                </Box>
            </Box>

            <Box
                className={styles.inputGroup}
                component="form"
                onSubmit={handleSubmit}
            >
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
                                            onClick={() => setPickupAddress("")}
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