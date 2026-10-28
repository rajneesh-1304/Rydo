"use client";

import React, { useState } from "react";
import { Box, Typography, Switch } from "@mui/material";
import PhoneIcon from "@mui/icons-material/Phone";
import ChatIcon from "@mui/icons-material/Chat";
import NavigationIcon from "@mui/icons-material/Navigation";
import CheckCircleOutlinedIcon from "@mui/icons-material/CheckCircleOutlined";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";
import BoltIcon from "@mui/icons-material/Bolt";
import KeyIcon from "@mui/icons-material/Key";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";
import MapComponent from "../dashboard/map/Map";
import { useTaxii } from "@/context/TaxiiContext";
import styles from "../rider/RiderExperience.module.scss";

export const DriverExperience: React.FC = () => {
  const {
    driverProfile,
    isDriverOnline,
    setIsDriverOnline,
    driverTodayEarnings,
    driverTripsCompleted,
    hasIncomingRideRequest,
    setHasIncomingRideRequest,
    incomingRideDetails,
    driverTripState,
    setDriverTripState,
    acceptIncomingRequest,
    rejectIncomingRequest,
    startDriverTripWithOtp,
    finishDriverTrip,
    otpError,
    setOtpError,
  } = useTaxii();

  const [activeTab, setActiveTab] = useState<"dashboard" | "earnings">("dashboard");
  const [showDriverChat, setShowDriverChat] = useState(false);
  const [showDriverCancelModal, setShowDriverCancelModal] = useState(false);
  const [otpInput, setOtpInput] = useState("");

  const handleVerifyAndStartTrip = () => {
    if (!otpInput || otpInput.trim().length !== 4) {
      setOtpError("Please enter the 4-digit code provided by the passenger.");
      return;
    }
    const success = startDriverTripWithOtp(otpInput.trim());
    if (success) {
      setOtpInput("");
    }
  };

  const handleConfirmDriverCancel = () => {
    setShowDriverCancelModal(false);
    setDriverTripState("idle");
  };

  // Determine active coordinates to show on driver's map
  const driverLocation = { lat: 30.7333, lng: 76.7794 };
  const targetLocation =
    driverTripState === "in_progress"
      ? incomingRideDetails.dropoffCoords
      : incomingRideDetails.pickupCoords;

  return (
    <Box className={styles.pageContainer}>
      <Box className={styles.mainGrid}>
        {/* Left Card: Driver Dashboard */}
        <Box className={styles.bookingCard}>
          <div>
            {/* Header with Driver info & Online Switch */}
            <Box className={styles.cardHeader}>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <Typography className={styles.title}>
                    Captain {driverProfile.name.split(" ")[0]}
                  </Typography>
                  <Typography className={styles.subtitle}>
                    {driverProfile.vehicleDetails} • {driverProfile.vehiclePlate}
                  </Typography>
                </div>

                {/* Online Toggle with clear active/inactive state */}
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    backgroundColor: isDriverOnline ? "#ecfdf5" : "#f1f5f9",
                    padding: "4px 10px",
                    borderRadius: "20px",
                    border: `1px solid ${isDriverOnline ? "#a7f3d0" : "#cbd5e1"}`,
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: "12px",
                      fontWeight: 700,
                      color: isDriverOnline ? "#059669" : "#64748b",
                    }}
                  >
                    {isDriverOnline ? "Online" : "Offline"}
                  </Typography>
                  <Switch
                    checked={isDriverOnline}
                    onChange={(e) => {
                      setIsDriverOnline(e.target.checked);
                      if (!e.target.checked) {
                        setHasIncomingRideRequest(false);
                      }
                    }}
                    color="success"
                    size="small"
                  />
                </Box>
              </Box>
            </Box>

            {/* Quick tabs: Drive Dashboard | Earnings */}
            <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
              <button
                type="button"
                className={styles.secondaryBtn}
                style={{
                  height: "34px",
                  fontSize: "13px",
                  fontWeight: 600,
                  backgroundColor: activeTab === "dashboard" ? "#000000" : "#ffffff",
                  color: activeTab === "dashboard" ? "#ffffff" : "#000000",
                  borderColor: activeTab === "dashboard" ? "#000000" : "#e2e8f0",
                }}
                onClick={() => setActiveTab("dashboard")}
              >
                Drive Dashboard
              </button>
              <button
                type="button"
                className={styles.secondaryBtn}
                style={{
                  height: "34px",
                  fontSize: "13px",
                  fontWeight: 600,
                  backgroundColor: activeTab === "earnings" ? "#000000" : "#ffffff",
                  color: activeTab === "earnings" ? "#ffffff" : "#000000",
                  borderColor: activeTab === "earnings" ? "#000000" : "#e2e8f0",
                }}
                onClick={() => setActiveTab("earnings")}
              >
                Earnings & Stats
              </button>
            </Box>

            {activeTab === "dashboard" && (
              <>
                {/* Stats ribbon */}
                <Box
                  sx={{
                    background: "#f8fafc",
                    border: "1px solid #e2e8f0",
                    borderRadius: "12px",
                    p: 1.5,
                    mb: 2,
                    display: "grid",
                    gridTemplateColumns: "repeat(3, 1fr)",
                    textAlign: "center",
                  }}
                >
                  <Box>
                    <Typography sx={{ fontSize: "11px", color: "#64748b", fontWeight: 600 }}>
                      Today&apos;s Earnings
                    </Typography>
                    <Typography sx={{ fontSize: "20px", fontWeight: 800, color: "#0f172a" }}>
                      ₹{driverTodayEarnings}
                    </Typography>
                  </Box>
                  <Box sx={{ borderLeft: "1px solid #e2e8f0", borderRight: "1px solid #e2e8f0" }}>
                    <Typography sx={{ fontSize: "11px", color: "#64748b", fontWeight: 600 }}>
                      Trips Done
                    </Typography>
                    <Typography sx={{ fontSize: "20px", fontWeight: 800, color: "#0f172a" }}>
                      {driverTripsCompleted}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography sx={{ fontSize: "11px", color: "#64748b", fontWeight: 600 }}>
                      Acceptance
                    </Typography>
                    <Typography sx={{ fontSize: "20px", fontWeight: 800, color: "#10b981" }}>
                      {driverProfile.acceptanceRate}%
                    </Typography>
                  </Box>
                </Box>

                {/* TRIP STATE 1: ACCEPTED -> NAVIGATING TO USER LOCATION + OTP VERIFICATION */}
                {(driverTripState === "heading_to_pickup" || driverTripState === "at_pickup") && (
                  <Box
                    sx={{
                      border: "2px solid #2563eb",
                      borderRadius: "14px",
                      p: 2,
                      mb: 2,
                      backgroundColor: "#eff6ff",
                      boxShadow: "0 4px 16px rgba(37, 99, 235, 0.12)",
                    }}
                  >
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1.5 }}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <NavigationIcon sx={{ color: "#2563eb", fontSize: 20 }} />
                        <Typography sx={{ fontSize: "14px", fontWeight: 800, color: "#1e3a8a" }}>
                          Visiting Passenger Location
                        </Typography>
                      </Box>
                      <Typography sx={{ fontSize: "18px", fontWeight: 900, color: "#1e3a8a" }}>
                        ₹{incomingRideDetails.fare}
                      </Typography>
                    </Box>

                    {/* Passenger card with call/chat */}
                    <Box
                      sx={{
                        backgroundColor: "#ffffff",
                        border: "1px solid #bfdbfe",
                        borderRadius: "10px",
                        p: 1.5,
                        mb: 1.5,
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <div>
                        <Typography sx={{ fontSize: "13px", fontWeight: 700, color: "#0f172a" }}>
                          {incomingRideDetails.passengerName}
                        </Typography>
                        <Typography sx={{ fontSize: "11px", color: "#64748b" }}>
                          Pickup: {incomingRideDetails.pickup} (1.2 km away)
                        </Typography>
                      </div>

                      <Box sx={{ display: "flex", gap: 1 }}>
                        <button
                          type="button"
                          onClick={() => alert(`Calling passenger: ${incomingRideDetails.passengerPhone}`)}
                          style={{
                            width: "32px",
                            height: "32px",
                            borderRadius: "50%",
                            border: "1px solid #cbd5e1",
                            background: "#ffffff",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <PhoneIcon fontSize="small" sx={{ color: "#0f172a", fontSize: 16 }} />
                        </button>
                        <button
                          type="button"
                          onClick={() => setShowDriverChat(true)}
                          style={{
                            width: "32px",
                            height: "32px",
                            borderRadius: "50%",
                            border: "1px solid #cbd5e1",
                            background: "#ffffff",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <ChatIcon fontSize="small" sx={{ color: "#0f172a", fontSize: 16 }} />
                        </button>
                      </Box>
                    </Box>

                    {/* REQUIRED OTP INPUT: Driver MUST enter passenger OTP to start trip */}
                    <Box
                      sx={{
                        backgroundColor: "#ffffff",
                        border: "1.5px solid #2563eb",
                        borderRadius: "12px",
                        p: 2,
                        mb: 1.5,
                        textAlign: "center",
                      }}
                    >
                      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 0.8, color: "#1e3a8a", fontWeight: 800, fontSize: "13px", mb: 0.5 }}>
                        <KeyIcon fontSize="small" />
                        <span>Enter Passenger 4-Digit OTP</span>
                      </Box>
                      <Typography sx={{ fontSize: "11px", color: "#64748b", mb: 1.5 }}>
                        Ask passenger for the OTP shown on their screen to start the drive
                      </Typography>

                      <input
                        type="text"
                        maxLength={4}
                        placeholder="e.g. 4829"
                        value={otpInput}
                        onChange={(e) => {
                          setOtpInput(e.target.value);
                          setOtpError("");
                        }}
                        style={{
                          width: "160px",
                          textAlign: "center",
                          fontSize: "24px",
                          fontWeight: 800,
                          letterSpacing: "8px",
                          padding: "8px 12px",
                          borderRadius: "8px",
                          border: "2px solid #cbd5e1",
                          outline: "none",
                          fontFamily: "monospace",
                          marginBottom: "10px",
                        }}
                      />

                      {otpError && (
                        <div style={{ color: "#ef4444", fontSize: "12px", fontWeight: 600, marginBottom: "8px" }}>
                          {otpError}
                        </div>
                      )}

                      <button
                        type="button"
                        className={styles.primaryBtn}
                        style={{ backgroundColor: "#2563eb" }}
                        onClick={handleVerifyAndStartTrip}
                      >
                        <CheckCircleOutlinedIcon fontSize="small" />
                        Verify OTP & Start Drive
                      </button>
                    </Box>

                    <button
                      type="button"
                      className={styles.secondaryBtn}
                      style={{ fontSize: "12px", height: "36px" }}
                      onClick={() => setShowDriverCancelModal(true)}
                    >
                      Cancel / Decline Trip
                    </button>
                  </Box>
                )}

                {/* TRIP STATE 2: ON TRIP (DRIVING TO DESTINATION AFTER OTP VERIFIED) */}
                {driverTripState === "in_progress" && (
                  <Box
                    sx={{
                      border: "2px solid #10b981",
                      borderRadius: "14px",
                      p: 2,
                      mb: 2,
                      backgroundColor: "#f0fdf4",
                      boxShadow: "0 4px 16px rgba(16, 185, 129, 0.12)",
                    }}
                  >
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1.5 }}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <NavigationIcon sx={{ color: "#059669", fontSize: 20 }} />
                        <Typography sx={{ fontSize: "14px", fontWeight: 800, color: "#065f46" }}>
                          Drive In Progress (OTP Verified)
                        </Typography>
                      </Box>
                      <Typography sx={{ fontSize: "18px", fontWeight: 800, color: "#065f46" }}>
                        ₹{incomingRideDetails.fare}
                      </Typography>
                    </Box>

                    <Box sx={{ fontSize: "12px", color: "#334155", mb: 2, backgroundColor: "#ffffff", p: 1.5, borderRadius: "10px", border: "1px solid #bbf7d0" }}>
                      <div style={{ color: "#059669", fontWeight: 700, marginBottom: "2px", display: "flex", alignItems: "center", gap: "4px" }}>
                        <LocationOnIcon fontSize="small" /> Heading to Destination:
                      </div>
                      <div style={{ fontWeight: 800, fontSize: "13px" }}>
                        {incomingRideDetails.dropoff}
                      </div>
                      <div style={{ color: "#64748b", marginTop: "4px" }}>
                        Passenger: {incomingRideDetails.passengerName}
                      </div>
                    </Box>

                    <button
                      type="button"
                      className={styles.primaryBtn}
                      style={{ backgroundColor: "#059669" }}
                      onClick={finishDriverTrip}
                    >
                      <CheckCircleOutlinedIcon fontSize="small" />
                      Complete Ride • Collect ₹{incomingRideDetails.fare}
                    </button>
                  </Box>
                )}

                {/* TRIP STATE 3: INCOMING RIDE REQUEST WITH MONEY & ACCEPT/DECLINE */}
                {driverTripState === "idle" && hasIncomingRideRequest && isDriverOnline && (
                  <Box
                    sx={{
                      border: "2px solid #000000",
                      borderRadius: "14px",
                      p: 2,
                      mb: 2,
                      backgroundColor: "#ffffff",
                      boxShadow: "0 6px 24px rgba(0, 0, 0, 0.12)",
                    }}
                  >
                    {/* Header with big money amount */}
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1.5 }}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 0.8 }}>
                        <BoltIcon sx={{ color: "#f59e0b" }} />
                        <Typography sx={{ fontSize: "14px", fontWeight: 800, color: "#0f172a" }}>
                          Incoming Ride Request
                        </Typography>
                      </Box>
                      <Box sx={{ textAlign: "right" }}>
                        <Typography sx={{ fontSize: "24px", fontWeight: 900, color: "#000000" }}>
                          ₹{incomingRideDetails.fare}
                        </Typography>
                        <Typography sx={{ fontSize: "10px", color: "#10b981", fontWeight: 700 }}>
                          CASH / UPI
                        </Typography>
                      </Box>
                    </Box>

                    <Typography sx={{ fontSize: "12px", color: "#64748b", mb: 1.5 }}>
                      {incomingRideDetails.distance} trip • ~{incomingRideDetails.duration} • Passenger: {incomingRideDetails.passengerName} (★ {incomingRideDetails.passengerRating})
                    </Typography>

                    {/* Pickup & Drop Points */}
                    <Box
                      sx={{
                        backgroundColor: "#f8fafc",
                        border: "1px solid #e2e8f0",
                        borderRadius: "10px",
                        p: 1.5,
                        mb: 2,
                        display: "flex",
                        flexDirection: "column",
                        gap: 1,
                        fontSize: "12px",
                      }}
                    >
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <span style={{ color: "#10b981", fontWeight: 800 }}>● Pickup:</span>
                        <span style={{ fontWeight: 600, color: "#1e293b" }}>{incomingRideDetails.pickup}</span>
                      </Box>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <span style={{ color: "#ef4444", fontWeight: 800 }}>● Drop:</span>
                        <span style={{ fontWeight: 600, color: "#1e293b" }}>{incomingRideDetails.dropoff}</span>
                      </Box>
                    </Box>

                    {/* Large Accept & Decline Buttons */}
                    <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1.5 }}>
                      <button
                        type="button"
                        className={styles.secondaryBtn}
                        style={{
                          borderColor: "#ef4444",
                          color: "#ef4444",
                          fontWeight: 700,
                        }}
                        onClick={rejectIncomingRequest}
                      >
                        <CancelOutlinedIcon fontSize="small" />
                        Decline
                      </button>

                      <button
                        type="button"
                        className={styles.primaryBtn}
                        style={{
                          backgroundColor: "#000000",
                          fontWeight: 700,
                        }}
                        onClick={acceptIncomingRequest}
                      >
                        <CheckCircleOutlinedIcon fontSize="small" />
                        Accept
                      </button>
                    </Box>
                  </Box>
                )}

                {/* TRIP STATE 4: WAITING FOR RIDES */}
                {driverTripState === "idle" && !hasIncomingRideRequest && (
                  <Box
                    sx={{
                      textAlign: "center",
                      py: 3,
                      px: 2,
                      backgroundColor: "#f8fafc",
                      border: "1.5px dashed #cbd5e1",
                      borderRadius: "12px",
                      mb: 2,
                    }}
                  >
                    <Typography sx={{ fontSize: "14px", fontWeight: 700, color: "#1e293b", mb: 0.5 }}>
                      {isDriverOnline ? "GPS Radar Active • Waiting for nearby ride requests..." : "You are currently Offline"}
                    </Typography>
                    <Typography sx={{ fontSize: "12px", color: "#64748b", mb: 2 }}>
                      {isDriverOnline
                        ? "You will be alerted instantly when passengers nearby request a ride."
                        : "Turn on the Online switch at top right to start receiving trips."}
                    </Typography>

                    {isDriverOnline && (
                      <button
                        type="button"
                        className={styles.secondaryBtn}
                        onClick={() => setHasIncomingRideRequest(true)}
                      >
                        ⚡ Simulate Incoming Request (₹220)
                      </button>
                    )}
                  </Box>
                )}
              </>
            )}

            {/* Earnings Tab */}
            {activeTab === "earnings" && (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
                <Box
                  sx={{
                    background: "#f8fafc",
                    border: "1px solid #e2e8f0",
                    borderRadius: "12px",
                    p: 2,
                  }}
                >
                  <Typography sx={{ fontSize: "14px", fontWeight: 700, color: "#0f172a", mb: 1.5 }}>
                    Today&apos;s Earnings Breakdown
                  </Typography>
                  <Box sx={{ display: "flex", justifyContent: "space-between", fontSize: "13px", color: "#475569", py: 0.5 }}>
                    <span>Trip Fares ({driverTripsCompleted} completed)</span>
                    <span style={{ fontWeight: 600 }}>₹{driverTodayEarnings - 170}</span>
                  </Box>
                  <Box sx={{ display: "flex", justifyContent: "space-between", fontSize: "13px", color: "#475569", py: 0.5 }}>
                    <span>Peak Surge Incentives</span>
                    <span style={{ fontWeight: 600 }}>₹170</span>
                  </Box>
                  <Box sx={{ borderTop: "1px solid #e2e8f0", mt: 1.5, pt: 1.5, display: "flex", justifyContent: "space-between", fontSize: "15px", fontWeight: 800, color: "#0f172a" }}>
                    <span>Total Credited Today</span>
                    <span style={{ color: "#10b981" }}>₹{driverTodayEarnings}</span>
                  </Box>
                </Box>

                <Box
                  sx={{
                    background: "#ffffff",
                    border: "1px solid #e2e8f0",
                    borderRadius: "12px",
                    p: 2,
                    fontSize: "12px",
                    color: "#475569",
                  }}
                >
                  <Typography sx={{ fontSize: "13px", fontWeight: 700, color: "#0f172a", mb: 1 }}>
                    Payout Account Details
                  </Typography>
                  <div>Bank: HDFC Bank (Savings)</div>
                  <div>Account: **** **** 4812 (Verified)</div>
                  <div style={{ color: "#10b981", fontWeight: 600, marginTop: "6px" }}>
                    ✓ Daily automatic payouts active
                  </div>
                </Box>
              </Box>
            )}
          </div>
        </Box>

        {/* Right Card: Google-like Interactive Navigation Map */}
        <Box className={styles.mapCard}>
          <MapComponent
            initialCenter={driverLocation}
            zoom={14}
            showSearchOverlay={false}
            showControls={true}
            pickupCoords={driverLocation}
            dropoffCoords={driverTripState !== "idle" ? targetLocation : null}
          />
        </Box>
      </Box>

      {/* Driver Cancel Confirmation Modal */}
      {showDriverCancelModal && (
        <div
          className={styles.modalOverlay}
          onClick={() => setShowDriverCancelModal(false)}
        >
          <div
            className={styles.cancelModalCard}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.cancelIconWrap}>
              <WarningAmberRoundedIcon fontSize="medium" />
            </div>

            <div>
              <Typography className={styles.cancelTitle}>
                Decline Passenger Trip?
              </Typography>
              <Typography className={styles.cancelDesc}>
                Are you sure you want to cancel heading to passenger {incomingRideDetails.passengerName}? Frequent cancellations may lower your driver acceptance score.
              </Typography>
            </div>

            <div className={styles.modalBtnRow}>
              <button
                type="button"
                className={styles.keepRideBtn}
                onClick={() => setShowDriverCancelModal(false)}
              >
                No, Keep Trip
              </button>
              <button
                type="button"
                className={styles.confirmCancelBtn}
                onClick={handleConfirmDriverCancel}
              >
                Yes, Decline Trip
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Driver Passenger Chat Modal */}
      {showDriverChat && (
        <div
          className={styles.modalOverlay}
          onClick={() => setShowDriverChat(false)}
        >
          <div
            className={styles.cancelModalCard}
            style={{ maxWidth: "380px" }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ margin: "0 0 10px 0", fontSize: "16px", fontWeight: 700 }}>
              Chat with {incomingRideDetails.passengerName}
            </h3>
            <div
              style={{
                backgroundColor: "#f8fafc",
                padding: "10px 12px",
                borderRadius: "8px",
                marginBottom: "12px",
                fontSize: "13px",
                color: "#334155",
              }}
            >
              <strong>Passenger:</strong> Hi Captain, I am waiting right outside the main gate with OTP ready!
            </div>
            <input
              type="text"
              placeholder="Reply to passenger..."
              style={{
                width: "100%",
                padding: "10px 12px",
                borderRadius: "8px",
                border: "1px solid #e2e8f0",
                marginBottom: "14px",
                fontSize: "14px",
                outline: "none",
                boxSizing: "border-box",
              }}
            />
            <button
              type="button"
              className={styles.primaryBtn}
              onClick={() => setShowDriverChat(false)}
            >
              Send Reply
            </button>
          </div>
        </div>
      )}
    </Box>
  );
};

export default DriverExperience;
