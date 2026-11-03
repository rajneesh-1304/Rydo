"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { Coordinates, NearbyCab } from "@/components/dashboard/map/types";

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
  | "booking" // Screen 2: Choose pickup, drop, cab type
  | "finding_driver" // Screen 3: Looking for nearby drivers
  | "driver_arriving" // Screen 4: Driver on the way & OTP display
  | "trip_active" // Live on-trip navigation
  | "completed"; // Screen 5: Ride completed

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
  ridesSearched: boolean;
  setRidesSearched: (val: boolean) => void;

  // Map coordinates & click selection
  pickupCoords: Coordinates;
  setPickupCoords: (c: Coordinates) => void;
  dropoffCoords: Coordinates | null;
  setDropoffCoords: (c: Coordinates | null) => void;
  mapPinMode: "pickup" | "dropoff";
  setMapPinMode: (m: "pickup" | "dropoff") => void;

  // Nearby drivers algorithm
  nearbyDrivers: NearbyCab[];
  recalculateNearbyDrivers: (center: Coordinates) => void;

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
  };
  driverActiveTab: "home" | "earnings" | "profile";
  setDriverActiveTab: (tab: "home" | "earnings" | "profile") => void;
  driverTripState: "idle" | "heading_to_pickup" | "at_pickup" | "in_progress" | "completed";
  setDriverTripState: (s: "idle" | "heading_to_pickup" | "at_pickup" | "in_progress" | "completed") => void;
  acceptIncomingRequest: () => void;
  rejectIncomingRequest: () => void;
  startDriverTripWithOtp: (otp: string) => boolean;
  finishDriverTrip: () => void;

  // Separate Profiles
  riderProfile: RiderProfile;
  driverProfile: DriverProfile;
  userProfile: RiderProfile | DriverProfile;
}

const DEFAULT_CENTER: Coordinates = { lat: 30.7333, lng: 76.7794 }; // Chandigarh

const INITIAL_BOOKINGS: BookingItem[] = [
  {
    id: "BK-9021",
    cabType: "Sedan",
    price: 250,
    pickup: "Sector 22, Chandigarh",
    dropoff: "Elante Mall, Chandigarh",
    date: "28 Oct 2026",
    time: "10:42 AM",
    paymentMethod: "UPI",
    status: "Completed",
    driverName: "Amit Kumar",
    driverRating: 4.8,
    vehicleModel: "White Swift",
    vehicleNumber: "PB 01 AB 1234",
    otp: "4829",
  },
  {
    id: "BK-8842",
    cabType: "Auto",
    price: 120,
    pickup: "Sector 17, Chandigarh",
    dropoff: "Sukhna Lake, Chandigarh",
    date: "27 Oct 2026",
    time: "04:15 PM",
    paymentMethod: "Cash",
    status: "Completed",
    driverName: "Harpreet Singh",
    driverRating: 4.9,
    vehicleModel: "Bajaj RE Auto",
    vehicleNumber: "CH 01 TA 4421",
    otp: "7193",
  },
  {
    id: "BK-7619",
    cabType: "Bike",
    price: 80,
    pickup: "Sector 35, Chandigarh",
    dropoff: "Sector 43 ISBT, Chandigarh",
    date: "25 Oct 2026",
    time: "09:30 AM",
    paymentMethod: "UPI",
    status: "Completed",
    driverName: "Rahul Sharma",
    driverRating: 4.7,
    vehicleModel: "Honda Activa 6G",
    vehicleNumber: "PB 65 C 8901",
    otp: "3312",
  },
];

// Algorithm to calculate dynamic nearby drivers around coordinates
function generateNearbyDrivers(center: Coordinates): NearbyCab[] {
  const driverDefs = [
    { id: 1, type: "Sedan", driver: "Amit K.", angle: 30, radiusKm: 0.9 },
    { id: 2, type: "Auto", driver: "Harpreet S.", angle: 120, radiusKm: 0.6 },
    { id: 3, type: "Bike", driver: "Rahul S.", angle: 210, radiusKm: 0.4 },
    { id: 4, type: "Mini", driver: "Vikas V.", angle: 290, radiusKm: 1.3 },
    { id: 5, type: "Sedan", driver: "Gurpreet S.", angle: 160, radiusKm: 1.8 },
  ];

  return driverDefs.map((def) => {
    const latOffset = (def.radiusKm / 111) * Math.cos((def.angle * Math.PI) / 180);
    const lngOffset =
      (def.radiusKm / (111 * Math.cos((center.lat * Math.PI) / 180))) *
      Math.sin((def.angle * Math.PI) / 180);

    const etaMins = Math.max(2, Math.round((def.radiusKm / 22) * 60));

    return {
      id: def.id,
      lat: Number((center.lat + latOffset).toFixed(5)),
      lng: Number((center.lng + lngOffset).toFixed(5)),
      type: def.type,
      eta: `${etaMins} min`,
    };
  });
}

const TaxiiContext = createContext<TaxiiContextType | undefined>(undefined);

export const TaxiiProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [appMode, setAppMode] = useState<"rider" | "driver">("rider");
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(true);

  // Rider state
  const [riderStep, setRiderStep] = useState<RiderStep>("booking");
  const [selectedCab, setSelectedCab] = useState<
    "Bike" | "Auto" | "Mini" | "Sedan"
  >("Sedan");
  const [pickupLocation, setPickupLocation] = useState(
    "Sector 22, Chandigarh"
  );
  const [dropoffLocation, setDropoffLocation] = useState(
    "Elante Mall, Chandigarh"
  );
  const [ridesSearched, setRidesSearched] = useState<boolean>(false);
  const [driverSearchStep, setDriverSearchStep] = useState(0);

  // Map coordinates & click mode
  const [pickupCoords, setPickupCoords] = useState<Coordinates>(DEFAULT_CENTER);
  const [dropoffCoords, setDropoffCoords] = useState<Coordinates | null>({
    lat: 30.7055,
    lng: 76.8013,
  });
  const [mapPinMode, setMapPinMode] = useState<"pickup" | "dropoff">("dropoff");

  // Dynamic nearby drivers calculated via algorithm
  const [nearbyDrivers, setNearbyDrivers] = useState<NearbyCab[]>(() =>
    generateNearbyDrivers(DEFAULT_CENTER)
  );

  const recalculateNearbyDrivers = useCallback((center: Coordinates) => {
    setNearbyDrivers(generateNearbyDrivers(center));
  }, []);

  // OTP Verification State (generated for each ride)
  const [currentRideOtp, setCurrentRideOtp] = useState<string>("4829");
  const [driverEnteredOtp, setDriverEnteredOtp] = useState<string>("");
  const [otpError, setOtpError] = useState<string>("");

  // Driver details for rider view
  const driverInfo = {
    name: "Amit Kumar",
    rating: 4.8,
    rides: 124,
    vehicleModel: "White Swift",
    vehiclePlate: "PB 01 AB 1234",
    avatar: "/amit-driver.jpg",
    etaMinutes: 3,
    distanceKm: 1.2,
    phone: "+91 98123 45678",
  };

  const fareMap = {
    Bike: 80,
    Auto: 120,
    Mini: 180,
    Sedan: 250,
  };
  const fareAmount = fareMap[selectedCab];

  // Bookings history
  const [bookings, setBookings] = useState<BookingItem[]>(INITIAL_BOOKINGS);

  // Driver Experience state
  const [isDriverOnline, setIsDriverOnline] = useState<boolean>(true);
  const [driverTodayEarnings, setDriverTodayEarnings] = useState<number>(1250);
  const [driverTripsCompleted, setDriverTripsCompleted] = useState<number>(6);
  const [hasIncomingRideRequest, setHasIncomingRideRequest] =
    useState<boolean>(true);
  const [driverActiveTab, setDriverActiveTab] = useState<
    "home" | "earnings" | "profile"
  >("home");

  const [driverTripState, setDriverTripState] = useState<
    "idle" | "heading_to_pickup" | "at_pickup" | "in_progress" | "completed"
  >("idle");

  // Incoming ride request details for driver
  const incomingRideDetails = {
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
  };

  const [riderProfile, setRiderProfile] = useState<RiderProfile>({
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
  });

  const [driverProfile, setDriverProfile] = useState<DriverProfile>({
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
  });

  const updateRiderProfile = (data: Partial<RiderProfile>) => {
    setRiderProfile((prev) => {
      const updatedName =
        data.first_name && data.last_name
          ? `${data.first_name} ${data.last_name}`
          : data.name || prev.name;
      return {
        ...prev,
        ...data,
        name: updatedName,
      };
    });
  };

  const updateDriverProfile = (data: Partial<DriverProfile>) => {
    setDriverProfile((prev) => {
      const updatedName =
        data.first_name && data.last_name
          ? `${data.first_name} ${data.last_name}`
          : data.name || prev.name;
      const vehicleDetailsStr = data.vehicle
        ? `${data.vehicle.model} (${data.vehicle.color})`
        : prev.vehicleDetails;
      const vehiclePlateStr = data.vehicle
        ? data.vehicle.plate_number
        : prev.vehiclePlate;
      const licenseNumStr = data.vehicle
        ? data.vehicle.license_number
        : prev.licenseNumber;

      return {
        ...prev,
        ...data,
        name: updatedName,
        vehicleDetails: vehicleDetailsStr,
        vehiclePlate: vehiclePlateStr,
        licenseNumber: licenseNumStr,
      };
    });
  };

  const userProfile = appMode === "driver" ? driverProfile : riderProfile;

  // Automated search progression when in finding_driver step
  useEffect(() => {
    let t1: NodeJS.Timeout;
    let t2: NodeJS.Timeout;
    let t3: NodeJS.Timeout;

    if (riderStep === "finding_driver") {
      setDriverSearchStep(0);
      t1 = setTimeout(() => {
        setDriverSearchStep(1); // "Matching your ride"
      }, 1500);

      t2 = setTimeout(() => {
        setDriverSearchStep(2); // "Driver will be here soon"
      }, 3000);

      t3 = setTimeout(() => {
        // Generate new 4-digit ride OTP
        const newOtp = Math.floor(1000 + Math.random() * 9000).toString();
        setCurrentRideOtp(newOtp);
        setRiderStep("driver_arriving"); // transition to Screen 4
      }, 4200);
    }

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [riderStep]);

  const startFindingDriver = () => {
    setRiderStep("finding_driver");
  };

  const cancelRide = () => {
    setRiderStep("booking");
    setDriverTripState("idle");
    setHasIncomingRideRequest(false);
  };

  const completeRideManually = () => {
    setRiderStep("completed");
    const newRide: BookingItem = {
      id: `BK-${Math.floor(1000 + Math.random() * 9000)}`,
      cabType: selectedCab,
      price: fareAmount,
      pickup: pickupLocation,
      dropoff: dropoffLocation,
      date: "Today",
      time: "Just now",
      paymentMethod: "UPI",
      status: "Completed",
      driverName: driverInfo.name,
      driverRating: driverInfo.rating,
      vehicleModel: driverInfo.vehicleModel,
      vehicleNumber: driverInfo.vehiclePlate,
      otp: currentRideOtp,
    };
    setBookings((prev) => [newRide, ...prev]);
  };

  const resetToNewBooking = () => {
    setRiderStep("booking");
    setRidesSearched(false);
  };

  const swapLocations = () => {
    setPickupLocation(dropoffLocation);
    setDropoffLocation(pickupLocation);
    const tempCoords = pickupCoords;
    if (dropoffCoords) {
      setPickupCoords(dropoffCoords);
      setDropoffCoords(tempCoords);
      recalculateNearbyDrivers(dropoffCoords);
    }
  };

  const addBooking = (booking: BookingItem) => {
    setBookings((prev) => [booking, ...prev]);
  };

  // Driver actions
  const acceptIncomingRequest = () => {
    setHasIncomingRideRequest(false);
    setDriverTripState("heading_to_pickup");
  };

  const rejectIncomingRequest = () => {
    setHasIncomingRideRequest(false);
  };

  // Driver OTP Verification to start trip
  const verifyDriverOtp = (otpInput: string): boolean => {
    if (otpInput.trim() === currentRideOtp) {
      setOtpError("");
      setDriverTripState("in_progress");
      setRiderStep("trip_active");
      return true;
    } else {
      setOtpError("Invalid OTP! Please ask the passenger for the 4-digit code.");
      return false;
    }
  };

  const startDriverTripWithOtp = (otp: string) => {
    return verifyDriverOtp(otp);
  };

  const finishDriverTrip = () => {
    setDriverTripState("completed");
    setDriverTodayEarnings((prev) => prev + incomingRideDetails.fare);
    setDriverTripsCompleted((prev) => prev + 1);
    setRiderStep("completed");

    setTimeout(() => {
      setDriverTripState("idle");
    }, 2500);
  };

  return (
    <TaxiiContext.Provider
      value={{
        appMode,
        setAppMode,
        isLoggedIn,
        setIsLoggedIn,
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
        driverEnteredOtp,
        setDriverEnteredOtp,
        otpError,
        setOtpError,
        verifyDriverOtp,
        driverInfo,
        driverSearchStep,
        startFindingDriver,
        cancelRide,
        completeRideManually,
        resetToNewBooking,
        swapLocations,
        bookings,
        addBooking,
        isDriverOnline,
        setIsDriverOnline,
        driverTodayEarnings,
        driverTripsCompleted,
        hasIncomingRideRequest,
        setHasIncomingRideRequest,
        incomingRideDetails,
        driverActiveTab,
        setDriverActiveTab,
        driverTripState,
        setDriverTripState,
        acceptIncomingRequest,
        rejectIncomingRequest,
        startDriverTripWithOtp,
        finishDriverTrip,
        riderProfile,
        driverProfile,
        userProfile,
        updateRiderProfile,
        updateDriverProfile,
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
