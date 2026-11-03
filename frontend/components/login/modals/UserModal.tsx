"use client";

import React, { useState } from "react";
import { Box, Typography, Button, Skeleton } from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import ErrorOutlinedIcon from "@mui/icons-material/ErrorOutlined";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { userOnboardingSchema, UserOnboardingFormData } from "../body/body.schema";
import styles from "./modals.module.scss";

type UserModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: UserOnboardingFormData) => void;
  googleMockUser: {
    email: string;
    first_name: string;
    last_name: string;
    avatar: string;
  };
  isLoading?: boolean;
};

export const UserModal: React.FC<UserModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  googleMockUser,
  isLoading = false,
}) => {
  const [avatarLoaded, setAvatarLoaded] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<UserOnboardingFormData>({
    resolver: zodResolver(userOnboardingSchema),
    defaultValues: {
      first_name: googleMockUser.first_name,
      last_name: googleMockUser.last_name,
      gender: "Male",
      phone: "+91 98765 12340",
      dob: "1998-05-15",
      image: googleMockUser.avatar,
    },
  });

  if (!isOpen) return null;

  return (
    <Box className={styles.modalBackdrop}>
      <Box className={styles.modalCard}>
        <Box className={styles.modalHeader}>
          <Box className={styles.modalTitleWrap}>
            <Box component="span" className={styles.modalStepBadge}>
              Rider Profile Setup
            </Box>
            <Typography component="h2" className={styles.modalTitle}>
              About You
            </Typography>
            <Typography className={styles.modalSubtitle}>
              Please confirm your personal details to complete your Rydo registration.
            </Typography>
          </Box>
        </Box>

        <Box className={styles.progressBarWrap}>
          <Box className={`${styles.progressBarFill} ${styles.progressBarFillFull}`} />
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
              src={googleMockUser.avatar}
              alt="Profile Avatar"
              width={60}
              height={60}
              className={styles.avatarCircle}
              onLoad={() => setAvatarLoaded(true)}
            />
          </Box>
          <Box className={styles.avatarText}>
            <Typography className={styles.avatarTitle}>Profile Picture</Typography>
            <Typography className={styles.avatarHint}>
              Imported from your Google account
            </Typography>
          </Box>
        </Box>

        <Box component="form" onSubmit={handleSubmit(onSubmit)} className={styles.formGrid}>
          <Box className={styles.formRow}>
            <Box className={styles.field}>
              <Typography component="label" className={styles.label}>
                First Name *
              </Typography>
              <input
                type="text"
                className={`${styles.inputField} ${errors.first_name ? styles.inputFieldError : ""}`}
                placeholder="Enter first name"
                {...register("first_name")}
              />
              {errors.first_name && (
                <Typography component="span" className={styles.errorText}>
                  <ErrorOutlinedIcon fontSize="inherit" />
                  {errors.first_name.message}
                </Typography>
              )}
            </Box>

            <Box className={styles.field}>
              <Typography component="label" className={styles.label}>
                Last Name *
              </Typography>
              <input
                type="text"
                className={`${styles.inputField} ${errors.last_name ? styles.inputFieldError : ""}`}
                placeholder="Enter last name"
                {...register("last_name")}
              />
              {errors.last_name && (
                <Typography component="span" className={styles.errorText}>
                  <ErrorOutlinedIcon fontSize="inherit" />
                  {errors.last_name.message}
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
                className={`${styles.selectField} ${errors.gender ? styles.selectFieldError : ""}`}
                {...register("gender")}
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
              {errors.gender && (
                <Typography component="span" className={styles.errorText}>
                  <ErrorOutlinedIcon fontSize="inherit" />
                  {errors.gender.message}
                </Typography>
              )}
            </Box>

            <Box className={styles.field}>
              <Typography component="label" className={styles.label}>
                Date of Birth *
              </Typography>
              <input
                type="date"
                className={`${styles.inputField} ${errors.dob ? styles.inputFieldError : ""}`}
                {...register("dob")}
              />
              {errors.dob && (
                <Typography component="span" className={styles.errorText}>
                  <ErrorOutlinedIcon fontSize="inherit" />
                  {errors.dob.message}
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
                className={`${styles.inputField} ${errors.phone ? styles.inputFieldError : ""}`}
                placeholder="+91 98765 12340"
                {...register("phone")}
              />
              {errors.phone && (
                <Typography component="span" className={styles.errorText}>
                  <ErrorOutlinedIcon fontSize="inherit" />
                  {errors.phone.message}
                </Typography>
              )}
            </Box>

            <Box className={styles.field}>
              <Typography component="label" className={styles.label}>
                Profile Picture URL
              </Typography>
              <input
                type="text"
                className={`${styles.inputField} ${errors.image ? styles.inputFieldError : ""}`}
                placeholder="/avatar.png or image URL"
                {...register("image")}
              />
              {errors.image && (
                <Typography component="span" className={styles.errorText}>
                  <ErrorOutlinedIcon fontSize="inherit" />
                  {errors.image.message}
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
              disabled={isSubmitting || isLoading}
            >
              <span>Save & Enter Rydo</span>
              <ArrowForwardIcon fontSize="small" />
            </Button>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default UserModal;
