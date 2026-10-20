"use client";

import React from "react";
import { Box, IconButton } from "@mui/material";
import MyLocationIcon from "@mui/icons-material/MyLocation";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import styles from "./MapControls.module.scss";

interface MapControlsProps {
    onRecenter: () => void;
    onZoomIn: () => void;
    onZoomOut: () => void;
}

export const MapControls: React.FC<MapControlsProps> = ({
    onRecenter,
    onZoomIn,
    onZoomOut,
}) => {
    return (
        <Box className={styles.controlsContainer}>
            <IconButton
                className={styles.controlBtn}
                onClick={onRecenter}
                title="My Location"
                size="small"
            >
                <MyLocationIcon fontSize="small" />
            </IconButton>

            <IconButton
                className={styles.controlBtn}
                onClick={onZoomIn}
                title="Zoom In"
                size="small"
            >
                <AddIcon fontSize="small" />
            </IconButton>

            <IconButton
                className={styles.controlBtn}
                onClick={onZoomOut}
                title="Zoom Out"
                size="small"
            >
                <RemoveIcon fontSize="small" />
            </IconButton>
        </Box>
    );
};

export default MapControls;
