"use client";

import React, { useState } from "react";
import { Box } from "@mui/material";
import MapComponent from "../dashboard/map/Map";
import { reverseGeocodeLocation } from "../dashboard/map/services/geocodingService";
import { Coordinates } from "../dashboard/map/types";
import { useTaxii } from "@/context/TaxiiContext";

import { BookingStep } from "./components/BookingStep";
import { FindingDriverStep } from "./components/FindingDriverStep";
import { DriverArrivingStep } from "./components/DriverArrivingStep";
import { TripActiveStep } from "./components/TripActiveStep";
import { CompletedStep } from "./components/CompletedStep";
import { CancelRideModal } from "./modals/CancelRideModal";
import { ChatDriverModal } from "./modals/ChatDriverModal";

import styles from "./RiderExperience.module.scss";

export const RiderExperience: React.FC = () => {
  const {
    riderStep,
    setRiderStep,
    setPickupLocation,
    setDropoffLocation,
    setRidesSearched,
    pickupCoords,
    setPickupCoords,
    dropoffCoords,
    setDropoffCoords,
    mapPinMode,
    setMapPinMode,
    nearbyDrivers,
    recalculateNearbyDrivers,
    driverInfo,
    cancelRide,
  } = useTaxii();

  // Modal states
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedCancelReason, setSelectedCancelReason] = useState("Change of plans");
  const [showChatModal, setShowChatModal] = useState(false);

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

  const handleConfirmCancelRide = () => {
    setShowCancelModal(false);
    cancelRide();
  };

  return (
    <Box className={styles.pageContainer}>
      <Box className={styles.mainGrid}>
        {/* Left Card: Rider Booking Form & State */}
        <Box className={styles.bookingCard}>
          {riderStep === "booking" && <BookingStep />}

          {riderStep === "finding_driver" && (
            <FindingDriverStep
              onCancel={() => setShowCancelModal(true)}
              onFastMatch={() => setRiderStep("driver_arriving")}
            />
          )}

          {riderStep === "driver_arriving" && (
            <DriverArrivingStep
              onCancel={() => setShowCancelModal(true)}
              onOpenChat={() => setShowChatModal(true)}
            />
          )}

          {riderStep === "trip_active" && <TripActiveStep />}

          {riderStep === "completed" && <CompletedStep />}
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

      {/* Cancel ride confirmation modal */}
      <CancelRideModal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        onConfirm={handleConfirmCancelRide}
        selectedReason={selectedCancelReason}
        onSelectReason={setSelectedCancelReason}
      />

      {/* In-app driver chat modal */}
      <ChatDriverModal
        isOpen={showChatModal}
        onClose={() => setShowChatModal(false)}
        driverName={driverInfo.name}
      />
    </Box>
  );
};

export default RiderExperience;
