"use client";

import React, { useState } from "react";
import { Box, Typography, Button, CircularProgress } from "@mui/material";
import DirectionsCarFilledIcon from "@mui/icons-material/DirectionsCarFilled";
import PersonIcon from "@mui/icons-material/Person";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useTaxii } from "@/context/TaxiiContext";
import { AuthRole } from "../Login";
import {
  UserOnboardingFormData,
  DriverPersonalFormData,
  DriverVehicleFormData,
} from "./body.schema";
import { UserModal } from "../modals/UserModal";
import { DriverModal } from "../modals/DriverModal";
import styles from "./body.module.scss";

type Props = {
  role: AuthRole;
  setRole: (role: AuthRole) => void;
};

const HeaderBody: React.FC<Props> = ({ role, setRole }) => {
  const router = useRouter();
  const { setIsLoggedIn, setAppMode, updateRiderProfile, updateDriverProfile } = useTaxii();

  const isCaptain = role === "captain";

  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [activeModal, setActiveModal] = useState<"none" | "user_profile" | "driver_step1" | "driver_step2">("none");
  const [savedDriverPersonal, setSavedDriverPersonal] = useState<DriverPersonalFormData | null>(null);

  const googleMockUser = {
    email: isCaptain ? "captain.driver@gmail.com" : "rider.passenger@gmail.com",
    first_name: isCaptain ? "Amit" : "Rajneesh",
    last_name: isCaptain ? "Kumar" : "Sharma",
    avatar: "/amit-driver.jpg",
  };

  const handleGoogleSignInClick = () => {
    setIsAuthenticating(true);
    setTimeout(() => {
      setIsAuthenticating(false);
      if (isCaptain) {
        setActiveModal("driver_step1");
      } else {
        setActiveModal("user_profile");
      }
    }, 600);
  };

  const onUserSubmit = (data: UserOnboardingFormData) => {
    updateRiderProfile({
      first_name: data.first_name,
      last_name: data.last_name,
      phone: data.phone,
      gender: data.gender,
      dob: data.dob,
      avatar: data.image || googleMockUser.avatar,
      email: googleMockUser.email,
    });
    setIsLoggedIn(true);
    setAppMode("rider");
    setActiveModal("none");
    router.push("/dashboard");
  };

  const onDriverStep1Submit = (data: DriverPersonalFormData) => {
    setSavedDriverPersonal(data);
    setActiveModal("driver_step2");
  };

  const onDriverStep2Submit = (vehicleData: DriverVehicleFormData) => {
    const personal = savedDriverPersonal;
    if (!personal) return;

    updateDriverProfile({
      first_name: personal.first_name,
      last_name: personal.last_name,
      phone: personal.phone,
      gender: personal.gender,
      dob: personal.dob,
      avatar: personal.image || "/amit-driver.jpg",
      email: googleMockUser.email,
      vehicle: {
        model: vehicleData.model,
        plate_number: vehicleData.plate_number,
        color: vehicleData.color,
        license_number: vehicleData.license_number,
        license_expiration_date: vehicleData.license_expiration_date,
        insurance_number: vehicleData.insurance_number,
        insurance_expiration_date: vehicleData.insurance_expiration_date,
        car_image: vehicleData.car_image,
      },
    });
    setIsLoggedIn(true);
    setAppMode("driver");
    setActiveModal("none");
    router.push("/dashboard");
  };

  return (
    <Box className={styles.container}>
      <Box className={styles.splitCard}>
        <Box className={styles.heroBanner}>
          <Box className={styles.brandRow}>
            <Typography component="span" className={styles.brandName}>
              Rydo
            </Typography>
            <Typography component="span" className={styles.brandRole}>
              {isCaptain ? "Captain (Driver)" : "Rider (Passenger)"}
            </Typography>
          </Box>

          <Box className={styles.heroContent}>
            <Typography component="h1" className={styles.heroTitle}>
              {isCaptain
                ? "Drive with Rydo.\nEarn on your terms."
                : "Ride with Rydo.\nFast, safe & reliable."}
            </Typography>
            <Typography component="p" className={styles.heroSubtitle}>
              {isCaptain
                ? "Sign in with Google to manage your driver earnings, active trips, and vehicle fleet."
                : "Sign in with Google to instantly book cabs, track nearby drivers, and ride with ease."}
            </Typography>
          </Box>

          <Box className={styles.heroImageContainer}>
            <Image
              src="/driver-hero.jpg"
              alt="Rydo illustration"
              width={420}
              height={250}
              className={styles.heroImage}
              priority
            />
          </Box>
        </Box>

        <Box className={styles.formArea}>
          <Box className={styles.roleSelector}>
            <Button
              type="button"
              className={`${styles.roleBtn} ${!isCaptain ? styles.roleBtnActive : ""}`}
              onClick={() => setRole("user")}
            >
              <PersonIcon fontSize="small" />
              <span>Rider Portal</span>
            </Button>
            <Button
              type="button"
              className={`${styles.roleBtn} ${isCaptain ? styles.roleBtnActive : ""}`}
              onClick={() => setRole("captain")}
            >
              <DirectionsCarFilledIcon fontSize="small" />
              <span>Driver Portal</span>
            </Button>
          </Box>

          <Box className={styles.formHeader}>
            <Typography component="h2" className={styles.title}>
              {isCaptain ? "Sign in to Driver Portal" : "Sign in to Rider Portal"}
            </Typography>
            <Typography component="p" className={styles.subtitle}>
              {isCaptain
                ? "Sign in with your verified Google account to access your captain console."
                : "Sign in with your verified Google account to book rides across the city."}
            </Typography>
          </Box>

          <Button
            type="button"
            className={styles.googleBtnLarge}
            onClick={handleGoogleSignInClick}
            disabled={isAuthenticating}
          >
            {isAuthenticating ? (
              <CircularProgress size={20} color="inherit" />
            ) : (
              <Image
                src="/google.svg"
                alt="Google"
                width={20}
                height={20}
              />
            )}
            <Typography component="span" className={styles.googleBtnText}>
              {isAuthenticating
                ? "Connecting to Google..."
                : "Sign in with Google"}
            </Typography>
          </Button>

          <Box className={styles.trustRow}>
            <VerifiedUserIcon fontSize="small" className={styles.trustIcon} />
            <Typography component="span" variant="caption">
              Fast, secure 1-tap verification. No passwords required.
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Rider Onboarding Modal */}
      <UserModal
        isOpen={activeModal === "user_profile"}
        onClose={() => setActiveModal("none")}
        onSubmit={onUserSubmit}
        googleMockUser={googleMockUser}
        isLoading={isAuthenticating}
      />

      {/* Driver Onboarding Multi-step Modal */}
      <DriverModal
        isOpen={activeModal === "driver_step1" || activeModal === "driver_step2"}
        step={activeModal === "driver_step2" ? "driver_step2" : "driver_step1"}
        onClose={() => setActiveModal("none")}
        onStep1Submit={onDriverStep1Submit}
        onStep2Submit={onDriverStep2Submit}
        onBackToStep1={() => setActiveModal("driver_step1")}
        googleMockUser={googleMockUser}
        isLoading={isAuthenticating}
      />
    </Box>
  );
};

export default HeaderBody;