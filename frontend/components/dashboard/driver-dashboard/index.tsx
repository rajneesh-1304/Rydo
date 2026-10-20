"use client";

import React from 'react';
import { Box } from '@mui/material';
import MapComponent from '../map';
import styles from './index.module.scss';

const DriverDashboard = () => {
  return (
    <Box className={styles.dashboardContainer}>
      <Box className={styles.mapWrapper}>
        <MapComponent height="100%" />
      </Box>
    </Box>
  );
};

export default DriverDashboard;