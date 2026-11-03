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
import styles from "./DriverExperience.module.scss";

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

  // Coordinates for Chandigarh driver
  const driverLocation = { lat: 30.7333, lng: 76.7794 };
  const targetLocation =
    driverTripState === "in_progress"
      ? incomingRideDetails.dropoffCoords
      : incomingRideDetails.pickupCoords;

  return (
    <Box className={styles.pageContainer}>
      <Box className={styles.mainGrid}>
        <Box className={styles.bookingCard}>
          <div>
            <Box className={styles.cardHeader}>
              <div className={styles.headerRow}>
                <div>
                  <Typography className={styles.title}>
                    Captain {driverProfile.name.split(" ")[0]}
                  </Typography>
                  <Typography className={styles.subtitle}>
                    {driverProfile.vehicleDetails} • {driverProfile.vehiclePlate}
                  </Typography>
                </div>

                <div
                  className={`${styles.statusPill} ${
                    isDriverOnline ? styles.statusPillOnline : styles.statusPillOffline
                  }`}
                >
                  <span
                    className={`${styles.statusLabel} ${
                      isDriverOnline ? styles.statusLabelOnline : styles.statusLabelOffline
                    }`}
                  >
                    {isDriverOnline ? "Online" : "Offline"}
                  </span>
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
                </div>
              </div>
            </Box>

            <div className={styles.tabBar}>
              <button
                type="button"
                className={`${styles.tabBtn} ${
                  activeTab === "dashboard" ? styles.tabBtnActive : ""
                }`}
                onClick={() => setActiveTab("dashboard")}
              >
                Drive Dashboard
              </button>
              <button
                type="button"
                className={`${styles.tabBtn} ${
                  activeTab === "earnings" ? styles.tabBtnActive : ""
                }`}
                onClick={() => setActiveTab("earnings")}
              >
                Earnings & Stats
              </button>
            </div>

            {activeTab === "dashboard" && (
              <>
                <div className={styles.statsRibbon}>
                  <div className={styles.statCol}>
                    <span className={styles.statLabel}>Today&apos;s Earnings</span>
                    <span className={styles.statValue}>₹{driverTodayEarnings}</span>
                  </div>
                  <div className={`${styles.statCol} ${styles.statColBorder}`}>
                    <span className={styles.statLabel}>Trips Done</span>
                    <span className={styles.statValue}>{driverTripsCompleted}</span>
                  </div>
                  <div className={styles.statCol}>
                    <span className={styles.statLabel}>Acceptance</span>
                    <span className={`${styles.statValue} ${styles.statValueSuccess}`}>
                      {driverProfile.acceptanceRate}%
                    </span>
                  </div>
                </div>

                {(driverTripState === "heading_to_pickup" || driverTripState === "at_pickup") && (
                  <div className={styles.pickupStateCard}>
                    <div className={styles.stateCardHeader}>
                      <div className={styles.stateTitleWrap}>
                        <NavigationIcon sx={{ color: "#2563eb", fontSize: 20 }} />
                        <span className={styles.stateTitleBlue}>
                          Visiting Passenger Location
                        </span>
                      </div>
                      <span className={styles.stateFareBlue}>
                        ₹{incomingRideDetails.fare}
                      </span>
                    </div>

                    <div className={styles.passengerCard}>
                      <div>
                        <div className={styles.passengerName}>
                          {incomingRideDetails.passengerName}
                        </div>
                        <div className={styles.passengerPickupDist}>
                          Pickup: {incomingRideDetails.pickup} (1.2 km away)
                        </div>
                      </div>

                      <div className={styles.actionBtnGroup}>
                        <button
                          type="button"
                          className={styles.roundActionBtn}
                          onClick={() => alert(`Calling passenger: ${incomingRideDetails.passengerPhone}`)}
                          title="Call passenger"
                        >
                          <PhoneIcon sx={{ color: "#0f172a", fontSize: 16 }} />
                        </button>
                        <button
                          type="button"
                          className={styles.roundActionBtn}
                          onClick={() => setShowDriverChat(true)}
                          title="Chat with passenger"
                        >
                          <ChatIcon sx={{ color: "#0f172a", fontSize: 16 }} />
                        </button>
                      </div>
                    </div>

                    <div className={styles.otpVerifyBox}>
                      <div className={styles.otpVerifyTitle}>
                        <KeyIcon fontSize="small" />
                        <span>Enter Passenger 4-Digit OTP</span>
                      </div>
                      <div className={styles.otpVerifySubtitle}>
                        Ask passenger for the OTP shown on their screen to start the drive
                      </div>

                      <input
                        type="text"
                        maxLength={4}
                        placeholder="e.g. 4829"
                        value={otpInput}
                        onChange={(e) => {
                          setOtpInput(e.target.value);
                          setOtpError("");
                        }}
                        className={styles.otpInput}
                      />

                      {otpError && (
                        <div className={styles.otpError}>
                          {otpError}
                        </div>
                      )}

                      <button
                        type="button"
                        className={styles.btnVerifyTrip}
                        onClick={handleVerifyAndStartTrip}
                      >
                        <CheckCircleOutlinedIcon fontSize="small" />
                        Verify OTP & Start Drive
                      </button>
                    </div>

                    <button
                      type="button"
                      className={styles.btnDeclineSecondary}
                      onClick={() => setShowDriverCancelModal(true)}
                    >
                      Cancel / Decline Trip
                    </button>
                  </div>
                )}

                {driverTripState === "in_progress" && (
                  <div className={styles.inProgressCard}>
                    <div className={styles.stateCardHeader}>
                      <div className={styles.stateTitleWrap}>
                        <NavigationIcon sx={{ color: "#059669", fontSize: 20 }} />
                        <span className={styles.stateTitleGreen}>
                          Drive In Progress (OTP Verified)
                        </span>
                      </div>
                      <span className={styles.stateFareGreen}>
                        ₹{incomingRideDetails.fare}
                      </span>
                    </div>

                    <div className={styles.destinationBox}>
                      <div className={styles.destinationHeader}>
                        <LocationOnIcon fontSize="small" /> Heading to Destination:
                      </div>
                      <div className={styles.destinationText}>
                        {incomingRideDetails.dropoff}
                      </div>
                      <div className={styles.destinationPassenger}>
                        Passenger: {incomingRideDetails.passengerName}
                      </div>
                    </div>

                    <button
                      type="button"
                      className={styles.btnCompleteTrip}
                      onClick={finishDriverTrip}
                    >
                      <CheckCircleOutlinedIcon fontSize="small" />
                      Complete Ride • Collect ₹{incomingRideDetails.fare}
                    </button>
                  </div>
                )}

                {driverTripState === "idle" && hasIncomingRideRequest && isDriverOnline && (
                  <div className={styles.incomingCard}>
                    <div className={styles.incomingHeader}>
                      <div className={styles.incomingTitleWrap}>
                        <BoltIcon sx={{ color: "#f59e0b" }} />
                        <span className={styles.incomingTitle}>
                          Incoming Ride Request
                        </span>
                      </div>
                      <div className={styles.incomingFareWrap}>
                        <div className={styles.incomingFare}>
                          ₹{incomingRideDetails.fare}
                        </div>
                        <div className={styles.incomingPaymentTag}>
                          CASH / UPI
                        </div>
                      </div>
                    </div>

                    <div className={styles.incomingTripMeta}>
                      {incomingRideDetails.distance} trip • ~{incomingRideDetails.duration} • Passenger: {incomingRideDetails.passengerName} (★ {incomingRideDetails.passengerRating})
                    </div>

                    <div className={styles.routePointsBox}>
                      <div className={styles.pointRow}>
                        <span className={styles.pickupDotLabel}>● Pickup:</span>
                        <span className={styles.pointText}>{incomingRideDetails.pickup}</span>
                      </div>
                      <div className={styles.pointRow}>
                        <span className={styles.dropoffDotLabel}>● Drop:</span>
                        <span className={styles.pointText}>{incomingRideDetails.dropoff}</span>
                      </div>
                    </div>

                    <div className={styles.actionGrid}>
                      <button
                        type="button"
                        className={styles.btnDecline}
                        onClick={rejectIncomingRequest}
                      >
                        <CancelOutlinedIcon fontSize="small" />
                        Decline
                      </button>

                      <button
                        type="button"
                        className={styles.btnAccept}
                        onClick={acceptIncomingRequest}
                      >
                        <CheckCircleOutlinedIcon fontSize="small" />
                        Accept
                      </button>
                    </div>
                  </div>
                )}

                {driverTripState === "idle" && !hasIncomingRideRequest && (
                  <div className={styles.idleBox}>
                    <div className={styles.idleTitle}>
                      {isDriverOnline ? "GPS Radar Active • Waiting for nearby ride requests..." : "You are currently Offline"}
                    </div>
                    <div className={styles.idleSubtitle}>
                      {isDriverOnline
                        ? "You will be alerted instantly when passengers nearby request a ride."
                        : "Turn on the Online switch at top right to start receiving trips."}
                    </div>

                    {isDriverOnline && (
                      <button
                        type="button"
                        className={styles.btnSimulate}
                        onClick={() => setHasIncomingRideRequest(true)}
                      >
                        ⚡ Simulate Incoming Request (₹220)
                      </button>
                    )}
                  </div>
                )}
              </>
            )}

            {activeTab === "earnings" && (
              <div className={styles.earningsContainer}>
                <div className={styles.breakdownCard}>
                  <div className={styles.breakdownTitle}>
                    Today&apos;s Earnings Breakdown
                  </div>
                  <div className={styles.breakdownRow}>
                    <span>Trip Fares ({driverTripsCompleted} completed)</span>
                    <span className={styles.breakdownRowBold}>₹{driverTodayEarnings - 170}</span>
                  </div>
                  <div className={styles.breakdownRow}>
                    <span>Peak Surge Incentives</span>
                    <span className={styles.breakdownRowBold}>₹170</span>
                  </div>
                  <div className={styles.breakdownTotalRow}>
                    <span>Total Credited Today</span>
                    <span className={styles.breakdownTotalVal}>₹{driverTodayEarnings}</span>
                  </div>
                </div>

                <div className={styles.payoutAccountCard}>
                  <div className={styles.payoutTitle}>
                    Payout Account Details
                  </div>
                  <div>Bank: HDFC Bank (Savings)</div>
                  <div>Account: **** **** 4812 (Verified)</div>
                  <div className={styles.payoutActiveBadge}>
                    ✓ Daily automatic payouts active
                  </div>
                </div>
              </div>
            )}
          </div>
        </Box>

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

      {showDriverChat && (
        <div
          className={styles.modalOverlay}
          onClick={() => setShowDriverChat(false)}
        >
          <div
            className={styles.chatModalCard}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className={styles.chatTitle}>
              Chat with {incomingRideDetails.passengerName}
            </h3>
            <div className={styles.chatMsgBubble}>
              <strong>Passenger:</strong> Hi Captain, I am waiting right outside the main gate with OTP ready!
            </div>
            <input
              type="text"
              placeholder="Reply to passenger..."
              className={styles.chatInput}
            />
            <button
              type="button"
              className={styles.btnPrimary}
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
