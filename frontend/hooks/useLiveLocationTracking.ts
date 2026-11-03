"use client";

import { useEffect, useRef } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setDriverLiveLocation, setRouteProgressRatio } from "@/store/slices/locationSlice";
import { socketService } from "@/services/socketService";
import { Coordinates } from "@/components/dashboard/map/types";

export const useLiveLocationTracking = () => {
  const dispatch = useAppDispatch();
  const appMode = useAppSelector((state) => state.user.appMode);
  const driverTripState = useAppSelector((state) => state.driver.driverTripState);
  const riderStep = useAppSelector((state) => state.ride.riderStep);
  const pickupCoords = useAppSelector((state) => state.ride.pickupCoords);
  const dropoffCoords = useAppSelector((state) => state.ride.dropoffCoords);
  const rideId = useAppSelector((state) => state.ride.rideId);
  const incomingDetails = useAppSelector((state) => state.driver.incomingRideDetails);

  const progressRef = useRef<number>(0.05);

  useEffect(() => {
    // Determine if vehicle is actively driving
    const isDriverDriving =
      driverTripState === "heading_to_pickup" || driverTripState === "in_progress";
    const isRiderWatchingTrip =
      riderStep === "driver_arriving" || riderStep === "trip_active";

    const isDrivingActive = isDriverDriving || isRiderWatchingTrip;

    if (!isDrivingActive) {
      progressRef.current = 0.05;
      return;
    }

    // Determine start and target coordinates for interpolation
    let startPoint: Coordinates = { lat: 30.7333, lng: 76.7794 };
    let endPoint: Coordinates = { lat: 30.7055, lng: 76.8013 };

    if (driverTripState === "heading_to_pickup" || riderStep === "driver_arriving") {
      startPoint = { lat: 30.7333, lng: 76.7794 }; // driver start base
      endPoint = incomingDetails?.pickupCoords || pickupCoords;
    } else if (driverTripState === "in_progress" || riderStep === "trip_active") {
      startPoint = incomingDetails?.pickupCoords || pickupCoords;
      endPoint = incomingDetails?.dropoffCoords || dropoffCoords || { lat: 30.7055, lng: 76.8013 };
    }

    const calculateCurrentStep = () => {
      // Advance by 4% to 6% every 5 seconds
      progressRef.current = Math.min(0.98, progressRef.current + 0.05);
      const t = progressRef.current;

      // Linear interpolation with realistic road curvature jitter
      const currentLat = startPoint.lat + (endPoint.lat - startPoint.lat) * t + Math.sin(t * Math.PI * 4) * 0.0006;
      const currentLng = startPoint.lng + (endPoint.lng - startPoint.lng) * t + Math.cos(t * Math.PI * 4) * 0.0006;

      // Heading calculation in degrees
      const dLng = endPoint.lng - startPoint.lng;
      const dLat = endPoint.lat - startPoint.lat;
      const heading = (Math.atan2(dLng, dLat) * 180) / Math.PI;

      const speed = Math.round(32 + Math.random() * 12); // 32 - 44 km/h

      const locationPayload = {
        lat: Number(currentLat.toFixed(5)),
        lng: Number(currentLng.toFixed(5)),
        heading: Math.round(heading),
        speed,
        timestamp: Date.now(),
      };

      // 1. Update Redux store
      dispatch(setDriverLiveLocation(locationPayload));
      dispatch(setRouteProgressRatio(t));

      // 2. Transmit via WebSockets to backend
      socketService.sendLocation({
        driverId: "d-amit-124",
        rideId: rideId || incomingDetails?.rideId || "BK-9021",
        lat: locationPayload.lat,
        lng: locationPayload.lng,
        heading: locationPayload.heading,
        speed: locationPayload.speed,
      });
    };

    // Immediate initial update
    calculateCurrentStep();

    // 5-second interval timer
    const intervalTimer = setInterval(() => {
      calculateCurrentStep();
    }, 5000);

    // Also register listener for server-driven live location request
    const socket = socketService.getSocket();
    const handleServerLocationRequest = () => {
      calculateCurrentStep();
    };

    socket?.on("request-live-location", handleServerLocationRequest);

    return () => {
      clearInterval(intervalTimer);
      socket?.off("request-live-location", handleServerLocationRequest);
    };
  }, [
    appMode,
    driverTripState,
    riderStep,
    pickupCoords,
    dropoffCoords,
    incomingDetails,
    rideId,
    dispatch,
  ]);
};

export default useLiveLocationTracking;

