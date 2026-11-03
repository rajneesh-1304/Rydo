"use client";

import React from "react";
import { Box, Typography, Button } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import RadioButtonCheckedIcon from "@mui/icons-material/RadioButtonChecked";
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";
import { useTaxii } from "@/context/TaxiiContext";
import styles from "../RiderExperience.module.scss";

type FindingDriverStepProps = {
  onCancel: () => void;
  onFastMatch: () => void;
};

export const FindingDriverStep: React.FC<FindingDriverStepProps> = ({
  onCancel,
  onFastMatch,
}) => {
  const { selectedCab, fareAmount, driverSearchStep } = useTaxii();

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
              Finding your driver...
            </Typography>
            <Typography className={styles.subtitle}>
              Calculating nearest {selectedCab} drivers in Chandigarh
            </Typography>
          </Box>
        </Box>

        <Box className={styles.findingCard}>
          <Box className={styles.findingHeader}>
            <Box>
              <Typography className={styles.cabInfo}>{selectedCab} Cab</Typography>
              <Typography className={styles.estArrivalSub}>
                Est. arrival 3 min
              </Typography>
            </Box>
            <Typography className={styles.cabFare}>₹{fareAmount}</Typography>
          </Box>

          <Box className={styles.statusList}>
            <Box
              className={`${styles.statusItem} ${
                driverSearchStep >= 0 ? styles.statusDone : ""
              }`}
            >
              <CheckCircleIcon fontSize="small" />
              <Typography component="span">
                Scanning nearby drivers with distance algorithm...
              </Typography>
            </Box>

            <Box
              className={`${styles.statusItem} ${
                driverSearchStep >= 1
                  ? styles.statusDone
                  : driverSearchStep === 0
                  ? styles.statusCurrent
                  : ""
              }`}
            >
              {driverSearchStep >= 1 ? (
                <CheckCircleIcon fontSize="small" />
              ) : (
                <RadioButtonCheckedIcon fontSize="small" />
              )}
              <Typography component="span">Matching optimal captain</Typography>
            </Box>

            <Box
              className={`${styles.statusItem} ${
                driverSearchStep >= 2 ? styles.statusDone : ""
              }`}
            >
              {driverSearchStep >= 2 ? (
                <CheckCircleIcon fontSize="small" />
              ) : (
                <RadioButtonUncheckedIcon fontSize="small" />
              )}
              <Typography component="span">Generating secure ride OTP</Typography>
            </Box>
          </Box>
        </Box>
      </Box>

      <Box className={styles.dualBtnRow}>
        <Button
          type="button"
          className={styles.secondaryBtn}
          onClick={onCancel}
        >
          Cancel Ride
        </Button>
        <Button
          type="button"
          className={styles.primaryBtn}
          onClick={onFastMatch}
        >
          Fast Match
        </Button>
      </Box>
    </>
  );
};

export default FindingDriverStep;
