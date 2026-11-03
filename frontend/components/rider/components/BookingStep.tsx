"use client";

import React, { useState, useEffect, useRef } from "react";
import { Box, Typography, Button, CircularProgress } from "@mui/material";
import TouchAppIcon from "@mui/icons-material/TouchApp";
import MyLocationIcon from "@mui/icons-material/MyLocation";
import SwapVertIcon from "@mui/icons-material/SwapVert";
import EditLocationAltIcon from "@mui/icons-material/EditLocationAlt";
import SearchIcon from "@mui/icons-material/Search";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import {
  BikeIcon,
  AutoIcon,
  MiniIcon,
  SedanIcon,
} from "../../common/VehicleIcons";
import { Coordinates } from "../../dashboard/map/types";
import {
  reverseGeocodeLocation,
  searchLocation,
  searchLocationSuggestions,
  LocationSuggestion,
} from "../../dashboard/map/services/geocodingService";
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
    distanceKm,
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

  // Autocomplete suggestions state
  const [pickupSuggestions, setPickupSuggestions] = useState<LocationSuggestion[]>([]);
  const [dropoffSuggestions, setDropoffSuggestions] = useState<LocationSuggestion[]>([]);
  const [isSearchingPickup, setIsSearchingPickup] = useState(false);
  const [isSearchingDropoff, setIsSearchingDropoff] = useState(false);

  const locBoxRef = useRef<HTMLDivElement>(null);

  // Dynamic fare calculations based on actual real distance
  const bikePrice = Math.max(40, Math.round(25 + distanceKm * 12));
  const autoPrice = Math.max(60, Math.round(35 + distanceKm * 15));
  const miniPrice = Math.max(90, Math.round(50 + distanceKm * 20));
  const sedanPrice = Math.max(130, Math.round(70 + distanceKm * 25));

  const getCabDriverStatus = (type: string) => {
    const matching = nearbyDrivers.filter(
      (d) => d.type?.toLowerCase() === type.toLowerCase()
    );
    return {
      isOnline: matching.length > 0,
      count: matching.length,
      eta: matching.length > 0 ? matching[0].eta : "Offline",
      closestDriver: matching[0],
    };
  };

  const cabOptions = [
    {
      id: "Bike" as const,
      name: "Bike",
      price: bikePrice,
      status: getCabDriverStatus("Bike"),
      icon: <BikeIcon size={26} />,
    },
    {
      id: "Auto" as const,
      name: "Auto",
      price: autoPrice,
      status: getCabDriverStatus("Auto"),
      icon: <AutoIcon size={26} />,
    },
    {
      id: "Mini" as const,
      name: "Mini",
      price: miniPrice,
      status: getCabDriverStatus("Mini"),
      icon: <MiniIcon size={28} />,
    },
    {
      id: "Sedan" as const,
      name: "Sedan",
      price: sedanPrice,
      status: getCabDriverStatus("Sedan"),
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

  // Debounced search for pickup suggestions
  useEffect(() => {
    if (!pickupLocation || pickupLocation.trim().length < 3) {
      setPickupSuggestions([]);
      return;
    }
    const timer = setTimeout(async () => {
      setIsSearchingPickup(true);
      const res = await searchLocationSuggestions(pickupLocation);
      setPickupSuggestions(res);
      setIsSearchingPickup(false);
    }, 350);
    return () => clearTimeout(timer);
  }, [pickupLocation]);

  // Debounced search for dropoff suggestions
  useEffect(() => {
    if (!dropoffLocation || dropoffLocation.trim().length < 3) {
      setDropoffSuggestions([]);
      return;
    }
    const timer = setTimeout(async () => {
      setIsSearchingDropoff(true);
      const res = await searchLocationSuggestions(dropoffLocation);
      setDropoffSuggestions(res);
      setIsSearchingDropoff(false);
    }, 350);
    return () => clearTimeout(timer);
  }, [dropoffLocation]);

  // Dismiss suggestions on outside click
  useEffect(() => {
    const handleDocumentClick = (e: MouseEvent) => {
      if (locBoxRef.current && !locBoxRef.current.contains(e.target as Node)) {
        setPickupSuggestions([]);
        setDropoffSuggestions([]);
      }
    };
    document.addEventListener("mousedown", handleDocumentClick);
    return () => document.removeEventListener("mousedown", handleDocumentClick);
  }, []);

  const canSearch =
    pickupLocation.trim().length > 0 && dropoffLocation.trim().length > 0;

  const handleSelectPickupSuggestion = (s: LocationSuggestion) => {
    const address = s.displayName + (s.secondaryText ? `, ${s.secondaryText}` : "");
    setPickupLocation(address);
    setPickupCoords(s.coords);
    recalculateNearbyDrivers(s.coords);
    setPickupSuggestions([]);
    setRidesSearched(false);
  };

  const handleSelectDropoffSuggestion = (s: LocationSuggestion) => {
    const address = s.displayName + (s.secondaryText ? `, ${s.secondaryText}` : "");
    setDropoffLocation(address);
    setDropoffCoords(s.coords);
    setDropoffSuggestions([]);
    setRidesSearched(false);
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
    setPickupSuggestions([]);
    setDropoffSuggestions([]);
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

    setPickupSuggestions([]);
    setDropoffSuggestions([]);

    if (pickupLocation && !pickupCoords) {
      const p = await searchLocation(pickupLocation);
      if (p) {
        setPickupCoords(p);
        recalculateNearbyDrivers(p);
      }
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
                Type address with live search or tap map
              </Typography>
            </Box>

            {/* Nearby drivers live count from backend */}
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
        <Box className={styles.locationBox} ref={locBoxRef}>
          {/* Pickup Input Row */}
          <Box className={styles.locRowWrapper}>
            <Box className={styles.locRow}>
              <Box className={styles.dotGreen} />
              <Box className={styles.locText}>
                <Box className={styles.locLabel}>
                  From (Pickup) {isSearchingPickup && "• Searching..."}
                </Box>
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

            {/* Live Pickup Autocomplete Suggestions */}
            {pickupSuggestions.length > 0 && (
              <Box className={styles.suggestionsDropdown}>
                {pickupSuggestions.map((s, idx) => (
                  <button
                    key={`${s.displayName}-${idx}`}
                    type="button"
                    className={styles.suggestionItem}
                    onClick={() => handleSelectPickupSuggestion(s)}
                  >
                    <LocationOnIcon className={styles.suggestionIcon} />
                    <Box className={styles.suggestionDetails}>
                      <Typography className={styles.suggestionPrimary}>
                        {s.displayName}
                      </Typography>
                      {s.secondaryText && (
                        <Typography className={styles.suggestionSecondary}>
                          {s.secondaryText}
                        </Typography>
                      )}
                    </Box>
                  </button>
                ))}
              </Box>
            )}
          </Box>

          <Box className={styles.divider} />

          {/* Dropoff Input Row */}
          <Box className={styles.locRowWrapper}>
            <Box className={styles.locRow}>
              <Box className={styles.dotRed} />
              <Box className={styles.locText}>
                <Box className={styles.locLabel}>
                  To (Destination) {isSearchingDropoff && "• Searching..."}
                </Box>
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

            {/* Live Dropoff Autocomplete Suggestions */}
            {dropoffSuggestions.length > 0 && (
              <Box className={styles.suggestionsDropdown}>
                {dropoffSuggestions.map((s, idx) => (
                  <button
                    key={`${s.displayName}-${idx}`}
                    type="button"
                    className={styles.suggestionItem}
                    onClick={() => handleSelectDropoffSuggestion(s)}
                  >
                    <LocationOnIcon className={styles.suggestionIcon} />
                    <Box className={styles.suggestionDetails}>
                      <Typography className={styles.suggestionPrimary}>
                        {s.displayName}
                      </Typography>
                      {s.secondaryText && (
                        <Typography className={styles.suggestionSecondary}>
                          {s.secondaryText}
                        </Typography>
                      )}
                    </Box>
                  </button>
                ))}
              </Box>
            )}
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
                <strong>{dropoffLocation.split(",")[0]}</strong> (
                {distanceKm} km • ~{Math.round(distanceKm * 2.5)} min)
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
                ● Live dynamic pricing ({distanceKm} km)
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
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.8 }}>
                      <Typography className={styles.cabName}>{cab.name}</Typography>
                      <Box
                        component="span"
                        sx={{
                          fontSize: "10px",
                          fontWeight: 700,
                          px: 0.8,
                          py: 0.2,
                          borderRadius: "8px",
                          backgroundColor: cab.status.isOnline ? "#dcfce7" : "#f1f5f9",
                          color: cab.status.isOnline ? "#166534" : "#64748b",
                        }}
                      >
                        {cab.status.isOnline ? `● ${cab.status.count} Online` : "Offline"}
                      </Box>
                    </Box>
                    <Typography className={styles.cabEta}>
                      {cab.status.isOnline ? `${cab.status.eta} away` : "No drivers currently online"}
                    </Typography>
                  </Box>
                  <Typography className={styles.cabPrice}>₹{cab.price}</Typography>
                </Box>
              ))}
            </Box>

            {!getCabDriverStatus(selectedCab).isOnline && (
              <Box
                sx={{
                  mt: 1.5,
                  p: 1.2,
                  borderRadius: "10px",
                  backgroundColor: "#fffbeb",
                  border: "1px solid #fde68a",
                }}
              >
                <Typography sx={{ fontSize: "12px", color: "#b45309", fontWeight: 500 }}>
                  ⚠️ No <strong>{selectedCab}</strong> driver is currently online. Only online drivers with matching vehicles appear. Please select another vehicle type or wait for a driver to go online.
                </Typography>
              </Box>
            )}
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
          disabled={!getCabDriverStatus(selectedCab).isOnline}
          onClick={startFindingDriver}
          style={{
            opacity: getCabDriverStatus(selectedCab).isOnline ? 1 : 0.6,
          }}
        >
          {getCabDriverStatus(selectedCab).isOnline
            ? `Book ${selectedCab} • ₹${fareAmount}`
            : `No ${selectedCab} Drivers Online`}
        </Button>
      )}
    </>
  );
};

export default BookingStep;
