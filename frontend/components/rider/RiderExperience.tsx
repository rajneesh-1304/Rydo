"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Box, Typography } from "@mui/material";
import PhoneIcon from "@mui/icons-material/Phone";
import ChatIcon from "@mui/icons-material/Chat";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import RadioButtonCheckedIcon from "@mui/icons-material/RadioButtonChecked";
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";
import SwapVertIcon from "@mui/icons-material/SwapVert";
import ShareIcon from "@mui/icons-material/Share";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SearchIcon from "@mui/icons-material/Search";
import EditLocationAltIcon from "@mui/icons-material/EditLocationAlt";
import MyLocationIcon from "@mui/icons-material/MyLocation";
import TouchAppIcon from "@mui/icons-material/TouchApp";
import KeyIcon from "@mui/icons-material/Key";
import NavigationIcon from "@mui/icons-material/Navigation";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";
import {
  BikeIcon,
  AutoIcon,
  MiniIcon,
  SedanIcon,
} from "../common/VehicleIcons";
import MapComponent from "../dashboard/map/Map";
import { reverseGeocodeLocation, searchLocation } from "../dashboard/map/services/geocodingService";
import { Coordinates } from "../dashboard/map/types";
import { useTaxii } from "@/context/TaxiiContext";
import styles from "./RiderExperience.module.scss";

export const RiderExperience: React.FC = () => {
  const {
    riderStep,
    setRiderStep,
    selectedCab,
    setSelectedCab,
    pickupLocation,
    setPickupLocation,
    dropoffLocation,
    setDropoffLocation,
    fareAmount,
    ridesSearched,
    setRidesSearched,
    pickupCoords,
    setPickupCoords,
    dropoffCoords,
    setDropoffCoords,
    mapPinMode,
    setMapPinMode,
    nearbyDrivers,
    recalculateNearbyDrivers,
    currentRideOtp,
    driverInfo,
    driverSearchStep,
    startFindingDriver,
    cancelRide,
    completeRideManually,
    resetToNewBooking,
    swapLocations,
  } = useTaxii();

  const [rating, setRating] = useState(5);
  const [showChatModal, setShowChatModal] = useState(false);
  const [showShareAlert, setShowShareAlert] = useState(false);

  // Cancellation Modal state
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedCancelReason, setSelectedCancelReason] = useState("Change of plans");

  const cancelReasons = [
    "Change of plans",
    "Driver is taking too long",
    "Wrong pickup or drop location",
    "Booked by mistake",
  ];

  const cabOptions: Array<{
    id: "Bike" | "Auto" | "Mini" | "Sedan";
    name: string;
    price: number;
    eta: string;
    icon: React.ReactNode;
  }> = [
    {
      id: "Bike",
      name: "Bike",
      price: 80,
      eta: "3 min away",
      icon: <BikeIcon size={26} />,
    },
    {
      id: "Auto",
      name: "Auto",
      price: 120,
      eta: "4 min away",
      icon: <AutoIcon size={26} />,
    },
    {
      id: "Mini",
      name: "Mini",
      price: 180,
      eta: "6 min away",
      icon: <MiniIcon size={28} />,
    },
    {
      id: "Sedan",
      name: "Sedan",
      price: 250,
      eta: "8 min away",
      icon: <SedanIcon size={30} />,
    },
  ];

  const quickPlaces = [
    { name: "Sector 22", coords: { lat: 30.7333, lng: 76.7794 } },
    { name: "Sector 17", coords: { lat: 30.7414, lng: 76.7681 } },
    { name: "Elante Mall", coords: { lat: 30.7055, lng: 76.8013 } },
    { name: "Railway Station", coords: { lat: 30.7022, lng: 76.8228 } },
    { name: "ISBT 43", coords: { lat: 30.7188, lng: 76.7533 } },
  ];

  const canSearch =
    pickupLocation.trim().length > 0 && dropoffLocation.trim().length > 0;

  // Handle map click to set pickup or dropoff pin
  const handleMapClick = async (coords: Coordinates) => {
    if (mapPinMode === "pickup") {
      setPickupCoords(coords);
      recalculateNearbyDrivers(coords);
      const address = await reverseGeocodeLocation(coords);
      setPickupLocation(address || `${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)}`);
      setRidesSearched(false);
      setMapPinMode("dropoff");
    } else {
      setDropoffCoords(coords);
      const address = await reverseGeocodeLocation(coords);
      setDropoffLocation(address || `${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)}`);
      setRidesSearched(false);
    }
  };

  const handleSelectQuickPlace = (place: { name: string; coords: Coordinates }) => {
    if (mapPinMode === "pickup") {
      setPickupLocation(`${place.name}, Chandigarh`);
      setPickupCoords(place.coords);
      recalculateNearbyDrivers(place.coords);
      setMapPinMode("dropoff");
    } else {
      setDropoffLocation(`${place.name}, Chandigarh`);
      setDropoffCoords(place.coords);
    }
    setRidesSearched(false);
  };

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const coords: Coordinates = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        };
        setPickupCoords(coords);
        recalculateNearbyDrivers(coords);
        const address = await reverseGeocodeLocation(coords);
        setPickupLocation(address || "Current Location");
        setRidesSearched(false);
      },
      () => {
        const fallback = { lat: 30.7333, lng: 76.7794 };
        setPickupCoords(fallback);
        setPickupLocation("Sector 22, Chandigarh");
      }
    );
  };

  const handleSearchCabs = async () => {
    if (!canSearch) return;

    if (pickupLocation && !pickupCoords) {
      const p = await searchLocation(pickupLocation);
      if (p) setPickupCoords(p);
    }
    if (dropoffLocation && !dropoffCoords) {
      const d = await searchLocation(dropoffLocation);
      if (d) setDropoffCoords(d);
    }

    setRidesSearched(true);
  };

  const handleConfirmCancelRide = () => {
    setShowCancelModal(false);
    cancelRide();
  };

  return (
    <Box className={styles.pageContainer}>
      <Box className={styles.mainGrid}>
        {/* Left Card: Rider Booking Form & State */}
        <Box className={styles.bookingCard}>
          {/* SCREEN 2: CHOOSE A RIDE */}
          {riderStep === "booking" && (
            <>
              <div>
                <Box className={styles.cardHeader}>
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div>
                      <Typography className={styles.title}>Book a Ride</Typography>
                      <Typography className={styles.subtitle}>
                        Type address or tap map to set locations
                      </Typography>
                    </div>

                    {/* Nearby drivers live count */}
                    <div
                      style={{
                        backgroundColor: "#ecfdf5",
                        border: "1px solid #a7f3d0",
                        padding: "4px 8px",
                        borderRadius: "12px",
                        fontSize: "11px",
                        fontWeight: 700,
                        color: "#059669",
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                      }}
                    >
                      <span>●</span> {nearbyDrivers.length} Cabs Nearby
                    </div>
                  </Box>
                </Box>

                {/* Map Pin Selector Mode */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    backgroundColor: "#f1f5f9",
                    padding: "4px 8px",
                    borderRadius: "10px",
                    marginBottom: "10px",
                    fontSize: "12px",
                    flexWrap: "wrap",
                  }}
                >
                  <span style={{ color: "#64748b", fontWeight: 600, display: "flex", alignItems: "center", gap: 3 }}>
                    <TouchAppIcon fontSize="inherit" /> Tap map to set:
                  </span>
                  <button
                    type="button"
                    onClick={() => setMapPinMode("pickup")}
                    style={{
                      border: "none",
                      backgroundColor: mapPinMode === "pickup" ? "#10b981" : "transparent",
                      color: mapPinMode === "pickup" ? "#ffffff" : "#334155",
                      fontWeight: 700,
                      padding: "3px 8px",
                      borderRadius: "6px",
                      cursor: "pointer",
                      fontSize: "11px",
                      transition: "all 0.15s",
                    }}
                  >
                    🟢 Pickup (From)
                  </button>
                  <button
                    type="button"
                    onClick={() => setMapPinMode("dropoff")}
                    style={{
                      border: "none",
                      backgroundColor: mapPinMode === "dropoff" ? "#ef4444" : "transparent",
                      color: mapPinMode === "dropoff" ? "#ffffff" : "#334155",
                      fontWeight: 700,
                      padding: "3px 8px",
                      borderRadius: "6px",
                      cursor: "pointer",
                      fontSize: "11px",
                      transition: "all 0.15s",
                    }}
                  >
                    🔴 Destination (To)
                  </button>
                </div>

                {/* Pickup and Drop Box with two-way manual & map sync */}
                <div className={styles.locationBox}>
                  <div className={styles.locRow}>
                    <div className={styles.dotGreen} />
                    <div className={styles.locText}>
                      <div className={styles.locLabel}>From (Pickup)</div>
                      <input
                        type="text"
                        className={styles.locInput}
                        value={pickupLocation}
                        onFocus={() => setMapPinMode("pickup")}
                        onChange={(e) => {
                          setPickupLocation(e.target.value);
                          setRidesSearched(false);
                        }}
                        placeholder="Enter pickup address or tap map"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleUseCurrentLocation}
                      title="Use current GPS location"
                      style={{
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        color: "#10b981",
                        display: "flex",
                        alignItems: "center",
                        padding: "4px",
                      }}
                    >
                      <MyLocationIcon fontSize="small" />
                    </button>
                  </div>

                  <div className={styles.divider} />

                  <div className={styles.locRow}>
                    <div className={styles.dotRed} />
                    <div className={styles.locText}>
                      <div className={styles.locLabel}>To (Destination)</div>
                      <input
                        type="text"
                        className={styles.locInput}
                        value={dropoffLocation}
                        onFocus={() => setMapPinMode("dropoff")}
                        onChange={(e) => {
                          setDropoffLocation(e.target.value);
                          setRidesSearched(false);
                        }}
                        placeholder="Enter destination or tap map"
                      />
                    </div>
                  </div>

                  <button
                    type="button"
                    className={styles.swapBtn}
                    onClick={() => {
                      swapLocations();
                      setRidesSearched(false);
                    }}
                    title="Swap locations"
                  >
                    <SwapVertIcon fontSize="small" />
                  </button>
                </div>

                {/* Quick place chips */}
                <div className={styles.chipsRow}>
                  <span className={styles.chipLabel}>Quick pick:</span>
                  {quickPlaces.map((place) => (
                    <button
                      key={place.name}
                      type="button"
                      className={styles.locChip}
                      onClick={() => handleSelectQuickPlace(place)}
                    >
                      {place.name}
                    </button>
                  ))}
                </div>

                {/* FLOW: Search Prompt vs Available Rides */}
                {!ridesSearched ? (
                  <div className={styles.searchPromptCard}>
                    <div className={styles.searchPromptTitle}>
                      Search available rides
                    </div>
                    <div className={styles.searchPromptDesc}>
                      Confirm pickup & destination above (or tap on map), then
                      click &quot;Search Cabs&quot; to see real-time fares & drivers.
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className={styles.routeSummaryPill}>
                      <span>
                        Route: <strong>{pickupLocation.split(",")[0]}</strong> →{" "}
                        <strong>{dropoffLocation.split(",")[0]}</strong>
                      </span>
                      <button
                        type="button"
                        className={styles.editRouteBtn}
                        onClick={() => setRidesSearched(false)}
                      >
                        <EditLocationAltIcon
                          fontSize="inherit"
                          sx={{ verticalAlign: "middle", mr: 0.5 }}
                        />
                        Change
                      </button>
                    </div>

                    <div className={styles.cabSectionTitle}>
                      <span>Available Rides</span>
                      <span style={{ fontSize: "11px", color: "#10b981", fontWeight: 600 }}>
                        ● Fares locked for 15 min
                      </span>
                    </div>

                    <div className={styles.cabGrid}>
                      {cabOptions.map((cab) => (
                        <div
                          key={cab.id}
                          className={`${styles.cabCard} ${
                            selectedCab === cab.id ? styles.activeCab : ""
                          }`}
                          onClick={() => setSelectedCab(cab.id)}
                        >
                          <div className={styles.cabIconWrap}>{cab.icon}</div>
                          <div className={styles.cabDetails}>
                            <div className={styles.cabName}>{cab.name}</div>
                            <div className={styles.cabEta}>{cab.eta}</div>
                          </div>
                          <div className={styles.cabPrice}>₹{cab.price}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons: Search Cabs vs Book Ride */}
              {!ridesSearched ? (
                <button
                  type="button"
                  className={styles.primaryBtn}
                  disabled={!canSearch}
                  onClick={handleSearchCabs}
                >
                  <SearchIcon fontSize="small" />
                  Search Cabs
                </button>
              ) : (
                <button
                  type="button"
                  className={styles.primaryBtn}
                  onClick={startFindingDriver}
                >
                  Book {selectedCab} • ₹{fareAmount}
                </button>
              )}
            </>
          )}

          {/* SCREEN 3: FINDING A DRIVER */}
          {riderStep === "finding_driver" && (
            <>
              <div>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1.5,
                    mb: 2,
                  }}
                >
                  <button
                    type="button"
                    onClick={() => setShowCancelModal(true)}
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      padding: 0,
                      color: "#64748b",
                    }}
                  >
                    <ArrowBackIcon fontSize="small" />
                  </button>
                  <div>
                    <Typography className={styles.title}>
                      Finding your driver...
                    </Typography>
                    <Typography className={styles.subtitle}>
                      Calculating nearest {selectedCab} drivers in Chandigarh
                    </Typography>
                  </div>
                </Box>

                <div className={styles.findingCard}>
                  <div className={styles.findingHeader}>
                    <div>
                      <div className={styles.cabInfo}>{selectedCab} Cab</div>
                      <div style={{ fontSize: "12px", color: "#64748b" }}>
                        Est. arrival 3 min
                      </div>
                    </div>
                    <div className={styles.cabFare}>₹{fareAmount}</div>
                  </div>

                  <div className={styles.statusList}>
                    <div
                      className={`${styles.statusItem} ${
                        driverSearchStep >= 0 ? styles.statusDone : ""
                      }`}
                    >
                      <CheckCircleIcon fontSize="small" />
                      <span>Scanning nearby drivers with distance algorithm...</span>
                    </div>

                    <div
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
                      <span>Matching optimal captain</span>
                    </div>

                    <div
                      className={`${styles.statusItem} ${
                        driverSearchStep >= 2 ? styles.statusDone : ""
                      }`}
                    >
                      {driverSearchStep >= 2 ? (
                        <CheckCircleIcon fontSize="small" />
                      ) : (
                        <RadioButtonUncheckedIcon fontSize="small" />
                      )}
                      <span>Generating secure ride OTP</span>
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ display: "flex", gap: "10px" }}>
                <button
                  type="button"
                  className={styles.secondaryBtn}
                  onClick={() => setShowCancelModal(true)}
                >
                  Cancel Ride
                </button>
                <button
                  type="button"
                  className={styles.primaryBtn}
                  onClick={() => setRiderStep("driver_arriving")}
                >
                  Fast Match
                </button>
              </div>
            </>
          )}

          {/* SCREEN 4: DRIVER IS ON THE WAY & RIDE OTP DISPLAY */}
          {riderStep === "driver_arriving" && (
            <>
              <div>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1.5,
                    mb: 2,
                  }}
                >
                  <button
                    type="button"
                    onClick={() => setShowCancelModal(true)}
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      padding: 0,
                      color: "#64748b",
                    }}
                  >
                    <ArrowBackIcon fontSize="small" />
                  </button>
                  <div>
                    <Typography className={styles.title}>
                      Driver is on the way
                    </Typography>
                    <Typography className={styles.subtitle}>
                      Arriving in {driverInfo.etaMinutes} min • {driverInfo.distanceKm} km away
                    </Typography>
                  </div>
                </Box>

                {/* OTP CARD - Displayed prominently for the passenger */}
                <div
                  style={{
                    background: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)",
                    borderRadius: "14px",
                    padding: "16px",
                    color: "#ffffff",
                    textAlign: "center",
                    marginBottom: "16px",
                    boxShadow: "0 6px 20px rgba(15, 23, 42, 0.25)",
                    border: "1px solid rgba(255, 255, 255, 0.1)",
                  }}
                >
                  <div
                    style={{
                      fontSize: "11px",
                      textTransform: "uppercase",
                      letterSpacing: "1px",
                      color: "#fbbf24",
                      fontWeight: 800,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "6px",
                      marginBottom: "6px",
                    }}
                  >
                    <KeyIcon fontSize="small" />
                    Share OTP with driver to start ride
                  </div>
                  <div
                    style={{
                      fontSize: "36px",
                      fontWeight: 900,
                      letterSpacing: "6px",
                      color: "#ffffff",
                      fontFamily: "monospace",
                    }}
                  >
                    {currentRideOtp}
                  </div>
                  <div style={{ fontSize: "11px", color: "#94a3b8", marginTop: "4px" }}>
                    Driver must enter this 4-digit OTP on their phone to start trip
                  </div>
                </div>

                {/* Driver Info Card */}
                <div className={styles.driverCard}>
                  <div className={styles.driverHeader}>
                    <Image
                      src={driverInfo.avatar}
                      alt={driverInfo.name}
                      width={44}
                      height={44}
                      className={styles.driverAvatar}
                    />

                    <div className={styles.driverMeta}>
                      <div className={styles.driverName}>{driverInfo.name}</div>
                      <div className={styles.driverRating}>
                        ★ {driverInfo.rating} ({driverInfo.rides} trips)
                      </div>
                      <div className={styles.vehiclePlate}>
                        {driverInfo.vehicleModel} • {driverInfo.vehiclePlate}
                      </div>
                    </div>

                    <div className={styles.driverActions}>
                      <button
                        type="button"
                        title="Call driver"
                        onClick={() => alert(`Calling driver: ${driverInfo.phone}`)}
                      >
                        <PhoneIcon fontSize="small" />
                      </button>
                      <button
                        type="button"
                        title="Chat with driver"
                        onClick={() => setShowChatModal(true)}
                      >
                        <ChatIcon fontSize="small" />
                      </button>
                    </div>
                  </div>

                  <div className={styles.routeSummary}>
                    <div className={styles.point}>
                      <div className={styles.dotGreen} />
                      <span>{pickupLocation}</span>
                    </div>
                    <div className={styles.point}>
                      <div className={styles.dotRed} />
                      <span>{dropoffLocation}</span>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  className={styles.secondaryBtn}
                  style={{ marginBottom: "10px" }}
                  onClick={() => {
                    setShowShareAlert(true);
                    setTimeout(() => setShowShareAlert(false), 2500);
                  }}
                >
                  <ShareIcon fontSize="small" />
                  Share ride details
                </button>

                {showShareAlert && (
                  <div
                    style={{
                      backgroundColor: "#ecfdf5",
                      color: "#065f46",
                      padding: "8px 12px",
                      borderRadius: "6px",
                      fontSize: "12px",
                      textAlign: "center",
                      marginBottom: "10px",
                    }}
                  >
                    ✓ Live ride details & OTP copied to clipboard!
                  </div>
                )}
              </div>

              {/* Passenger Cancel Ride Button */}
              <button
                type="button"
                className={styles.secondaryBtn}
                style={{
                  borderColor: "#ef4444",
                  color: "#ef4444",
                  fontWeight: 700,
                }}
                onClick={() => setShowCancelModal(true)}
              >
                Cancel Ride
              </button>
            </>
          )}

          {/* SCREEN 4.5: TRIP ACTIVE (Driver has verified OTP and is en route) */}
          {riderStep === "trip_active" && (
            <>
              <div>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1.5,
                    mb: 2,
                  }}
                >
                  <div>
                    <Typography className={styles.title}>
                      🚗 On Trip to Destination
                    </Typography>
                    <Typography className={styles.subtitle}>
                      Heading to {dropoffLocation.split(",")[0]}
                    </Typography>
                  </div>
                </Box>

                <div
                  style={{
                    backgroundColor: "#ecfdf5",
                    border: "1.5px solid #10b981",
                    borderRadius: "12px",
                    padding: "16px",
                    marginBottom: "16px",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#065f46", fontWeight: 800 }}>
                    <NavigationIcon fontSize="small" />
                    <span>OTP Verified • Ride In Progress</span>
                  </div>
                  <div style={{ fontSize: "12px", color: "#047857", marginTop: "4px" }}>
                    Captain {driverInfo.name} is driving. Estimated arrival in 9 mins.
                  </div>
                </div>

                <div className={styles.driverCard}>
                  <div className={styles.driverHeader}>
                    <Image
                      src={driverInfo.avatar}
                      alt={driverInfo.name}
                      width={44}
                      height={44}
                      className={styles.driverAvatar}
                    />
                    <div className={styles.driverMeta}>
                      <div className={styles.driverName}>{driverInfo.name}</div>
                      <div className={styles.vehiclePlate}>
                        {driverInfo.vehicleModel} • {driverInfo.vehiclePlate}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <button
                type="button"
                className={styles.primaryBtn}
                onClick={completeRideManually}
              >
                End Ride (Complete Demo)
              </button>
            </>
          )}

          {/* SCREEN 5: RIDE COMPLETED */}
          {riderStep === "completed" && (
            <div className={styles.completedCard}>
              <div className={styles.greenBadge}>✓</div>

              <div>
                <Typography className={styles.title}>Ride completed!</Typography>
                <Typography className={styles.subtitle}>
                  Thanks for riding with Taxii
                </Typography>
              </div>

              <div className={styles.fareBox}>
                <div className={styles.fareLabel}>Total fare paid</div>
                <div className={styles.fareNumber}>₹{fareAmount}</div>
                <div className={styles.paidVia}>✓ Paid via UPI (OTP: {currentRideOtp})</div>
              </div>

              <div
                style={{
                  textAlign: "left",
                  width: "100%",
                  backgroundColor: "#ffffff",
                  border: "1px solid #e2e8f0",
                  borderRadius: "8px",
                  padding: "10px 12px",
                  fontSize: "12px",
                }}
              >
                <div style={{ marginBottom: "4px" }}>
                  <span style={{ color: "#10b981", fontWeight: 700 }}>● </span>
                  <strong>{pickupLocation}</strong>
                </div>
                <div>
                  <span style={{ color: "#ef4444", fontWeight: 700 }}>● </span>
                  <strong>{dropoffLocation}</strong>
                </div>
              </div>

              <div>
                <div
                  style={{
                    fontSize: "13px",
                    fontWeight: 600,
                    color: "#334155",
                    marginBottom: "4px",
                  }}
                >
                  Rate Captain {driverInfo.name}
                </div>
                <div className={styles.starsRow}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span
                      key={star}
                      className={`${styles.star} ${
                        star <= rating ? styles.filled : ""
                      }`}
                      onClick={() => setRating(star)}
                    >
                      ★
                    </span>
                  ))}
                </div>
              </div>

              <button
                type="button"
                className={styles.primaryBtn}
                onClick={resetToNewBooking}
              >
                Book Another Ride
              </button>
            </div>
          )}
        </Box>

        {/* Right Card: Interactive Map with Nearby Cabs & Map Click handling */}
        <Box className={styles.mapCard}>
          <MapComponent
            initialCenter={pickupCoords}
            zoom={14}
            showSearchOverlay={false}
            showControls={true}
            nearbyCabs={nearbyDrivers}
            pickupCoords={pickupCoords}
            dropoffCoords={dropoffCoords}
            onMapClickCoords={handleMapClick}
          />
        </Box>
      </Box>

      {/* CANCEL RIDE CONFIRMATION MODAL */}
      {showCancelModal && (
        <div
          className={styles.modalOverlay}
          onClick={() => setShowCancelModal(false)}
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
                Cancel your ride?
              </Typography>
              <Typography className={styles.cancelDesc}>
                Are you sure you want to cancel this booking? Please let us know the reason:
              </Typography>
            </div>

            <div className={styles.cancelReasonsList}>
              {cancelReasons.map((reason) => (
                <div
                  key={reason}
                  className={`${styles.reasonOption} ${
                    selectedCancelReason === reason ? styles.activeReason : ""
                  }`}
                  onClick={() => setSelectedCancelReason(reason)}
                >
                  <span
                    style={{
                      width: "14px",
                      height: "14px",
                      borderRadius: "50%",
                      border: "2px solid",
                      borderColor: selectedCancelReason === reason ? "#ef4444" : "#94a3b8",
                      backgroundColor: selectedCancelReason === reason ? "#ef4444" : "transparent",
                      display: "inline-block",
                      flexShrink: 0,
                    }}
                  />
                  <span>{reason}</span>
                </div>
              ))}
            </div>

            <div className={styles.modalBtnRow}>
              <button
                type="button"
                className={styles.keepRideBtn}
                onClick={() => setShowCancelModal(false)}
              >
                No, Keep Ride
              </button>
              <button
                type="button"
                className={styles.confirmCancelBtn}
                onClick={handleConfirmCancelRide}
              >
                Yes, Cancel Ride
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Chat modal */}
      {showChatModal && (
        <div
          className={styles.modalOverlay}
          onClick={() => setShowChatModal(false)}
        >
          <div
            style={{
              backgroundColor: "#ffffff",
              padding: "24px",
              borderRadius: "18px",
              width: "100%",
              maxWidth: "380px",
              boxShadow: "0 10px 40px rgba(0,0,0,0.2)",
              boxSizing: "border-box",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 style={{ margin: "0 0 10px 0", fontSize: "16px", fontWeight: 700 }}>
              Chat with Captain {driverInfo.name}
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
              <strong>{driverInfo.name}:</strong> Hi! I am arriving now. Please keep your 4-digit OTP ready!
            </div>
            <input
              type="text"
              placeholder="Type your message..."
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
              onClick={() => setShowChatModal(false)}
            >
              Send Message
            </button>
          </div>
        </div>
      )}
    </Box>
  );
};

export default RiderExperience;
