"use client";

import React, { useState } from "react";
import { Box, Typography, Button } from "@mui/material";
import { useTaxii } from "@/context/TaxiiContext";
import styles from "../RiderExperience.module.scss";

export const CompletedStep: React.FC = () => {
  const {
    driverInfo,
    currentRideOtp,
    pickupLocation,
    dropoffLocation,
    fareAmount,
    resetToNewBooking,
  } = useTaxii();

  const [rating, setRating] = useState(5);

  return (
    <Box className={styles.completedCard}>
      <Box className={styles.greenBadge}>✓</Box>

      <Box>
        <Typography component="h2" className={styles.title}>
          Ride completed!
        </Typography>
        <Typography className={styles.subtitle}>
          Thanks for riding with Rydo
        </Typography>
      </Box>

      <Box className={styles.fareBox}>
        <Typography className={styles.fareLabel}>Total fare paid</Typography>
        <Typography className={styles.fareNumber}>₹{fareAmount}</Typography>
        <Typography className={styles.paidVia}>
          ✓ Paid via UPI (OTP: {currentRideOtp})
        </Typography>
      </Box>

      <Box className={styles.completedRouteSummary}>
        <Box className={styles.routePointRow}>
          <Typography component="span" className={styles.dotPickup}>● </Typography>
          <strong>{pickupLocation}</strong>
        </Box>
        <Box className={styles.routePointRow}>
          <Typography component="span" className={styles.dotDropoff}>● </Typography>
          <strong>{dropoffLocation}</strong>
        </Box>
      </Box>

      <Box>
        <Typography className={styles.rateDriverHeading}>
          Rate Captain {driverInfo.name}
        </Typography>
        <Box className={styles.starsRow}>
          {[1, 2, 3, 4, 5].map((star) => (
            <Typography
              component="span"
              key={star}
              className={`${styles.star} ${
                star <= rating ? styles.filled : ""
              }`}
              onClick={() => setRating(star)}
            >
              ★
            </Typography>
          ))}
        </Box>
      </Box>

      <Button
        type="button"
        className={styles.primaryBtn}
        onClick={resetToNewBooking}
      >
        Book Another Ride
      </Button>
    </Box>
  );
};

export default CompletedStep;
