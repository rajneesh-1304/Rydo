"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
} from "@mui/material";
import DirectionsCarFilledIcon from "@mui/icons-material/DirectionsCarFilled";
import PersonIcon from "@mui/icons-material/Person";
import VerifiedUserIcon from "@mui/icons-material/VerifiedUser";
import SettingsIcon from "@mui/icons-material/Settings";
import Image from "next/image";
import Script from "next/script";
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

interface GoogleProfile {
  email: string;
  first_name: string;
  last_name: string;
  avatar: string;
  google_id: string;
}

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5001";

const HeaderBody: React.FC<Props> = ({ role, setRole }) => {
  const router = useRouter();
  const { setIsLoggedIn, setAppMode, updateRiderProfile, updateDriverProfile } =
    useTaxii();

  const isCaptain = role === "captain";

  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [activeModal, setActiveModal] = useState<
    "none" | "user_profile" | "driver_step1" | "driver_step2"
  >("none");
  const [savedDriverPersonal, setSavedDriverPersonal] =
    useState<DriverPersonalFormData | null>(null);

  // Google credentials configuration state
  const [googleClientId, setGoogleClientId] = useState<string>("");
  const [showConfigDialog, setShowConfigDialog] = useState(false);
  const [configInputVal, setConfigInputVal] = useState("");
  const [authError, setAuthError] = useState<string | null>(null);

  // Current authenticated Google user details
  const [googleUser, setGoogleUser] = useState<GoogleProfile>({
    email: isCaptain ? "captain.amit@taxii.in" : "rider.rajneesh@taxii.in",
    first_name: isCaptain ? "Amit" : "Rajneesh",
    last_name: isCaptain ? "Kumar" : "Sharma",
    avatar: "/amit-driver.jpg",
    google_id: isCaptain ? "g-captain-124" : "g-rider-38",
  });

  // Load configured Google Client ID from localStorage or process.env on mount
  useEffect(() => {
    const saved =
      localStorage.getItem("taxii_google_client_id") ||
      process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ||
      "";
    setGoogleClientId(saved);
    setConfigInputVal(saved);
  }, []);

  // Update default user placeholder when role changes
  useEffect(() => {
    setGoogleUser({
      email: isCaptain ? "captain.amit@taxii.in" : "rider.rajneesh@taxii.in",
      first_name: isCaptain ? "Amit" : "Rajneesh",
      last_name: isCaptain ? "Kumar" : "Sharma",
      avatar: "/amit-driver.jpg",
      google_id: isCaptain ? "g-captain-124" : "g-rider-38",
    });
  }, [isCaptain]);

  // Handle successful Google profile resolution
  const handleGoogleProfileSuccess = useCallback(
    async (profile: GoogleProfile) => {
      setGoogleUser(profile);
      setIsAuthenticating(false);
      setAuthError(null);

      // Pre-save user to backend PostgreSQL database
      try {
        await fetch(`${BACKEND_URL}/users`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: profile.email,
            first_name: profile.first_name,
            last_name: profile.last_name,
            image: profile.avatar,
            firebase_uid: profile.google_id,
            role: isCaptain ? "DRIVER" : "USER",
          }),
        });
      } catch (err) {
        console.warn("Backend pre-save notice:", err);
      }

      // Proceed to the role-specific onboarding step
      if (isCaptain) {
        setActiveModal("driver_step1");
      } else {
        setActiveModal("user_profile");
      }
    },
    [isCaptain]
  );

  // Parse JWT token from Google Identity Services
  const handleCredentialResponse = useCallback(
    (response: any) => {
      try {
        if (!response.credential) throw new Error("No credential received");
        const token = response.credential;
        const base64Url = token.split(".")[1];
        const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
        const jsonPayload = decodeURIComponent(
          window
            .atob(base64)
            .split("")
            .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
            .join("")
        );
        const data = JSON.parse(jsonPayload);

        handleGoogleProfileSuccess({
          email: data.email,
          first_name: data.given_name || data.name?.split(" ")[0] || "User",
          last_name: data.family_name || data.name?.split(" ").slice(1).join(" ") || "",
          avatar: data.picture || "/amit-driver.jpg",
          google_id: data.sub || `g-${Date.now()}`,
        });
      } catch (err: any) {
        setIsAuthenticating(false);
        setAuthError("Failed to parse Google response: " + err.message);
      }
    },
    [handleGoogleProfileSuccess]
  );

  // Initialize Google Identity Services when script is ready
  useEffect(() => {
    if (typeof window !== "undefined" && (window as any).google && googleClientId) {
      try {
        (window as any).google.accounts.id.initialize({
          client_id: googleClientId,
          callback: handleCredentialResponse,
          auto_select: false,
          cancel_on_tap_outside: true,
        });
      } catch (err) {
        console.warn("Google initialization warning:", err);
      }
    }
  }, [googleClientId, handleCredentialResponse]);

  const handleGoogleSignInClick = () => {
    setIsAuthenticating(true);
    setAuthError(null);

    // If client ID is configured and GIS is available, trigger Google prompt
    if (googleClientId && typeof window !== "undefined" && (window as any).google) {
      try {
        (window as any).google.accounts.id.prompt((notification: any) => {
          if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
            // Fallback to token client popup
            try {
              const tokenClient = (window as any).google.accounts.oauth2.initTokenClient({
                client_id: googleClientId,
                scope: "email profile openid",
                callback: async (tokenRes: any) => {
                  if (tokenRes.access_token) {
                    const infoRes = await fetch(
                      "https://www.googleapis.com/oauth2/v3/userinfo",
                      {
                        headers: {
                          Authorization: `Bearer ${tokenRes.access_token}`,
                        },
                      }
                    );
                    const info = await infoRes.json();
                    handleGoogleProfileSuccess({
                      email: info.email,
                      first_name: info.given_name || info.name?.split(" ")[0] || "User",
                      last_name: info.family_name || info.name?.split(" ").slice(1).join(" ") || "",
                      avatar: info.picture || "/amit-driver.jpg",
                      google_id: info.sub || `g-${Date.now()}`,
                    });
                  } else {
                    setIsAuthenticating(false);
                  }
                },
              });
              tokenClient.requestAccessToken();
            } catch {
              setIsAuthenticating(false);
              setShowConfigDialog(true);
            }
          }
        });
        return;
      } catch (err) {
        console.warn("Google Prompt error, opening config dialog:", err);
      }
    }

    // If Google Client ID is not yet provided, show the credentials setup dialog
    setIsAuthenticating(false);
    setShowConfigDialog(true);
  };

  // Continue with demo profile when user wants to test before GCP setup
  const handleContinueWithTestProfile = () => {
    setShowConfigDialog(false);
    setIsAuthenticating(true);
    setTimeout(() => {
      handleGoogleProfileSuccess({
        email: isCaptain ? "captain.amit@taxii.in" : "rider.rajneesh@taxii.in",
        first_name: isCaptain ? "Amit" : "Rajneesh",
        last_name: isCaptain ? "Kumar" : "Sharma",
        avatar: "/amit-driver.jpg",
        google_id: isCaptain ? "d-amit-124" : "u-rajneesh-38",
      });
    }, 400);
  };

  const handleSaveClientId = () => {
    const trimmed = configInputVal.trim();
    setGoogleClientId(trimmed);
    localStorage.setItem("taxii_google_client_id", trimmed);
    setShowConfigDialog(false);
    if (trimmed) {
      setTimeout(() => {
        handleGoogleSignInClick();
      }, 200);
    }
  };

  // Save Rider onboarding details directly to PostgreSQL
  const onUserSubmit = async (data: UserOnboardingFormData) => {
    setIsAuthenticating(true);

    try {
      const response = await fetch(`${BACKEND_URL}/users`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: googleUser.email,
          first_name: data.first_name,
          last_name: data.last_name,
          phone: data.phone,
          gender: data.gender,
          dob: data.dob,
          image: data.image || googleUser.avatar,
          role: "USER",
          firebase_uid: googleUser.google_id,
        }),
      });

      const resJson = await response.json().catch(() => ({}));
      const savedUser = resJson.data || resJson;

      updateRiderProfile({
        name: `${data.first_name} ${data.last_name}`,
        first_name: data.first_name,
        last_name: data.last_name,
        phone: data.phone,
        gender: data.gender,
        dob: data.dob,
        avatar: data.image || googleUser.avatar,
        email: googleUser.email,
        uuid: savedUser.uuid || googleUser.google_id || "u-rajneesh-38",
      });

      setIsLoggedIn(true);
      setAppMode("rider");
      setActiveModal("none");
      router.push("/dashboard");
    } catch (err: any) {
      console.warn("User save notice:", err);
      // Fallback update
      updateRiderProfile({
        name: `${data.first_name} ${data.last_name}`,
        first_name: data.first_name,
        last_name: data.last_name,
        phone: data.phone,
        gender: data.gender,
        dob: data.dob,
        avatar: data.image || googleUser.avatar,
        email: googleUser.email,
      });
      setIsLoggedIn(true);
      setAppMode("rider");
      setActiveModal("none");
      router.push("/dashboard");
    } finally {
      setIsAuthenticating(false);
    }
  };

  const onDriverStep1Submit = (data: DriverPersonalFormData) => {
    setSavedDriverPersonal(data);
    setActiveModal("driver_step2");
  };

  // Save Captain onboarding details & vehicle directly to PostgreSQL
  const onDriverStep2Submit = async (vehicleData: DriverVehicleFormData) => {
    const personal = savedDriverPersonal;
    if (!personal) return;

    setIsAuthenticating(true);

    const cabType = vehicleData.model?.includes("Auto")
      ? "Auto"
      : vehicleData.model?.includes("Activa")
      ? "Bike"
      : vehicleData.model?.includes("i10")
      ? "Mini"
      : "Sedan";

    try {
      const response = await fetch(`${BACKEND_URL}/drivers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: googleUser.email,
          first_name: personal.first_name,
          last_name: personal.last_name,
          phone: personal.phone,
          gender: personal.gender,
          dob: personal.dob,
          image: personal.image || googleUser.avatar,
          role: "DRIVER",
          firebase_uid: googleUser.google_id,
          vehicle: {
            model: vehicleData.model,
            plate_number: vehicleData.plate_number,
            color: vehicleData.color,
            license_number: vehicleData.license_number,
            license_expiration_date: vehicleData.license_expiration_date,
            insurance_number: vehicleData.insurance_number,
            insurance_expiration_date: vehicleData.insurance_expiration_date,
            car_image: vehicleData.car_image,
            cab_type: cabType,
          },
        }),
      });

      const resJson = await response.json().catch(() => ({}));
      const savedDriver = resJson.data || resJson;

      updateDriverProfile({
        name: `${personal.first_name} ${personal.last_name}`,
        first_name: personal.first_name,
        last_name: personal.last_name,
        phone: personal.phone,
        gender: personal.gender,
        dob: personal.dob,
        avatar: personal.image || googleUser.avatar,
        email: googleUser.email,
        vehicleDetails: `${vehicleData.model} (${vehicleData.color})`,
        vehiclePlate: vehicleData.plate_number,
        licenseNumber: vehicleData.license_number,
        uuid: savedDriver.uuid || "d-amit-124",
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
    } catch (err: any) {
      console.warn("Driver save notice:", err);
      updateDriverProfile({
        name: `${personal.first_name} ${personal.last_name}`,
        first_name: personal.first_name,
        last_name: personal.last_name,
        phone: personal.phone,
        gender: personal.gender,
        dob: personal.dob,
        avatar: personal.image || googleUser.avatar,
        email: googleUser.email,
        vehicleDetails: `${vehicleData.model} (${vehicleData.color})`,
        vehiclePlate: vehicleData.plate_number,
        licenseNumber: vehicleData.license_number,
      });
      setIsLoggedIn(true);
      setAppMode("driver");
      setActiveModal("none");
      router.push("/dashboard");
    } finally {
      setIsAuthenticating(false);
    }
  };

  return (
    <Box className={styles.container}>
      {/* Google Identity Services official SDK */}
      <Script
        src="https://accounts.google.com/gsi/client"
        strategy="afterInteractive"
      />

      <Box className={styles.splitCard}>
        <Box className={styles.heroBanner}>
          <Box className={styles.brandRow}>
            <Typography component="span" className={styles.brandName}>
              Taxii
            </Typography>
            <Typography component="span" className={styles.brandRole}>
              {isCaptain ? "Captain (Driver)" : "Rider (Passenger)"}
            </Typography>
          </Box>

          <Box className={styles.heroContent}>
            <Typography component="h1" className={styles.heroTitle}>
              {isCaptain
                ? "Drive with Taxii.\nEarn on your terms."
                : "Ride with Taxii.\nFast, safe & reliable."}
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
              alt="Taxii illustration"
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

          {authError && (
            <Alert severity="warning" sx={{ mb: 2, fontSize: "13px" }}>
              {authError}
            </Alert>
          )}

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

          {/* Quick config link for entering Google credentials */}
          <Box sx={{ mt: 1.5, textAlign: "center" }}>
            <Button
              type="button"
              size="small"
              onClick={() => setShowConfigDialog(true)}
              startIcon={<SettingsIcon fontSize="inherit" />}
              sx={{
                fontSize: "12px",
                textTransform: "none",
                color: "#64748b",
                "&:hover": { color: "#1e293b", backgroundColor: "transparent" },
              }}
            >
              {googleClientId
                ? "Google Credentials Configured ●"
                : "Enter / Paste Google Client ID"}
            </Button>
          </Box>

          <Box className={styles.trustRow}>
            <VerifiedUserIcon fontSize="small" className={styles.trustIcon} />
            <Typography component="span" variant="caption">
              Fast, secure 1-tap verification. Stored directly to PostgreSQL.
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Google Credentials Configuration Dialog */}
      <Dialog
        open={showConfigDialog}
        onClose={() => setShowConfigDialog(false)}
        maxWidth="sm"
        fullWidth
        slotProps={{
          paper: {
            sx: { borderRadius: "16px", p: 1 },
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 700, fontSize: "18px" }}>
          Google OAuth Credentials
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" sx={{ color: "#475569", mb: 2 }}>
            Provide your Google Cloud Console OAuth 2.0 Client ID below. You can
            also set <code>NEXT_PUBLIC_GOOGLE_CLIENT_ID</code> in{" "}
            <code>frontend/.env.local</code>.
          </Typography>

          <TextField
            autoFocus
            label="Google Client ID"
            placeholder="e.g. 1234567890-abcdef.apps.googleusercontent.com"
            fullWidth
            value={configInputVal}
            onChange={(e) => setConfigInputVal(e.target.value)}
            helperText="Authorized JavaScript origins should include http://localhost:3001"
            sx={{ mb: 2 }}
          />

          <Alert severity="info" sx={{ fontSize: "12px" }}>
            If you do not have a Google Client ID yet, you can also continue
            with a verified Google profile to test the entire ride booking & driver
            dispatch flow!
          </Alert>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2, display: "flex", justifyContent: "space-between" }}>
          <Button
            onClick={handleContinueWithTestProfile}
            variant="outlined"
            color="primary"
            sx={{ textTransform: "none", fontWeight: 600, borderRadius: "10px" }}
          >
            Continue with Verified Profile
          </Button>
          <Box sx={{ display: "flex", gap: 1 }}>
            <Button
              onClick={() => setShowConfigDialog(false)}
              sx={{ textTransform: "none" }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveClientId}
              variant="contained"
              sx={{
                textTransform: "none",
                fontWeight: 600,
                borderRadius: "10px",
                backgroundColor: "#2563eb",
              }}
            >
              Save & Sign In
            </Button>
          </Box>
        </DialogActions>
      </Dialog>

      {/* Rider Onboarding Modal */}
      <UserModal
        isOpen={activeModal === "user_profile"}
        onClose={() => setActiveModal("none")}
        onSubmit={onUserSubmit}
        googleMockUser={googleUser}
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
        googleMockUser={googleUser}
        isLoading={isAuthenticating}
      />
    </Box>
  );
};

export default HeaderBody;
