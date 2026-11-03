import { io, Socket } from "socket.io-client";
import { store } from "@/store/store";
import {
  rideAcceptedFromSocket,
  tripStartedFromSocket,
  completeRideManually,
  cancelRide,
  setBookings,
} from "@/store/slices/rideSlice";
import {
  setHasIncomingRideRequest,
  setIncomingRideDetails,
  tripStartedSuccess,
  finishDriverTrip,
  setOtpError,
  resetDriverToIdle,
} from "@/store/slices/driverSlice";
import {
  setDriverLiveLocation,
  setNearbyDrivers,
} from "@/store/slices/locationSlice";
import { addMessage } from "@/store/slices/chatSlice";
import { NearbyCab } from "@/components/dashboard/map/types";

class SocketService {
  private socket: Socket | null = null;
  private isConnected = false;
  private backendUrl =
    process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:5001";

  public init() {
    if (this.socket && this.isConnected) return this.socket;

    try {
      this.socket = io(this.backendUrl, {
        transports: ["websocket", "polling"],
        reconnection: true,
        reconnectionAttempts: 10,
        reconnectionDelay: 2000,
        timeout: 5000,
      });

      this.setupListeners();
    } catch (err) {
      console.warn("Socket initialization error:", err);
    }

    return this.socket;
  }

  private setupListeners() {
    if (!this.socket) return;

    this.socket.on("connect", () => {
      this.isConnected = true;
      console.log("Connected to Taxii WebSocket Gateway (Socket ID:", this.socket?.id, ")");
      
      // Auto register current active role
      const state = store.getState();
      const role = state.user.appMode;
      const userId = role === "driver" ? "d-amit-124" : "u-rajneesh-38";
      const name = role === "driver" ? state.user.driverProfile.name : state.user.riderProfile.name;
      
      this.registerClient(userId, role, name);

      // Fetch nearby drivers and ride history on connection
      const pickupCoords = state.ride.pickupCoords;
      this.getNearbyDrivers(pickupCoords.lat, pickupCoords.lng);
      this.getRideHistory(userId);
    });

    this.socket.on("disconnect", () => {
      this.isConnected = false;
      console.log("Disconnected from Taxii WebSocket Gateway");
    });

    // Nearby drivers list from database
    this.socket.on("nearby-drivers-list", (drivers: any[]) => {
      if (Array.isArray(drivers)) {
        const mapped: NearbyCab[] = drivers.map((d: any, idx: number) => ({
          id: d.id || idx + 1,
          lat: Number(d.lat),
          lng: Number(d.lng),
          type: d.type || "Sedan",
          eta: d.eta || "3 min",
        }));
        store.dispatch(setNearbyDrivers(mapped));
      }
    });

    // Driver online status updates
    this.socket.on("driver-status-changed", (data: any) => {
      console.log("Driver status changed event:", data);
    });

    // Ride history list from database
    this.socket.on("ride-history", (rides: any[]) => {
      if (Array.isArray(rides) && rides.length > 0) {
        store.dispatch(setBookings(rides));
      }
    });

    // In-bound ride request (for drivers)
    this.socket.on("incoming-ride-request", (data: any) => {
      console.log("Incoming ride request received:", data);
      store.dispatch(
        setIncomingRideDetails({
          fare: data.fare || 220,
          distance: data.distance || "4.8 km",
          duration: data.duration || "12 min",
          passengerName: data.passengerName || "Passenger",
          passengerRating: data.passengerRating || 4.9,
          passengerPhone: data.passengerPhone || "+91 98765 12340",
          pickup: data.pickup || "Pickup Location",
          dropoff: data.dropoff || "Dropoff Location",
          pickupCoords: data.pickupCoords || { lat: 30.7414, lng: 76.7681 },
          dropoffCoords: data.dropoffCoords || { lat: 30.7055, lng: 76.8013 },
          rideId: data.rideId,
        })
      );
      store.dispatch(setHasIncomingRideRequest(true));
    });

    // Ride accepted (for riders)
    this.socket.on("ride-accepted", (data: any) => {
      console.log("Ride accepted received:", data);
      store.dispatch(
        rideAcceptedFromSocket({
          driver: data.driver,
          otp: data.otp,
          rideId: data.rideId,
        })
      );
    });

    // Live 5-second location stream update
    this.socket.on("location-updated", (data: any) => {
      if (data && data.lat && data.lng) {
        store.dispatch(
          setDriverLiveLocation({
            lat: data.lat,
            lng: data.lng,
            heading: data.heading ?? 45,
            speed: data.speed ?? 35,
            timestamp: data.timestamp || Date.now(),
          })
        );
      }
    });

    // Trip started (OTP verified)
    this.socket.on("trip-started", (data: any) => {
      console.log("Trip started received:", data);
      store.dispatch(tripStartedFromSocket());
      store.dispatch(tripStartedSuccess());
    });

    // Trip completed
    this.socket.on("trip-completed", (data: any) => {
      console.log("Trip completed received:", data);
      store.dispatch(completeRideManually());
      store.dispatch(finishDriverTrip());
    });

    // Ride cancelled
    this.socket.on("ride-cancelled", (data: any) => {
      console.log("Ride cancelled received:", data);
      store.dispatch(cancelRide());
      store.dispatch(resetDriverToIdle());
    });

    // Real-time in-ride chat message
    this.socket.on("receive-message", (data: any) => {
      console.log("Chat message received:", data);
      store.dispatch(
        addMessage({
          id: data.id || `msg-${Date.now()}`,
          sender: data.senderName || data.senderRole,
          senderRole: data.senderRole,
          text: data.text,
          time: data.timestamp || new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          rideId: data.rideId,
        })
      );
    });

    // OTP verification error
    this.socket.on("otp-error", (data: any) => {
      store.dispatch(setOtpError(data.message || "Invalid OTP code"));
    });
  }

  public registerClient(userId: string, role: "rider" | "driver", name?: string) {
    if (!this.socket) this.init();
    this.socket?.emit("register", { userId, role, name });
  }

  public joinRide(rideId: string) {
    if (!this.socket) this.init();
    this.socket?.emit("join-ride", { rideId });
  }

  public requestRide(payload: any) {
    if (!this.socket) this.init();
    this.socket?.emit("request-ride", payload);
  }

  public acceptRide(payload: any) {
    if (!this.socket) this.init();
    this.socket?.emit("accept-ride", payload);
  }

  public sendLocation(location: {
    driverId: string;
    rideId?: string;
    lat: number;
    lng: number;
    heading?: number;
    speed?: number;
  }) {
    if (!this.socket) this.init();
    this.socket?.emit("update-location", {
      ...location,
      timestamp: Date.now(),
    });
  }

  public verifyOtp(rideId: string, otp: string, driverId?: string) {
    if (!this.socket) this.init();
    this.socket?.emit("verify-otp", { rideId, otp, driverId });
  }

  public sendMessage(payload: {
    rideId: string;
    senderId: string;
    senderName: string;
    senderRole: "rider" | "driver";
    text: string;
  }) {
    if (!this.socket) this.init();
    this.socket?.emit("send-message", payload);
  }

  public completeTrip(rideId: string, fare?: number, driverId?: string) {
    if (!this.socket) this.init();
    this.socket?.emit("complete-trip", { rideId, fare, driverId });
  }

  public cancelRide(rideId: string, reason?: string, cancelledBy?: "rider" | "driver") {
    if (!this.socket) this.init();
    this.socket?.emit("cancel-ride", { rideId, reason, cancelledBy });
  }

  public toggleDriverOnline(driverId: string, isOnline: boolean) {
    if (!this.socket) this.init();
    this.socket?.emit("driver-toggle-online", { driverId, isOnline });
  }

  public getNearbyDrivers(lat: number, lng: number, cabType?: string) {
    if (!this.socket) this.init();
    this.socket?.emit("get-nearby-drivers", { lat, lng, cabType, radiusKm: 15 });
  }

  public getRideHistory(riderId?: string) {
    if (!this.socket) this.init();
    this.socket?.emit("get-ride-history", { riderId: riderId || "u-rajneesh-38" });
  }

  public getSocket(): Socket | null {
    return this.socket;
  }
}

export const socketService = new SocketService();
export default socketService;
