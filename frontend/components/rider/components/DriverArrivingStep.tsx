"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Box, Typography, Button } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import KeyIcon from "@mui/icons-material/Key";
import PhoneIcon from "@mui/icons-material/Phone";
import ChatIcon from "@mui/icons-material/Chat";
import ShareIcon from "@mui/icons-material/Share";
import { useTaxii } from "@/context/TaxiiContext";
import styles from "../RiderExperience.module.scss";

type DriverArrivingStepProps = {
  onCancel: () => void;
  onOpenChat: () => void;
};

export const DriverArrivingStep: React.FC<DriverArrivingStepProps> = ({
  onCancel,
  onOpenChat,
}) => {
  const {
    driverInfo,
    currentRideOtp,
    pickupLocation,
    dropoffLocation,
  } = useTaxii();

  const [showShareAlert, setShowShareAlert] = useState(false);

  const handleShareRide = () => {
    setShowShareAlert(true);
    setTimeout(() => setShowShareAlert(false), 2500);
  };

  return (
    <>
      <Box>
        <Box className={styles.stepHeaderRow}>
          <Button
            type="button"
            onClick={onCancel}
            className={styles.backIconBtn}
          >
            <ArrowBackIcon fontSize="small" />
          </Button>
          <Box>
            <Typography component="h2" className={styles.title}>
              Driver is on the way
            </Typography>
            <Typography className={styles.subtitle}>
              Arriving in {driverInfo.etaMinutes} min • {driverInfo.distanceKm} km away
            </Typography>
          </Box>
        </Box>

        {/* OTP CARD - Displayed prominently for the passenger */}
        <Box className={styles.otpCard}>
          <Box className={styles.otpShareHeader}>
            <KeyIcon fontSize="small" />
            <Typography component="span">Share OTP with driver to start ride</Typography>
          </Box>
          <Typography className={styles.otpCode}>{currentRideOtp}</Typography>
          <Typography className={styles.otpHint}>
            Driver must enter this 4-digit OTP on their phone to start trip
          </Typography>
        </Box>

        {/* Driver Info Card */}
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
              <Typography className={styles.driverRating}>
                ★ {driverInfo.rating} ({driverInfo.rides} trips)
              </Typography>
              <Typography className={styles.vehiclePlate}>
                {driverInfo.vehicleModel} • {driverInfo.vehiclePlate}
              </Typography>
            </Box>

            <Box className={styles.driverActions}>
              <Button
                type="button"
                title="Call driver"
                onClick={() => alert(`Calling driver: ${driverInfo.phone}`)}
              >
                <PhoneIcon fontSize="small" />
              </Button>
              <Button
                type="button"
                title="Chat with driver"
                onClick={onOpenChat}
              >
                <ChatIcon fontSize="small" />
              </Button>
            </Box>
          </Box>

          <Box className={styles.routeSummary}>
            <Box className={styles.point}>
              <Box className={styles.dotGreen} />
              <Typography component="span">{pickupLocation}</Typography>
            </Box>
            <Box className={styles.point}>
              <Box className={styles.dotRed} />
              <Typography component="span">{dropoffLocation}</Typography>
            </Box>
          </Box>
        </Box>

        <Button
          type="button"
          className={`${styles.secondaryBtn} ${styles.shareBtn}`}
          onClick={handleShareRide}
        >
          <ShareIcon fontSize="small" />
          Share ride details
        </Button>

        {showShareAlert && (
          <Box className={styles.shareToast}>
            ✓ Live ride details & OTP copied to clipboard!
          </Box>
        )}
      </Box>

      {/* Passenger Cancel Ride Button */}
      <Button
        type="button"
        className={`${styles.secondaryBtn} ${styles.cancelRideAlertBtn}`}
        onClick={onCancel}
      >
        Cancel Ride
      </Button>
    </>
  );
};

export default DriverArrivingStep;
