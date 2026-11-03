import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Coordinates } from "@/components/dashboard/map/types";

export interface IncomingRideDetails {
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
}

export type DriverTripState =
  | "idle"
  | "heading_to_pickup"
  | "at_pickup"
  | "in_progress"
  | "completed";

export interface DriverState {
  isDriverOnline: boolean;
  driverTodayEarnings: number;
  driverTripsCompleted: number;
  hasIncomingRideRequest: boolean;
  incomingRideDetails: IncomingRideDetails;
  driverActiveTab: "home" | "earnings" | "profile";
  driverTripState: DriverTripState;
  driverEnteredOtp: string;
  otpError: string;
}

const initialState: DriverState = {
  isDriverOnline: true,
  driverTodayEarnings: 1250,
  driverTripsCompleted: 6,
  hasIncomingRideRequest: true,
  incomingRideDetails: {
    fare: 220,
    distance: "4.8 km",
    duration: "12 min",
    passengerName: "Rajneesh Kumar",
    passengerRating: 4.9,
    passengerPhone: "+91 98765 12340",
    pickup: "Sector 17, Chandigarh",
    dropoff: "Elante Mall, Chandigarh",
    pickupCoords: { lat: 30.7414, lng: 76.7681 },
    dropoffCoords: { lat: 30.7055, lng: 76.8013 },
    rideId: "BK-9021",
  },
  driverActiveTab: "home",
  driverTripState: "idle",
  driverEnteredOtp: "",
  otpError: "",
};

export const driverSlice = createSlice({
  name: "driver",
  initialState,
  reducers: {
    setIsDriverOnline: (state, action: PayloadAction<boolean>) => {
      state.isDriverOnline = action.payload;
      if (!action.payload) {
        state.hasIncomingRideRequest = false;
      }
    },
    setHasIncomingRideRequest: (state, action: PayloadAction<boolean>) => {
      state.hasIncomingRideRequest = action.payload;
    },
    setIncomingRideDetails: (state, action: PayloadAction<Partial<IncomingRideDetails>>) => {
      state.incomingRideDetails = { ...state.incomingRideDetails, ...action.payload };
    },
    setDriverActiveTab: (state, action: PayloadAction<"home" | "earnings" | "profile">) => {
      state.driverActiveTab = action.payload;
    },
    setDriverTripState: (state, action: PayloadAction<DriverTripState>) => {
      state.driverTripState = action.payload;
    },
    setDriverEnteredOtp: (state, action: PayloadAction<string>) => {
      state.driverEnteredOtp = action.payload;
      state.otpError = "";
    },
    setOtpError: (state, action: PayloadAction<string>) => {
      state.otpError = action.payload;
    },
    acceptIncomingRequest: (state) => {
      state.hasIncomingRideRequest = false;
      state.driverTripState = "heading_to_pickup";
    },
    rejectIncomingRequest: (state) => {
      state.hasIncomingRideRequest = false;
    },
    tripStartedSuccess: (state) => {
      state.driverTripState = "in_progress";
      state.driverEnteredOtp = "";
      state.otpError = "";
    },
    finishDriverTrip: (state) => {
      state.driverTripState = "completed";
      state.driverTodayEarnings += state.incomingRideDetails.fare;
      state.driverTripsCompleted += 1;
    },
    resetDriverToIdle: (state) => {
      state.driverTripState = "idle";
      state.hasIncomingRideRequest = false;
    },
  },
});

export const {
  setIsDriverOnline,
  setHasIncomingRideRequest,
  setIncomingRideDetails,
  setDriverActiveTab,
  setDriverTripState,
  setDriverEnteredOtp,
  setOtpError,
  acceptIncomingRequest,
  rejectIncomingRequest,
  tripStartedSuccess,
  finishDriverTrip,
  resetDriverToIdle,
} = driverSlice.actions;

export default driverSlice.reducer;

