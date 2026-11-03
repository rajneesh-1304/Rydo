import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Coordinates } from "@/components/dashboard/map/types";

export interface BookingItem {
  id: string;
  cabType: "Bike" | "Auto" | "Mini" | "Sedan";
  price: number;
  pickup: string;
  dropoff: string;
  date: string;
  time: string;
  paymentMethod: string;
  status: "Completed" | "In Progress" | "Cancelled";
  driverName: string;
  driverRating: number;
  vehicleModel: string;
  vehicleNumber: string;
  otp?: string;
}

export type RiderStep =
  | "booking"
  | "finding_driver"
  | "driver_arriving"
  | "trip_active"
  | "completed";

export interface DriverInfo {
  name: string;
  rating: number;
  rides: number;
  vehicleModel: string;
  vehiclePlate: string;
  avatar: string;
  etaMinutes: number;
  distanceKm: number;
  phone: string;
}

export interface RideState {
  riderStep: RiderStep;
  selectedCab: "Bike" | "Auto" | "Mini" | "Sedan";
  pickupLocation: string;
  dropoffLocation: string;
  pickupCoords: Coordinates;
  dropoffCoords: Coordinates | null;
  mapPinMode: "pickup" | "dropoff";
  fareAmount: number;
  distanceKm: number;
  ridesSearched: boolean;
  driverSearchStep: number;
  currentRideOtp: string;
  rideId: string;
  driverInfo: DriverInfo;
  bookings: BookingItem[];
}

export function calculateDistanceKm(c1: Coordinates, c2: Coordinates | null): number {
  if (!c2) return 4.5;
  const R = 6371; // Earth radius in km
  const dLat = ((c2.lat - c1.lat) * Math.PI) / 180;
  const dLng = ((c2.lng - c1.lng) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((c1.lat * Math.PI) / 180) *
      Math.cos((c2.lat * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.max(1, Math.round(R * c * 10) / 10);
}

export function calculateCabFare(cab: "Bike" | "Auto" | "Mini" | "Sedan", distanceKm: number): number {
  switch (cab) {
    case "Bike":
      return Math.max(40, Math.round(25 + distanceKm * 12));
    case "Auto":
      return Math.max(60, Math.round(35 + distanceKm * 15));
    case "Mini":
      return Math.max(90, Math.round(50 + distanceKm * 20));
    case "Sedan":
    default:
      return Math.max(130, Math.round(70 + distanceKm * 25));
  }
}

const DEFAULT_CENTER: Coordinates = { lat: 30.7333, lng: 76.7794 };
const DEFAULT_DROPOFF: Coordinates = { lat: 30.7055, lng: 76.8013 };
const initialDist = calculateDistanceKm(DEFAULT_CENTER, DEFAULT_DROPOFF);

const initialState: RideState = {
  riderStep: "booking",
  selectedCab: "Sedan",
  pickupLocation: "Sector 22, Chandigarh",
  dropoffLocation: "Elante Mall, Chandigarh",
  pickupCoords: DEFAULT_CENTER,
  dropoffCoords: DEFAULT_DROPOFF,
  mapPinMode: "dropoff",
  fareAmount: calculateCabFare("Sedan", initialDist),
  distanceKm: initialDist,
  ridesSearched: false,
  driverSearchStep: 0,
  currentRideOtp: "4829",
  rideId: "BK-9021",
  driverInfo: {
    name: "Amit Kumar",
    rating: 4.85,
    rides: 124,
    vehicleModel: "Maruti Suzuki Swift",
    vehiclePlate: "PB 01 AB 1234",
    avatar: "/amit-driver.jpg",
    etaMinutes: 3,
    distanceKm: 1.2,
    phone: "+91 98123 45678",
  },
  bookings: [],
};

export const rideSlice = createSlice({
  name: "ride",
  initialState,
  reducers: {
    setRiderStep: (state, action: PayloadAction<RiderStep>) => {
      state.riderStep = action.payload;
    },
    setSelectedCab: (state, action: PayloadAction<"Bike" | "Auto" | "Mini" | "Sedan">) => {
      state.selectedCab = action.payload;
      state.fareAmount = calculateCabFare(action.payload, state.distanceKm);
    },
    setPickupLocation: (state, action: PayloadAction<string>) => {
      state.pickupLocation = action.payload;
    },
    setDropoffLocation: (state, action: PayloadAction<string>) => {
      state.dropoffLocation = action.payload;
    },
    setPickupCoords: (state, action: PayloadAction<Coordinates>) => {
      state.pickupCoords = action.payload;
      state.distanceKm = calculateDistanceKm(action.payload, state.dropoffCoords);
      state.fareAmount = calculateCabFare(state.selectedCab, state.distanceKm);
    },
    setDropoffCoords: (state, action: PayloadAction<Coordinates | null>) => {
      state.dropoffCoords = action.payload;
      state.distanceKm = calculateDistanceKm(state.pickupCoords, action.payload);
      state.fareAmount = calculateCabFare(state.selectedCab, state.distanceKm);
    },
    setMapPinMode: (state, action: PayloadAction<"pickup" | "dropoff">) => {
      state.mapPinMode = action.payload;
    },
    setRidesSearched: (state, action: PayloadAction<boolean>) => {
      state.ridesSearched = action.payload;
    },
    setDriverSearchStep: (state, action: PayloadAction<number>) => {
      state.driverSearchStep = action.payload;
    },
    setCurrentRideOtp: (state, action: PayloadAction<string>) => {
      state.currentRideOtp = action.payload;
    },
    setRideId: (state, action: PayloadAction<string>) => {
      state.rideId = action.payload;
    },
    setDriverInfo: (state, action: PayloadAction<Partial<DriverInfo>>) => {
      state.driverInfo = { ...state.driverInfo, ...action.payload };
    },
    swapLocations: (state) => {
      const tempLoc = state.pickupLocation;
      state.pickupLocation = state.dropoffLocation;
      state.dropoffLocation = tempLoc;

      if (state.dropoffCoords) {
        const tempCoords = state.pickupCoords;
        state.pickupCoords = state.dropoffCoords;
        state.dropoffCoords = tempCoords;
        state.distanceKm = calculateDistanceKm(state.pickupCoords, state.dropoffCoords);
        state.fareAmount = calculateCabFare(state.selectedCab, state.distanceKm);
      }
    },
    startFindingDriver: (state) => {
      state.riderStep = "finding_driver";
      state.driverSearchStep = 0;
      state.rideId = `BK-${Math.floor(1000 + Math.random() * 9000)}`;
      state.currentRideOtp = Math.floor(1000 + Math.random() * 9000).toString();
    },
    rideAcceptedFromSocket: (
      state,
      action: PayloadAction<{ driver?: Partial<DriverInfo>; otp?: string; rideId?: string }>
    ) => {
      if (action.payload.driver) {
        state.driverInfo = { ...state.driverInfo, ...action.payload.driver };
      }
      if (action.payload.otp) {
        state.currentRideOtp = action.payload.otp;
      }
      if (action.payload.rideId) {
        state.rideId = action.payload.rideId;
      }
      state.riderStep = "driver_arriving";
    },
    tripStartedFromSocket: (state) => {
      state.riderStep = "trip_active";
    },
    cancelRide: (state) => {
      state.riderStep = "booking";
    },
    completeRideManually: (state) => {
      state.riderStep = "completed";
      const newRide: BookingItem = {
        id: state.rideId || `BK-${Math.floor(1000 + Math.random() * 9000)}`,
        cabType: state.selectedCab,
        price: state.fareAmount,
        pickup: state.pickupLocation,
        dropoff: state.dropoffLocation,
        date: "Today",
        time: "Just now",
        paymentMethod: "UPI",
        status: "Completed",
        driverName: state.driverInfo.name,
        driverRating: state.driverInfo.rating,
        vehicleModel: state.driverInfo.vehicleModel,
        vehicleNumber: state.driverInfo.vehiclePlate,
        otp: state.currentRideOtp,
      };
      state.bookings = [newRide, ...state.bookings];
    },
    resetToNewBooking: (state) => {
      state.riderStep = "booking";
      state.ridesSearched = false;
    },
    addBooking: (state, action: PayloadAction<BookingItem>) => {
      state.bookings = [action.payload, ...state.bookings];
    },
    setBookings: (state, action: PayloadAction<BookingItem[]>) => {
      state.bookings = action.payload;
    },
  },
});

export const {
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
  setRideId,
  setDriverInfo,
  swapLocations,
  startFindingDriver,
  rideAcceptedFromSocket,
  tripStartedFromSocket,
  cancelRide,
  completeRideManually,
  resetToNewBooking,
  addBooking,
  setBookings,
} = rideSlice.actions;

export default rideSlice.reducer;
