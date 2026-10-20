"use client";

import React from "react";
import { Box, CircularProgress, Typography } from "@mui/material";
import styles from "./MapLoading.module.scss";

interface MapLoadingProps {
    message?: string;
}

export const MapLoading: React.FC<MapLoadingProps> = ({
    message = "Loading map...",
}) => {
    return (
        <Box className={styles.loadingState}>
            <CircularProgress size={36} sx={{ color: "#000000" }} />
            <Typography variant="body2">{message}</Typography>
        </Box>
    );
};

export default MapLoading;
