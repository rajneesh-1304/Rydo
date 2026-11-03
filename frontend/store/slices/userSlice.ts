import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface VehicleDetails {
  model: string;
  plate_number: string;
  color: string;
  license_number: string;
  license_expiration_date: string;
  insurance_number: string;
  insurance_expiration_date: string;
  car_image?: string;
}

export interface RiderProfile {
  uuid?: string;
  name: string;
  first_name?: string;
  last_name?: string;
  gender?: string;
  dob?: string;
  image?: string;
  role?: string;
  phone: string;
  email: string;
  rating: number;
  totalRides: number;
  completionRate: number;
  avatar: string;
  walletBalance: number;
  savedPlaces: Array<{ label: string; address: string }>;
}

export interface DriverProfile {
  uuid?: string;
  name: string;
  first_name?: string;
  last_name?: string;
  gender?: string;
  dob?: string;
  image?: string;
  role?: string;
  phone: string;
  email: string;
  rating: number;
  totalRides: number;
  completionRate: number;
  acceptanceRate: number;
  avatar: string;
  vehicleDetails: string;
  vehiclePlate: string;
  licenseNumber: string;
  totalEarnings: number;
  vehicle?: VehicleDetails;
}

export interface UserState {
  appMode: "rider" | "driver";
  isLoggedIn: boolean;
  riderProfile: RiderProfile;
  driverProfile: DriverProfile;
}

const initialState: UserState = {
  appMode: "rider",
  isLoggedIn: true,
  riderProfile: {
    name: "Rajneesh Kumar",
    first_name: "Rajneesh",
    last_name: "Kumar",
    gender: "Male",
    role: "Rider",
    phone: "+91 98765 12340",
    email: "rajneesh@taxii.in",
    rating: 4.9,
    totalRides: 38,
    completionRate: 100,
    avatar: "/amit-driver.jpg",
    walletBalance: 450,
    savedPlaces: [
      { label: "Home", address: "Sector 22, Chandigarh" },
      { label: "Work", address: "Rajiv Gandhi IT Park, Chandigarh" },
    ],
  },
  driverProfile: {
    name: "Amit Kumar",
    first_name: "Amit",
    last_name: "Kumar",
    gender: "Male",
    role: "Driver",
    phone: "+91 98123 45678",
    email: "amit.kumar@taxii.in",
    rating: 4.8,
    totalRides: 124,
    completionRate: 98,
    acceptanceRate: 96,
    avatar: "/amit-driver.jpg",
    vehicleDetails: "Maruti Suzuki Swift (White)",
    vehiclePlate: "PB 01 AB 1234",
    licenseNumber: "DL-0420190012345",
    totalEarnings: 34850,
    vehicle: {
      model: "Maruti Suzuki Swift",
      plate_number: "PB 01 AB 1234",
      color: "White",
      license_number: "DL-0420190012345",
      license_expiration_date: "2029-12-31",
      insurance_number: "INS-9921827",
      insurance_expiration_date: "2027-05-15",
      car_image: "/car.png",
    },
  },
};

export const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setAppMode: (state, action: PayloadAction<"rider" | "driver">) => {
      state.appMode = action.payload;
    },
    setIsLoggedIn: (state, action: PayloadAction<boolean>) => {
      state.isLoggedIn = action.payload;
    },
    updateRiderProfile: (state, action: PayloadAction<Partial<RiderProfile>>) => {
      const updatedName =
        action.payload.first_name && action.payload.last_name
          ? `${action.payload.first_name} ${action.payload.last_name}`
          : action.payload.name || state.riderProfile.name;
      state.riderProfile = {
        ...state.riderProfile,
        ...action.payload,
        name: updatedName,
      };
    },
    updateDriverProfile: (state, action: PayloadAction<Partial<DriverProfile>>) => {
      const updatedName =
        action.payload.first_name && action.payload.last_name
          ? `${action.payload.first_name} ${action.payload.last_name}`
          : action.payload.name || state.driverProfile.name;
      const vehicleDetailsStr = action.payload.vehicle
        ? `${action.payload.vehicle.model} (${action.payload.vehicle.color})`
        : state.driverProfile.vehicleDetails;
      const vehiclePlateStr = action.payload.vehicle
        ? action.payload.vehicle.plate_number
        : state.driverProfile.vehiclePlate;
      const licenseNumStr = action.payload.vehicle
        ? action.payload.vehicle.license_number
        : state.driverProfile.licenseNumber;

      state.driverProfile = {
        ...state.driverProfile,
        ...action.payload,
        name: updatedName,
        vehicleDetails: vehicleDetailsStr,
        vehiclePlate: vehiclePlateStr,
        licenseNumber: licenseNumStr,
      };
    },
  },
});

export const {
  setAppMode,
  setIsLoggedIn,
  updateRiderProfile,
  updateDriverProfile,
} = userSlice.actions;

export default userSlice.reducer;

