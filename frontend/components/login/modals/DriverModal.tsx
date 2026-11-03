"use client";

import React, { useState } from "react";
import { Box, Typography, Button, Skeleton } from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import ErrorOutlinedIcon from "@mui/icons-material/ErrorOutlined";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  driverPersonalSchema,
  driverVehicleSchema,
  DriverPersonalFormData,
  DriverVehicleFormData,
} from "../body/body.schema";
import styles from "./modals.module.scss";

type DriverModalProps = {
  isOpen: boolean;
  step: "driver_step1" | "driver_step2";
  onClose: () => void;
  onStep1Submit: (data: DriverPersonalFormData) => void;
  onStep2Submit: (data: DriverVehicleFormData) => void;
  onBackToStep1: () => void;
  googleMockUser: {
    email: string;
    first_name: string;
    last_name: string;
    avatar: string;
  };
  isLoading?: boolean;
};

export const DriverModal: React.FC<DriverModalProps> = ({
  isOpen,
  step,
  onClose,
  onStep1Submit,
  onStep2Submit,
  onBackToStep1,
  googleMockUser,
  isLoading = false,
}) => {
  const [avatarLoaded, setAvatarLoaded] = useState(false);

  const personalForm = useForm<DriverPersonalFormData>({
    resolver: zodResolver(driverPersonalSchema),
    defaultValues: {
      first_name: "Amit",
      last_name: "Kumar",
      gender: "Male",
      phone: "+91 98123 45678",
      dob: "1992-08-20",
      image: "/amit-driver.jpg",
    },
  });

  const vehicleForm = useForm<DriverVehicleFormData>({
    resolver: zodResolver(driverVehicleSchema),
    defaultValues: {
      model: "Maruti Swift Dzire",
      plate_number: "CH01-AB-1234",
      color: "White",
      license_number: "DL-0420190012345",
      license_expiration_date: "2029-12-31",
      insurance_number: "INS-9921827410",
      insurance_expiration_date: "2027-05-15",
      car_image: "/car.png",
    },
  });

  if (!isOpen) return null;

  return (
    <Box className={styles.modalBackdrop}>
      <Box className={styles.modalCard}>
        {step === "driver_step1" ? (
          <>
            <Box className={styles.modalHeader}>
              <Box className={styles.modalTitleWrap}>
                <Box component="span" className={styles.modalStepBadge}>
                  Step 1 of 2: Driver Details
                </Box>
                <Typography component="h2" className={styles.modalTitle}>
                  Personal Information
                </Typography>
                <Typography className={styles.modalSubtitle}>
                  Please fill in your legal name and contact details as they appear on your driving license.
                </Typography>
              </Box>
            </Box>

            <Box className={styles.progressBarWrap}>
              <Box className={`${styles.progressBarFill} ${styles.progressBarFillHalf}`} />
            </Box>

            <Box className={styles.googleVerifiedBadge}>
              <CheckCircleIcon fontSize="inherit" className={styles.verifiedCheck} />
              <Typography component="span" variant="body2">
                Google Account: {googleMockUser.email}
              </Typography>
            </Box>

            <Box className={styles.avatarSection}>
              <Box className={styles.avatarWrapper}>
                {(!avatarLoaded || isLoading) && (
                  <Skeleton
                    variant="circular"
                    width={60}
                    height={60}
                    className={styles.avatarSkeleton}
                  />
                )}
                <Image
                  src="/amit-driver.jpg"
                  alt="Driver Avatar"
                  width={60}
                  height={60}
                  className={styles.avatarCircle}
                  onLoad={() => setAvatarLoaded(true)}
                />
              </Box>
              <Box className={styles.avatarText}>
                <Typography className={styles.avatarTitle}>Captain Profile Photo</Typography>
                <Typography className={styles.avatarHint}>
                  Visible to passengers when you accept trips
                </Typography>
              </Box>
            </Box>

            <Box
              component="form"
              onSubmit={personalForm.handleSubmit(onStep1Submit)}
              className={styles.formGrid}
            >
              <Box className={styles.formRow}>
                <Box className={styles.field}>
                  <Typography component="label" className={styles.label}>
                    First Name *
                  </Typography>
                  <input
                    type="text"
                    className={`${styles.inputField} ${personalForm.formState.errors.first_name ? styles.inputFieldError : ""}`}
                    placeholder="Enter first name"
                    {...personalForm.register("first_name")}
                  />
                  {personalForm.formState.errors.first_name && (
                    <Typography component="span" className={styles.errorText}>
                      <ErrorOutlinedIcon fontSize="inherit" />
                      {personalForm.formState.errors.first_name.message}
                    </Typography>
                  )}
                </Box>

                <Box className={styles.field}>
                  <Typography component="label" className={styles.label}>
                    Last Name *
                  </Typography>
                  <input
                    type="text"
                    className={`${styles.inputField} ${personalForm.formState.errors.last_name ? styles.inputFieldError : ""}`}
                    placeholder="Enter last name"
                    {...personalForm.register("last_name")}
                  />
                  {personalForm.formState.errors.last_name && (
                    <Typography component="span" className={styles.errorText}>
                      <ErrorOutlinedIcon fontSize="inherit" />
                      {personalForm.formState.errors.last_name.message}
                    </Typography>
                  )}
                </Box>
              </Box>

              <Box className={styles.formRow}>
                <Box className={styles.field}>
                  <Typography component="label" className={styles.label}>
                    Gender *
                  </Typography>
                  <select
                    className={`${styles.selectField} ${personalForm.formState.errors.gender ? styles.selectFieldError : ""}`}
                    {...personalForm.register("gender")}
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                  {personalForm.formState.errors.gender && (
                    <Typography component="span" className={styles.errorText}>
                      <ErrorOutlinedIcon fontSize="inherit" />
                      {personalForm.formState.errors.gender.message}
                    </Typography>
                  )}
                </Box>

                <Box className={styles.field}>
                  <Typography component="label" className={styles.label}>
                    Date of Birth *
                  </Typography>
                  <input
                    type="date"
                    className={`${styles.inputField} ${personalForm.formState.errors.dob ? styles.inputFieldError : ""}`}
                    {...personalForm.register("dob")}
                  />
                  {personalForm.formState.errors.dob && (
                    <Typography component="span" className={styles.errorText}>
                      <ErrorOutlinedIcon fontSize="inherit" />
                      {personalForm.formState.errors.dob.message}
                    </Typography>
                  )}
                </Box>
              </Box>

              <Box className={styles.formRow}>
                <Box className={styles.field}>
                  <Typography component="label" className={styles.label}>
                    Mobile Phone *
                  </Typography>
                  <input
                    type="text"
                    className={`${styles.inputField} ${personalForm.formState.errors.phone ? styles.inputFieldError : ""}`}
                    placeholder="+91 98123 45678"
                    {...personalForm.register("phone")}
                  />
                  {personalForm.formState.errors.phone && (
                    <Typography component="span" className={styles.errorText}>
                      <ErrorOutlinedIcon fontSize="inherit" />
                      {personalForm.formState.errors.phone.message}
                    </Typography>
                  )}
                </Box>

                <Box className={styles.field}>
                  <Typography component="label" className={styles.label}>
                    Profile Photo URL
                  </Typography>
                  <input
                    type="text"
                    className={`${styles.inputField} ${personalForm.formState.errors.image ? styles.inputFieldError : ""}`}
                    placeholder="/amit-driver.jpg or image URL"
                    {...personalForm.register("image")}
                  />
                  {personalForm.formState.errors.image && (
                    <Typography component="span" className={styles.errorText}>
                      <ErrorOutlinedIcon fontSize="inherit" />
                      {personalForm.formState.errors.image.message}
                    </Typography>
                  )}
                </Box>
              </Box>

              <Box className={styles.modalActions}>
                <Button type="button" className={styles.backBtn} onClick={onClose}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className={styles.submitBtn}
                  disabled={personalForm.formState.isSubmitting || isLoading}
                >
                  <span>Next: Vehicle Details</span>
                  <ArrowForwardIcon fontSize="small" />
                </Button>
              </Box>
            </Box>
          </>
        ) : (
          <>
            <Box className={styles.modalHeader}>
              <Box className={styles.modalTitleWrap}>
                <Box component="span" className={styles.modalStepBadge}>
                  Step 2 of 2: Vehicle & Documents
                </Box>
                <Typography component="h2" className={styles.modalTitle}>
                  Vehicle Information
                </Typography>
                <Typography className={styles.modalSubtitle}>
                  Enter the vehicle information and valid documentation for verification.
                </Typography>
              </Box>
            </Box>

            <Box className={styles.progressBarWrap}>
              <Box className={`${styles.progressBarFill} ${styles.progressBarFillFull}`} />
            </Box>

            <Box
              component="form"
              onSubmit={vehicleForm.handleSubmit(onStep2Submit)}
              className={styles.formGrid}
            >
              <Box className={styles.formRow}>
                <Box className={styles.field}>
                  <Typography component="label" className={styles.label}>
                    Vehicle Model *
                  </Typography>
                  <input
                    type="text"
                    className={`${styles.inputField} ${vehicleForm.formState.errors.model ? styles.inputFieldError : ""}`}
                    placeholder="e.g. Maruti Swift Dzire"
                    {...vehicleForm.register("model")}
                  />
                  {vehicleForm.formState.errors.model && (
                    <Typography component="span" className={styles.errorText}>
                      <ErrorOutlinedIcon fontSize="inherit" />
                      {vehicleForm.formState.errors.model.message}
                    </Typography>
                  )}
                </Box>

                <Box className={styles.field}>
                  <Typography component="label" className={styles.label}>
                    Vehicle Color *
                  </Typography>
                  <input
                    type="text"
                    className={`${styles.inputField} ${vehicleForm.formState.errors.color ? styles.inputFieldError : ""}`}
                    placeholder="e.g. White"
                    {...vehicleForm.register("color")}
                  />
                  {vehicleForm.formState.errors.color && (
                    <Typography component="span" className={styles.errorText}>
                      <ErrorOutlinedIcon fontSize="inherit" />
                      {vehicleForm.formState.errors.color.message}
                    </Typography>
                  )}
                </Box>
              </Box>

              <Box className={styles.field}>
                <Typography component="label" className={styles.label}>
                  Plate Number *
                </Typography>
                <input
                  type="text"
                  className={`${styles.inputField} ${vehicleForm.formState.errors.plate_number ? styles.inputFieldError : ""}`}
                  placeholder="e.g. CH01-AB-1234"
                  {...vehicleForm.register("plate_number")}
                />
                {vehicleForm.formState.errors.plate_number && (
                  <Typography component="span" className={styles.errorText}>
                    <ErrorOutlinedIcon fontSize="inherit" />
                    {vehicleForm.formState.errors.plate_number.message}
                  </Typography>
                )}
              </Box>

              <Box className={styles.formRow}>
                <Box className={styles.field}>
                  <Typography component="label" className={styles.label}>
                    Driving License Number *
                  </Typography>
                  <input
                    type="text"
                    className={`${styles.inputField} ${vehicleForm.formState.errors.license_number ? styles.inputFieldError : ""}`}
                    placeholder="e.g. DL-0420190012345"
                    {...vehicleForm.register("license_number")}
                  />
                  {vehicleForm.formState.errors.license_number && (
                    <Typography component="span" className={styles.errorText}>
                      <ErrorOutlinedIcon fontSize="inherit" />
                      {vehicleForm.formState.errors.license_number.message}
                    </Typography>
                  )}
                </Box>

                <Box className={styles.field}>
                  <Typography component="label" className={styles.label}>
                    License Expiry Date *
                  </Typography>
                  <input
                    type="date"
                    className={`${styles.inputField} ${vehicleForm.formState.errors.license_expiration_date ? styles.inputFieldError : ""}`}
                    {...vehicleForm.register("license_expiration_date")}
                  />
                  {vehicleForm.formState.errors.license_expiration_date && (
                    <Typography component="span" className={styles.errorText}>
                      <ErrorOutlinedIcon fontSize="inherit" />
                      {vehicleForm.formState.errors.license_expiration_date.message}
                    </Typography>
                  )}
                </Box>
              </Box>

              <Box className={styles.formRow}>
                <Box className={styles.field}>
                  <Typography component="label" className={styles.label}>
                    Insurance Policy Number *
                  </Typography>
                  <input
                    type="text"
                    className={`${styles.inputField} ${vehicleForm.formState.errors.insurance_number ? styles.inputFieldError : ""}`}
                    placeholder="e.g. INS-9876543210"
                    {...vehicleForm.register("insurance_number")}
                  />
                  {vehicleForm.formState.errors.insurance_number && (
                    <Typography component="span" className={styles.errorText}>
                      <ErrorOutlinedIcon fontSize="inherit" />
                      {vehicleForm.formState.errors.insurance_number.message}
                    </Typography>
                  )}
                </Box>

                <Box className={styles.field}>
                  <Typography component="label" className={styles.label}>
                    Insurance Expiry Date *
                  </Typography>
                  <input
                    type="date"
                    className={`${styles.inputField} ${vehicleForm.formState.errors.insurance_expiration_date ? styles.inputFieldError : ""}`}
                    {...vehicleForm.register("insurance_expiration_date")}
                  />
                  {vehicleForm.formState.errors.insurance_expiration_date && (
                    <Typography component="span" className={styles.errorText}>
                      <ErrorOutlinedIcon fontSize="inherit" />
                      {vehicleForm.formState.errors.insurance_expiration_date.message}
                    </Typography>
                  )}
                </Box>
              </Box>

              <Box className={styles.field}>
                <Typography component="label" className={styles.label}>
                  Vehicle Type Preset
                </Typography>
                <Box className={styles.carImagePreviewRow}>
                  <Button
                    type="button"
                    className={`${styles.carOptionBtn} ${styles.carOptionBtnActive}`}
                    onClick={() => {
                      vehicleForm.setValue("model", "Maruti Swift Dzire");
                      vehicleForm.setValue("car_image", "/car.png");
                    }}
                  >
                    🚗 Sedan / Dzire
                  </Button>
                  <Button
                    type="button"
                    className={styles.carOptionBtn}
                    onClick={() => {
                      vehicleForm.setValue("model", "Hyundai Grand i10");
                      vehicleForm.setValue("car_image", "/car.png");
                    }}
                  >
                    🚙 Mini / Hatchback
                  </Button>
                  <Button
                    type="button"
                    className={styles.carOptionBtn}
                    onClick={() => {
                      vehicleForm.setValue("model", "Bajaj RE Auto");
                      vehicleForm.setValue("car_image", "/car.png");
                    }}
                  >
                    🛺 Auto Rickshaw
                  </Button>
                </Box>
              </Box>

              <Box className={styles.field}>
                <Typography component="label" className={styles.label}>
                  Vehicle Image URL (optional)
                </Typography>
                <input
                  type="text"
                  className={styles.inputField}
                  placeholder="/car.png or image URL"
                  {...vehicleForm.register("car_image")}
                />
              </Box>

              <Box className={styles.modalActions}>
                <Button type="button" className={styles.backBtn} onClick={onBackToStep1}>
                  Back
                </Button>
                <Button
                  type="submit"
                  className={styles.submitBtn}
                  disabled={vehicleForm.formState.isSubmitting || isLoading}
                >
                  <span>Complete Setup & Go Online</span>
                  <ArrowForwardIcon fontSize="small" />
                </Button>
              </Box>
            </Box>
          </>
        )}
      </Box>
    </Box>
  );
};

export default DriverModal;
