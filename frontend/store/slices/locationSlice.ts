import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Coordinates, NearbyCab } from "@/components/dashboard/map/types";

export interface DriverLiveLocation {
  lat: number;
  lng: number;
  heading: number;
  speed: number;
  timestamp: number;
}

export interface LocationState {
  driverLiveLocation: DriverLiveLocation;
  nearbyDrivers: NearbyCab[];
  isLiveTracking: boolean;
  lastPingTimestamp: number;
  routeProgressRatio: number; // 0 to 1
  fiveSecTickCount: number;
}

const DEFAULT_CENTER: Coordinates = { lat: 30.7333, lng: 76.7794 };

const initialState: LocationState = {
  driverLiveLocation: {
    lat: DEFAULT_CENTER.lat,
    lng: DEFAULT_CENTER.lng,
    heading: 45,
    speed: 38,
    timestamp: Date.now(),
  },
  nearbyDrivers: [], // Real drivers from PostgreSQL only
  isLiveTracking: false,
  lastPingTimestamp: Date.now(),
  routeProgressRatio: 0,
  fiveSecTickCount: 0,
};

export const locationSlice = createSlice({
  name: "location",
  initialState,
  reducers: {
    setDriverLiveLocation: (
      state,
      action: PayloadAction<Partial<DriverLiveLocation>>
    ) => {
      state.driverLiveLocation = {
        ...state.driverLiveLocation,
        ...action.payload,
        timestamp: Date.now(),
      };
      state.lastPingTimestamp = Date.now();
      state.fiveSecTickCount += 1;
    },
    recalculateNearbyDrivers: (state, _action: PayloadAction<Coordinates>) => {
      // Coordinates updated; real nearby drivers are fetched via socketService.getNearbyDrivers
    },
    setNearbyDrivers: (state, action: PayloadAction<NearbyCab[]>) => {
      state.nearbyDrivers = action.payload;
    },
    setIsLiveTracking: (state, action: PayloadAction<boolean>) => {
      state.isLiveTracking = action.payload;
    },
    setRouteProgressRatio: (state, action: PayloadAction<number>) => {
      state.routeProgressRatio = Math.min(1, Math.max(0, action.payload));
    },
    resetLiveTracking: (state) => {
      state.routeProgressRatio = 0;
      state.fiveSecTickCount = 0;
      state.isLiveTracking = false;
    },
  },
});

export const {
  setDriverLiveLocation,
  recalculateNearbyDrivers,
  setNearbyDrivers,
  setIsLiveTracking,
  setRouteProgressRatio,
  resetLiveTracking,
} = locationSlice.actions;

export default locationSlice.reducer;
