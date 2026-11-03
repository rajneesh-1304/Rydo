"use client";

import React, { createContext, useContext, useEffect, useCallback } from "react";
import { Coordinates, NearbyCab } from "@/components/dashboard/map/types";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  BookingItem,
  RiderStep,
  setRiderStep,
  setSelectedCab,
  setPickupLocation,
  setDropoffLocation,
  setPickupCoords,
  setDropoffCoords,
  setMapPinMode,
  setRidesSearched,
  setDriverSearchStep,
  setCurrentRideOtp,
  swapLocations as swapLocationsAction,
  startFindingDriver as startFindingDriverAction,
  cancelRide as cancelRideAction,
  completeRideManually as completeRideManuallyAction,
  resetToNewBooking as resetToNewBookingAction,
  addBooking as addBookingAction,
  rideAcceptedFromSocket,
  tripStartedFromSocket,
} from "@/store/slices/rideSlice";
import {
  DriverTripState,
  setIsDriverOnline as setIsDriverOnlineAction,
  setHasIncomingRideRequest as setHasIncomingRideRequestAction,
  setDriverActiveTab as setDriverActiveTabAction,
  setDriverTripState as setDriverTripStateAction,
  setDriverEnteredOtp as setDriverEnteredOtpAction,
  setOtpError as setOtpErrorAction,
  acceptIncomingRequest as acceptIncomingRequestAction,
  rejectIncomingRequest as rejectIncomingRequestAction,
  tripStartedSuccess as tripStartedSuccessAction,
  finishDriverTrip as finishDriverTripAction,
  resetDriverToIdle as resetDriverToIdleAction,
} from "@/store/slices/driverSlice";
import {
  recalculateNearbyDrivers as recalculateNearbyDriversAction,
  DriverLiveLocation,
} from "@/store/slices/locationSlice";
import {
  setAppMode as setAppModeAction,
  setIsLoggedIn as setIsLoggedInAction,
  updateRiderProfile as updateRiderProfileAction,
  updateDriverProfile as updateDriverProfileAction,
  RiderProfile,
  DriverProfile,
} from "@/store/slices/userSlice";
import { socketService } from "@/services/socketService";
import { useLiveLocationTracking } from "@/hooks/useLiveLocationTracking";

export type { BookingItem, RiderStep, RiderProfile, DriverProfile };

export interface TaxiiContextType {
  appMode: "rider" | "driver";
  setAppMode: (mode: "rider" | "driver") => void;
  isLoggedIn: boolean;
  setIsLoggedIn: (val: boolean) => void;
  updateRiderProfile: (data: Partial<RiderProfile>) => void;
  updateDriverProfile: (data: Partial<DriverProfile>) => void;

  // Rider Booking Flow
  riderStep: RiderStep;
  setRiderStep: (step: RiderStep) => void;
  selectedCab: "Bike" | "Auto" | "Mini" | "Sedan";
  setSelectedCab: (cab: "Bike" | "Auto" | "Mini" | "Sedan") => void;
  pickupLocation: string;
  setPickupLocation: (loc: string) => void;
  dropoffLocation: string;
  setDropoffLocation: (loc: string) => void;
  fareAmount: number;
  distanceKm: number;
  ridesSearched: boolean;
  setRidesSearched: (val: boolean) => void;

  // Map coordinates & click selection
  pickupCoords: Coordinates;
  setPickupCoords: (c: Coordinates) => void;
  dropoffCoords: Coordinates | null;
  setDropoffCoords: (c: Coordinates | null) => void;
  mapPinMode: "pickup" | "dropoff";
  setMapPinMode: (m: "pickup" | "dropoff") => void;

  // Nearby drivers algorithm & live tracking
  nearbyDrivers: NearbyCab[];
  recalculateNearbyDrivers: (center: Coordinates) => void;
  driverLiveLocation: DriverLiveLocation;
  fiveSecTickCount: number;

  // OTP Verification
  currentRideOtp: string;
  driverEnteredOtp: string;
  setDriverEnteredOtp: (otp: string) => void;
  otpError: string;
  setOtpError: (err: string) => void;
  verifyDriverOtp: (otpInput: string) => boolean;

  driverInfo: {
    name: string;
    rating: number;
    rides: number;
    vehicleModel: string;
    vehiclePlate: string;
    avatar: string;
    etaMinutes: number;
    distanceKm: number;
    phone: string;
  };
  driverSearchStep: number;

  // Rider actions
  startFindingDriver: () => void;
  cancelRide: () => void;
  completeRideManually: () => void;
  resetToNewBooking: () => void;
  swapLocations: () => void;

  // Bookings list
  bookings: BookingItem[];
  addBooking: (booking: BookingItem) => void;

  // Driver Experience state
  isDriverOnline: boolean;
  setIsDriverOnline: (val: boolean) => void;
  driverTodayEarnings: number;
  driverTripsCompleted: number;
  hasIncomingRideRequest: boolean;
  setHasIncomingRideRequest: (val: boolean) => void;
  incomingRideDetails: {
    fare: number;
    distance: string;
    duration: string;
    passengerName: string;
    passengerRating: number;
    passengerPhone: string;
    pickup: string;
    dropoff: string;
    pickupCoords: Coordinates;
    dropoffCoords: Coordinates;
    rideId?: string;
  };
  driverActiveTab: "home" | "earnings" | "profile";
  setDriverActiveTab: (tab: "home" | "earnings" | "profile") => void;
  driverTripState: DriverTripState;
  setDriverTripState: (s: DriverTripState) => void;
  acceptIncomingRequest: () => void;
  rejectIncomingRequest: () => void;
  startDriverTripWithOtp: (otp: string) => boolean;
  finishDriverTrip: () => void;

  // Profiles
  riderProfile: RiderProfile;
  driverProfile: DriverProfile;
  userProfile: RiderProfile | DriverProfile;
}

const TaxiiContext = createContext<TaxiiContextType | undefined>(undefined);

export const TaxiiProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const dispatch = useAppDispatch();

  // Redux Selectors
  const appMode = useAppSelector((state) => state.user.appMode);
  const isLoggedIn = useAppSelector((state) => state.user.isLoggedIn);
  const riderProfile = useAppSelector((state) => state.user.riderProfile);
  const driverProfile = useAppSelector((state) => state.user.driverProfile);

  const riderStep = useAppSelector((state) => state.ride.riderStep);
  const selectedCab = useAppSelector((state) => state.ride.selectedCab);
  const pickupLocation = useAppSelector((state) => state.ride.pickupLocation);
  const dropoffLocation = useAppSelector((state) => state.ride.dropoffLocation);
  const pickupCoords = useAppSelector((state) => state.ride.pickupCoords);
  const dropoffCoords = useAppSelector((state) => state.ride.dropoffCoords);
  const mapPinMode = useAppSelector((state) => state.ride.mapPinMode);
  const fareAmount = useAppSelector((state) => state.ride.fareAmount);
  const distanceKm = useAppSelector((state) => state.ride.distanceKm);
  const ridesSearched = useAppSelector((state) => state.ride.ridesSearched);
  const driverSearchStep = useAppSelector((state) => state.ride.driverSearchStep);
  const currentRideOtp = useAppSelector((state) => state.ride.currentRideOtp);
  const rideId = useAppSelector((state) => state.ride.rideId);
  const driverInfo = useAppSelector((state) => state.ride.driverInfo);
  const bookings = useAppSelector((state) => state.ride.bookings);

  const isDriverOnline = useAppSelector((state) => state.driver.isDriverOnline);
  const driverTodayEarnings = useAppSelector((state) => state.driver.driverTodayEarnings);
  const driverTripsCompleted = useAppSelector((state) => state.driver.driverTripsCompleted);
  const hasIncomingRideRequest = useAppSelector((state) => state.driver.hasIncomingRideRequest);
  const incomingRideDetails = useAppSelector((state) => state.driver.incomingRideDetails);
  const driverActiveTab = useAppSelector((state) => state.driver.driverActiveTab);
  const driverTripState = useAppSelector((state) => state.driver.driverTripState);
  const driverEnteredOtp = useAppSelector((state) => state.driver.driverEnteredOtp);
  const otpError = useAppSelector((state) => state.driver.otpError);

  const nearbyDrivers = useAppSelector((state) => state.location.nearbyDrivers);
  const driverLiveLocation = useAppSelector((state) => state.location.driverLiveLocation);
  const fiveSecTickCount = useAppSelector((state) => state.location.fiveSecTickCount);

  // Activate 5-second live location stream hook
  useLiveLocationTracking();

  // Initialize WebSockets on client mount & listen for live nearby drivers
  useEffect(() => {
    socketService.init();
    const userId = appMode === "driver" ? "d-amit-124" : "u-rajneesh-38";
    socketService.registerClient(
      userId,
      appMode,
      appMode === "driver" ? driverProfile.name : riderProfile.name
    );
    socketService.getNearbyDrivers(pickupCoords.lat, pickupCoords.lng);
    socketService.getRideHistory(userId);
  }, [appMode, driverProfile.name, riderProfile.name, pickupCoords.lat, pickupCoords.lng]);

  // Automated search progression when in finding_driver step
  useEffect(() => {
    let t1: NodeJS.Timeout;
    let t2: NodeJS.Timeout;

    if (riderStep === "finding_driver") {
      dispatch(setDriverSearchStep(0));
      t1 = setTimeout(() => {
        dispatch(setDriverSearchStep(1));
      }, 1500);

      t2 = setTimeout(() => {
        dispatch(setDriverSearchStep(2));
      }, 3000);
    }

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [riderStep, dispatch]);

  // Actions wrapped with Redux dispatch & WebSocket emission
  const startFindingDriver = useCallback(() => {
    dispatch(startFindingDriverAction());
    socketService.requestRide({
      rideId,
      riderId: "u-rajneesh-38",
      riderName: riderProfile.name,
      riderPhone: riderProfile.phone,
      pickupAddress: pickupLocation,
      pickupCoords,
      dropoffAddress: dropoffLocation,
      dropoffCoords: dropoffCoords || { lat: 30.7055, lng: 76.8013 },
      cabType: selectedCab,
      fare: fareAmount,
      distance: `${distanceKm} km`,
    });
  }, [dispatch, rideId, riderProfile, pickupLocation, pickupCoords, dropoffLocation, dropoffCoords, selectedCab, fareAmount, distanceKm]);

  const cancelRide = useCallback(() => {
    dispatch(cancelRideAction());
    dispatch(resetDriverToIdleAction());
    socketService.cancelRide(rideId, "Cancelled by user", appMode);
  }, [dispatch, rideId, appMode]);

  const completeRideManually = useCallback(() => {
    dispatch(completeRideManuallyAction());
    socketService.completeTrip(rideId, fareAmount, "d-amit-124");
  }, [dispatch, rideId, fareAmount]);

  const resetToNewBooking = useCallback(() => {
    dispatch(resetToNewBookingAction());
  }, [dispatch]);

  const swapLocations = useCallback(() => {
    dispatch(swapLocationsAction());
    if (dropoffCoords) {
      dispatch(recalculateNearbyDriversAction(dropoffCoords));
      socketService.getNearbyDrivers(dropoffCoords.lat, dropoffCoords.lng);
    }
  }, [dispatch, dropoffCoords]);

  const recalculateNearbyDrivers = useCallback(
    (center: Coordinates) => {
      dispatch(recalculateNearbyDriversAction(center));
      socketService.getNearbyDrivers(center.lat, center.lng);
    },
    [dispatch]
  );

  // Driver actions
  const acceptIncomingRequest = useCallback(() => {
    dispatch(acceptIncomingRequestAction());
    socketService.acceptRide({
      rideId: incomingRideDetails.rideId || rideId,
      driverId: "d-amit-124",
      driverName: driverProfile.name,
      driverRating: driverProfile.rating,
      vehicleModel: driverProfile.vehicleDetails,
      vehiclePlate: driverProfile.vehiclePlate,
      phone: driverProfile.phone,
      avatar: driverProfile.avatar,
      etaMinutes: 3,
    });
  }, [dispatch, incomingRideDetails, rideId, driverProfile]);

  const rejectIncomingRequest = useCallback(() => {
    dispatch(rejectIncomingRequestAction());
  }, [dispatch]);

  // Driver OTP Verification
  const verifyDriverOtp = useCallback(
    (otpInput: string): boolean => {
      const trimmed = otpInput.trim();
      if (trimmed === currentRideOtp) {
        dispatch(setOtpErrorAction(""));
        dispatch(tripStartedSuccessAction());
        dispatch(tripStartedFromSocket());
        socketService.verifyOtp(rideId, trimmed, "d-amit-124");
        return true;
      } else {
        dispatch(
          setOtpErrorAction("Invalid OTP! Please ask passenger for the 4-digit code.")
        );
        return false;
      }
    },
    [dispatch, currentRideOtp, rideId]
  );

  const startDriverTripWithOtp = useCallback(
    (otp: string) => {
      return verifyDriverOtp(otp);
    },
    [verifyDriverOtp]
  );

  const finishDriverTrip = useCallback(() => {
    dispatch(finishDriverTripAction());
    dispatch(completeRideManuallyAction());
    socketService.completeTrip(rideId, incomingRideDetails.fare, "d-amit-124");

    setTimeout(() => {
      dispatch(resetDriverToIdleAction());
    }, 2500);
  }, [dispatch, rideId, incomingRideDetails.fare]);

  const userProfile = appMode === "driver" ? driverProfile : riderProfile;

  return (
    <TaxiiContext.Provider
      value={{
        appMode,
        setAppMode: (mode) => dispatch(setAppModeAction(mode)),
        isLoggedIn,
        setIsLoggedIn: (val) => dispatch(setIsLoggedInAction(val)),
        riderStep,
        setRiderStep: (step) => dispatch(setRiderStep(step)),
        selectedCab,
        setSelectedCab: (cab) => dispatch(setSelectedCab(cab)),
        pickupLocation,
        setPickupLocation: (loc) => dispatch(setPickupLocation(loc)),
        dropoffLocation,
        setDropoffLocation: (loc) => dispatch(setDropoffLocation(loc)),
        fareAmount,
        distanceKm,
        ridesSearched,
        setRidesSearched: (val) => dispatch(setRidesSearched(val)),
        pickupCoords,
        setPickupCoords: (c) => dispatch(setPickupCoords(c)),
        dropoffCoords,
        setDropoffCoords: (c) => dispatch(setDropoffCoords(c)),
        mapPinMode,
        setMapPinMode: (m) => dispatch(setMapPinMode(m)),
        nearbyDrivers,
        recalculateNearbyDrivers,
        driverLiveLocation,
        fiveSecTickCount,
        currentRideOtp,
        driverEnteredOtp,
        setDriverEnteredOtp: (otp) => dispatch(setDriverEnteredOtpAction(otp)),
        otpError,
        setOtpError: (err) => dispatch(setOtpErrorAction(err)),
        verifyDriverOtp,
        driverInfo,
        driverSearchStep,
        startFindingDriver,
        cancelRide,
        completeRideManually,
        resetToNewBooking,
        swapLocations,
        bookings,
        addBooking: (b) => dispatch(addBookingAction(b)),
        isDriverOnline,
        setIsDriverOnline: (val) => {
          dispatch(setIsDriverOnlineAction(val));
          socketService.toggleDriverOnline(driverProfile.uuid || "d-amit-124", val);
        },
        driverTodayEarnings,
        driverTripsCompleted,
        hasIncomingRideRequest,
        setHasIncomingRideRequest: (val) =>
          dispatch(setHasIncomingRideRequestAction(val)),
        incomingRideDetails,
        driverActiveTab,
        setDriverActiveTab: (tab) => dispatch(setDriverActiveTabAction(tab)),
        driverTripState,
        setDriverTripState: (s) => dispatch(setDriverTripStateAction(s)),
        acceptIncomingRequest,
        rejectIncomingRequest,
        startDriverTripWithOtp,
        finishDriverTrip,
        riderProfile,
        driverProfile,
        userProfile,
        updateRiderProfile: (data) => dispatch(updateRiderProfileAction(data)),
        updateDriverProfile: (data) => dispatch(updateDriverProfileAction(data)),
      }}
    >
      {children}
    </TaxiiContext.Provider>
  );
};

export const useTaxii = () => {
  const context = useContext(TaxiiContext);
  if (!context) {
    throw new Error("useTaxii must be used within a TaxiiProvider");
  }
  return context;
};
