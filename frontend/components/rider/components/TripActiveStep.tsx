"use client";

import React from "react";
import Image from "next/image";
import { Box, Typography, Button } from "@mui/material";
import NavigationIcon from "@mui/icons-material/Navigation";
import { useTaxii } from "@/context/TaxiiContext";
import styles from "../RiderExperience.module.scss";

export const TripActiveStep: React.FC = () => {
  const { driverInfo, dropoffLocation, completeRideManually } = useTaxii();

  return (
    <>
      <Box>
        <Box className={styles.stepHeaderRow}>
          <Box>
            <Typography component="h2" className={styles.title}>
              🚗 On Trip to Destination
            </Typography>
            <Typography className={styles.subtitle}>
              Heading to {dropoffLocation.split(",")[0]}
            </Typography>
          </Box>
        </Box>

        <Box className={styles.tripActiveBanner}>
          <Box className={styles.tripActiveTitle}>
            <NavigationIcon fontSize="small" />
            <Typography component="span">OTP Verified • Ride In Progress</Typography>
          </Box>
          <Typography className={styles.tripActiveSubtitle}>
            Captain {driverInfo.name} is driving. Estimated arrival in 9 mins.
          </Typography>
        </Box>

        <Box className={styles.driverCard}>
          <Box className={styles.driverHeader}>
            <Image
              src={driverInfo.avatar}
              alt={driverInfo.name}
              width={44}
              height={44}
              className={styles.driverAvatar}
            />
            <Box className={styles.driverMeta}>
              <Typography className={styles.driverName}>{driverInfo.name}</Typography>
              <Typography className={styles.vehiclePlate}>
                {driverInfo.vehicleModel} • {driverInfo.vehiclePlate}
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>

      <Button
        type="button"
        className={styles.primaryBtn}
        onClick={completeRideManually}
      >
        End Ride (Complete Demo)
      </Button>
    </>
  );
};

export default TripActiveStep;
