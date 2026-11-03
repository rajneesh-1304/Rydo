"use client";

import React from "react";
import { Box, Typography, Button } from "@mui/material";
import TouchAppIcon from "@mui/icons-material/TouchApp";
import MyLocationIcon from "@mui/icons-material/MyLocation";
import SwapVertIcon from "@mui/icons-material/SwapVert";
import EditLocationAltIcon from "@mui/icons-material/EditLocationAlt";
import SearchIcon from "@mui/icons-material/Search";
import {
  BikeIcon,
  AutoIcon,
  MiniIcon,
  SedanIcon,
} from "../../common/VehicleIcons";
import { Coordinates } from "../../dashboard/map/types";
import { reverseGeocodeLocation, searchLocation } from "../../dashboard/map/services/geocodingService";
import { useTaxii } from "@/context/TaxiiContext";
import styles from "../RiderExperience.module.scss";

export const BookingStep: React.FC = () => {
  const {
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
    startFindingDriver,
    swapLocations,
  } = useTaxii();

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

  return (
    <>
      <Box>
        <Box className={styles.cardHeader}>
          <Box className={styles.headerFlex}>
            <Box>
              <Typography component="h2" className={styles.title}>
                Book a Ride
              </Typography>
              <Typography className={styles.subtitle}>
                Type address or tap map to set locations
              </Typography>
            </Box>

            {/* Nearby drivers live count */}
            <Box className={styles.cabsNearbyBadge}>
              <Box component="span">●</Box> {nearbyDrivers.length} Cabs Nearby
            </Box>
          </Box>
        </Box>

        {/* Map Pin Selector Mode */}
        <Box className={styles.mapPinBar}>
          <Typography component="span" className={styles.mapPinLabel}>
            <TouchAppIcon fontSize="inherit" /> Tap map to set:
          </Typography>
          <Button
            type="button"
            onClick={() => setMapPinMode("pickup")}
            className={`${styles.mapPinBtn} ${
              mapPinMode === "pickup" ? styles.mapPinBtnPickupActive : ""
            }`}
          >
            🟢 Pickup (From)
          </Button>
          <Button
            type="button"
            onClick={() => setMapPinMode("dropoff")}
            className={`${styles.mapPinBtn} ${
              mapPinMode === "dropoff" ? styles.mapPinBtnDropoffActive : ""
            }`}
          >
            🔴 Destination (To)
          </Button>
        </Box>

        {/* Pickup and Drop Box with two-way manual & map sync */}
        <Box className={styles.locationBox}>
          <Box className={styles.locRow}>
            <Box className={styles.dotGreen} />
            <Box className={styles.locText}>
              <Box className={styles.locLabel}>From (Pickup)</Box>
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
            </Box>
            <Button
              type="button"
              onClick={handleUseCurrentLocation}
              title="Use current GPS location"
              className={styles.gpsLocationBtn}
            >
              <MyLocationIcon fontSize="small" />
            </Button>
          </Box>

          <Box className={styles.divider} />

          <Box className={styles.locRow}>
            <Box className={styles.dotRed} />
            <Box className={styles.locText}>
              <Box className={styles.locLabel}>To (Destination)</Box>
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
            </Box>
          </Box>

          <Button
            type="button"
            className={styles.swapBtn}
            onClick={() => {
              swapLocations();
              setRidesSearched(false);
            }}
            title="Swap locations"
          >
            <SwapVertIcon fontSize="small" />
          </Button>
        </Box>

        {/* Quick place chips */}
        <Box className={styles.chipsRow}>
          <Typography component="span" className={styles.chipLabel}>
            Quick pick:
          </Typography>
          {quickPlaces.map((place) => (
            <Button
              key={place.name}
              type="button"
              className={styles.locChip}
              onClick={() => handleSelectQuickPlace(place)}
            >
              {place.name}
            </Button>
          ))}
        </Box>

        {/* FLOW: Search Prompt vs Available Rides */}
        {!ridesSearched ? (
          <Box className={styles.searchPromptCard}>
            <Typography className={styles.searchPromptTitle}>
              Search available rides
            </Typography>
            <Typography className={styles.searchPromptDesc}>
              Confirm pickup & destination above (or tap on map), then click
              &quot;Search Cabs&quot; to see real-time fares & drivers.
            </Typography>
          </Box>
        ) : (
          <Box>
            <Box className={styles.routeSummaryPill}>
              <Typography component="span">
                Route: <strong>{pickupLocation.split(",")[0]}</strong> →{" "}
                <strong>{dropoffLocation.split(",")[0]}</strong>
              </Typography>
              <Button
                type="button"
                className={styles.editRouteBtn}
                onClick={() => setRidesSearched(false)}
              >
                <EditLocationAltIcon fontSize="inherit" />
                Change
              </Button>
            </Box>

            <Box className={styles.cabSectionTitle}>
              <Typography component="span">Available Rides</Typography>
              <Typography component="span" className={styles.fareLockedTag}>
                ● Fares locked for 15 min
              </Typography>
            </Box>

            <Box className={styles.cabGrid}>
              {cabOptions.map((cab) => (
                <Box
                  key={cab.id}
                  className={`${styles.cabCard} ${
                    selectedCab === cab.id ? styles.activeCab : ""
                  }`}
                  onClick={() => setSelectedCab(cab.id)}
                >
                  <Box className={styles.cabIconWrap}>{cab.icon}</Box>
                  <Box className={styles.cabDetails}>
                    <Typography className={styles.cabName}>{cab.name}</Typography>
                    <Typography className={styles.cabEta}>{cab.eta}</Typography>
                  </Box>
                  <Typography className={styles.cabPrice}>₹{cab.price}</Typography>
                </Box>
              ))}
            </Box>
          </Box>
        )}
      </Box>

      {/* Action Buttons: Search Cabs vs Book Ride */}
      {!ridesSearched ? (
        <Button
          type="button"
          className={styles.primaryBtn}
          disabled={!canSearch}
          onClick={handleSearchCabs}
        >
          <SearchIcon fontSize="small" />
          Search Cabs
        </Button>
      ) : (
        <Button
          type="button"
          className={styles.primaryBtn}
          onClick={startFindingDriver}
        >
          Book {selectedCab} • ₹{fareAmount}
        </Button>
      )}
    </>
  );
};

export default BookingStep;
