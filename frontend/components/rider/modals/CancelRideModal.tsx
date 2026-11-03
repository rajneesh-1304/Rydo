"use client";

import React from "react";
import { Box, Typography, Button } from "@mui/material";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";
import styles from "../RiderExperience.module.scss";

type CancelRideModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  selectedReason: string;
  onSelectReason: (reason: string) => void;
  reasons?: string[];
};

const DEFAULT_REASONS = [
  "Change of plans",
  "Driver is taking too long",
  "Wrong pickup or drop location",
  "Booked by mistake",
];

export const CancelRideModal: React.FC<CancelRideModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  selectedReason,
  onSelectReason,
  reasons = DEFAULT_REASONS,
}) => {
  if (!isOpen) return null;

  return (
    <Box className={styles.modalOverlay} onClick={onClose}>
      <Box className={styles.cancelModalCard} onClick={(e) => e.stopPropagation()}>
        <Box className={styles.cancelIconWrap}>
          <WarningAmberRoundedIcon fontSize="medium" />
        </Box>

        <Box>
          <Typography component="h3" className={styles.cancelTitle}>
            Cancel your ride?
          </Typography>
          <Typography className={styles.cancelDesc}>
            Are you sure you want to cancel this booking? Please let us know the reason:
          </Typography>
        </Box>

        <Box className={styles.cancelReasonsList}>
          {reasons.map((reason) => (
            <Box
              key={reason}
              className={`${styles.reasonOption} ${
                selectedReason === reason ? styles.activeReason : ""
              }`}
              onClick={() => onSelectReason(reason)}
            >
              <Box
                component="span"
                className={`${styles.reasonRadioCircle} ${
                  selectedReason === reason ? styles.reasonRadioCircleSelected : ""
                }`}
              />
              <Typography component="span">{reason}</Typography>
            </Box>
          ))}
        </Box>

        <Box className={styles.modalBtnRow}>
          <Button type="button" className={styles.keepRideBtn} onClick={onClose}>
            No, Keep Ride
          </Button>
          <Button type="button" className={styles.confirmCancelBtn} onClick={onConfirm}>
            Yes, Cancel Ride
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default CancelRideModal;
