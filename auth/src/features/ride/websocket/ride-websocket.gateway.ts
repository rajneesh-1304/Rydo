import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Logger, Optional } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { RideRepository } from '../../../infrastructure/repositories/ride.repository';
import { DriverRepository } from '../../../infrastructure/repositories/driver.repository';
import { UserRepository } from '../../../infrastructure/repositories/user-repository/user.repository';
import { RideStatus } from '../../../domain/rides/ride-status.enum';

export interface LocationPayload {
  driverId: string;
  rideId?: string;
  lat: number;
  lng: number;
  heading?: number;
  speed?: number;
  timestamp?: number;
}

export interface ChatMessagePayload {
  id?: string;
  rideId: string;
  senderId: string;
  senderName: string;
  senderRole: 'rider' | 'driver';
  text: string;
  timestamp?: string;
}

export interface RideRequestPayload {
  rideId?: string;
  riderId: string;
  riderName: string;
  riderPhone?: string;
  pickupAddress: string;
  pickupCoords: { lat: number; lng: number };
  dropoffAddress: string;
  dropoffCoords: { lat: number; lng: number };
  cabType: 'Bike' | 'Auto' | 'Mini' | 'Sedan';
  fare: number;
  distance?: string;
  duration?: string;
}

export interface AcceptRidePayload {
  rideId: string;
  driverId: string;
  driverName: string;
  driverRating?: number;
  vehicleModel?: string;
  vehiclePlate?: string;
  phone?: string;
  avatar?: string;
  etaMinutes?: number;
}

export interface ActiveRideState {
  id: string;
  riderId: string;
  riderName: string;
  riderPhone?: string;
  driverId?: string;
  driverName?: string;
  driverPhone?: string;
  vehicleModel?: string;
  vehiclePlate?: string;
  driverRating?: number;
  pickupAddress: string;
  pickupCoords: { lat: number; lng: number };
  dropoffAddress: string;
  dropoffCoords: { lat: number; lng: number };
  fare: number;
  cabType: string;
  status: RideStatus;
  otp: string;
  driverLocation?: { lat: number; lng: number; heading?: number; speed?: number };
  createdAt: number;
}

@WebSocketGateway({
  cors: {
    origin: true,
    credentials: true,
  },
})
export class RideWebsocketGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  private readonly logger = new Logger(RideWebsocketGateway.name);

  @WebSocketServer()
  server: Server;

  // Real-time tracking and state
  private readonly activeRides = new Map<string, ActiveRideState>();
  private readonly driverSockets = new Map<string, string>(); // driverId -> socketId
  private readonly riderSockets = new Map<string, string>(); // riderId -> socketId
  private readonly onlineDrivers = new Map<
    string,
    { socketId: string; location?: { lat: number; lng: number }; status: string }
  >();
  private readonly chatHistories = new Map<string, ChatMessagePayload[]>(); // rideId -> messages

  // 5-second location ping timer for active trips
  private locationRequestInterval: NodeJS.Timeout | null = null;

  constructor(
    @Optional() private readonly rideRepository?: RideRepository,
    @Optional() private readonly driverRepository?: DriverRepository,
    @Optional() private readonly userRepository?: UserRepository,
  ) {}

  afterInit(server: Server) {
    this.logger.log('Ride WebSocket Gateway Initialized successfully');

    // Server-side live location request loop every 5 seconds for all active trips
    this.locationRequestInterval = setInterval(() => {
      this.pollLiveLocationsEvery5Seconds();
    }, 5000);
  }

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);
    client.emit('connected', {
      status: 'ok',
      socketId: client.id,
      timestamp: Date.now(),
    });
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client disconnected: ${client.id}`);
    for (const [driverId, sockId] of this.driverSockets.entries()) {
      if (sockId === client.id) {
        this.driverSockets.delete(driverId);
        this.onlineDrivers.delete(driverId);
        break;
      }
    }
    for (const [riderId, sockId] of this.riderSockets.entries()) {
      if (sockId === client.id) {
        this.riderSockets.delete(riderId);
        break;
      }
    }
  }

  /**
   * Periodic 5-second trigger: Requests live GPS location from all drivers driving active trips
   */
  private pollLiveLocationsEvery5Seconds() {
    if (!this.server) return;

    for (const [rideId, ride] of this.activeRides.entries()) {
      if (
        ride.status === RideStatus.ACCEPTED ||
        ride.status === RideStatus.ARRIVING ||
        ride.status === RideStatus.IN_PROGRESS
      ) {
        if (ride.driverId && this.driverSockets.has(ride.driverId)) {
          const driverSocketId = this.driverSockets.get(ride.driverId);
          this.server.to(driverSocketId!).emit('request-live-location', {
            rideId,
            status: ride.status,
            intervalMs: 5000,
            timestamp: Date.now(),
          });
        }

        if (ride.driverLocation) {
          this.server.to(`ride_${rideId}`).emit('location-updated', {
            driverId: ride.driverId,
            rideId,
            lat: ride.driverLocation.lat,
            lng: ride.driverLocation.lng,
            heading: ride.driverLocation.heading ?? 0,
            speed: ride.driverLocation.speed ?? 35,
            timestamp: Date.now(),
          });
        }
      }
    }
  }

  /**
   * Driver toggles online/offline status - updates PostgreSQL and broadcasts to fleet
   */
  @SubscribeMessage('driver-toggle-online')
  async handleDriverToggleOnline(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { driverId: string; isOnline: boolean },
  ) {
    this.logger.log(`Driver ${data?.driverId} toggled is_online: ${data?.isOnline}`);

    if (this.driverRepository && data?.driverId) {
      try {
        await this.driverRepository.update(
          { uuid: data.driverId },
          { is_online: !!data.isOnline },
        );
      } catch (err) {
        this.logger.warn(`Could not update driver online status: ${err.message}`);
      }
    }

    if (data?.driverId) {
      if (data.isOnline) {
        this.onlineDrivers.set(data.driverId, {
          socketId: client.id,
          status: 'online',
        });
      } else {
        this.onlineDrivers.delete(data.driverId);
      }
    }

    // Broadcast status update
    this.server.emit('driver-status-changed', {
      driverId: data?.driverId,
      isOnline: !!data?.isOnline,
    });

    // Broadcast fresh nearby drivers list from PostgreSQL to all connected riders
    if (this.driverRepository) {
      try {
        const updatedList = await this.driverRepository.findNearbyDrivers(
          30.7333,
          76.7794,
          20,
        );
        this.server.emit('nearby-drivers-list', updatedList);
      } catch {}
    }

    return { success: true, isOnline: !!data?.isOnline };
  }

  /**
   * Fetch live nearby drivers from real database based on coordinates
   */
  @SubscribeMessage('get-nearby-drivers')
  async handleGetNearbyDrivers(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { lat: number; lng: number; cabType?: string; radiusKm?: number },
  ) {
    const lat = Number(data?.lat) || 30.7333;
    const lng = Number(data?.lng) || 76.7794;
    let nearbyDrivers: any[] = [];

    if (this.driverRepository) {
      nearbyDrivers = await this.driverRepository.findNearbyDrivers(
        lat,
        lng,
        data?.radiusKm || 12,
        data?.cabType,
      );
    }

    client.emit('nearby-drivers-list', nearbyDrivers);
    return nearbyDrivers;
  }

  /**
   * Fetch ride history from PostgreSQL
   */
  @SubscribeMessage('get-ride-history')
  async handleGetRideHistory(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { riderId?: string },
  ) {
    if (this.rideRepository) {
      const riderId = data?.riderId || 'u-rajneesh-38';
      const rides = await this.rideRepository.find({
        where: [{ rider_id: riderId }, { rider_id: 'rider-38' }],
        order: { id: 'DESC' },
        take: 20,
      });

      const formatted = rides.map((r) => ({
        id: r.uuid,
        cabType: 'Sedan',
        price: Number(r.fare) || 220,
        pickup: r.pickup_address,
        dropoff: r.dropoff_address,
        date: r.created_at
          ? new Date(r.created_at).toLocaleDateString('en-IN', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            })
          : 'Today',
        time: r.created_at
          ? new Date(r.created_at).toLocaleTimeString('en-IN', {
              hour: '2-digit',
              minute: '2-digit',
            })
          : 'Just now',
        paymentMethod: 'UPI',
        status:
          r.status === RideStatus.COMPLETED
            ? 'Completed'
            : r.status === RideStatus.CANCELLED
            ? 'Cancelled'
            : 'In Progress',
        driverName: 'Amit Kumar',
        driverRating: 4.85,
        vehicleModel: 'Maruti Suzuki Swift',
        vehicleNumber: 'PB 01 AB 1234',
        otp: r.otp || '4829',
      }));

      client.emit('ride-history', formatted);
      return formatted;
    }
    return [];
  }

  /**
   * Client registers their role (rider or driver) and identity
   */
  @SubscribeMessage('register')
  handleRegister(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    data: { userId: string; role: 'rider' | 'driver'; name?: string },
  ) {
    if (!data?.userId) return;

    if (data.role === 'driver') {
      this.driverSockets.set(data.userId, client.id);
      this.onlineDrivers.set(data.userId, {
        socketId: client.id,
        status: 'online',
      });
      client.join('drivers_channel');
      this.logger.log(`Driver registered: ${data.userId} (${client.id})`);
    } else {
      this.riderSockets.set(data.userId, client.id);
      client.join('riders_channel');
      this.logger.log(`Rider registered: ${data.userId} (${client.id})`);
    }

    client.emit('registered', { success: true, role: data.role, userId: data.userId });
  }

  /**
   * Join a specific ride room for real-time room-scoped events
   */
  @SubscribeMessage('join-ride')
  handleJoinRide(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { rideId: string },
  ) {
    if (!data?.rideId) return;
    const room = `ride_${data.rideId}`;
    client.join(room);
    this.logger.log(`Socket ${client.id} joined room ${room}`);

    const existingRide = this.activeRides.get(data.rideId);
    if (existingRide) {
      client.emit('ride-state-sync', existingRide);
    }

    // Send chat history if exists
    const chatHistory = this.chatHistories.get(data.rideId) || [];
    client.emit('chat-history', chatHistory);
  }

  /**
   * Rider requests a new ride
   */
  @SubscribeMessage('request-ride')
  async handleRequestRide(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: RideRequestPayload,
  ) {
    this.logger.log(`Ride requested by ${data.riderName} (${data.cabType})`);

    const rideId = data.rideId || `BK-${Math.floor(1000 + Math.random() * 9000)}`;
    const otp = Math.floor(1000 + Math.random() * 9000).toString();

    // Query closest real driver from PostgreSQL
    let closestDriver: any = null;
    if (this.driverRepository) {
      closestDriver = await this.driverRepository.findNearestDriver(
        data.pickupCoords.lat,
        data.pickupCoords.lng,
        data.cabType,
      );
    }

    const assignedDriverName = closestDriver?.user
      ? `${closestDriver.user.first_name} ${closestDriver.user.last_name}`
      : 'Amit Kumar';
    const assignedDriverPhone = closestDriver?.user?.phone || '+91 98123 45678';
    const assignedVehicleModel = closestDriver?.vehicle?.model || 'Maruti Suzuki Swift';
    const assignedVehiclePlate = closestDriver?.vehicle?.plate_number || 'PB 01 AB 1234';

    const dbRiderId = data.riderId === 'rider-38' || !data.riderId ? 'u-rajneesh-38' : data.riderId;

    const rideState: ActiveRideState = {
      id: rideId,
      riderId: dbRiderId,
      riderName: data.riderName,
      riderPhone: data.riderPhone || '+91 98765 12340',
      driverId: closestDriver?.uuid || 'd-amit-124',
      driverName: assignedDriverName,
      driverPhone: assignedDriverPhone,
      vehicleModel: assignedVehicleModel,
      vehiclePlate: assignedVehiclePlate,
      driverRating: Number(closestDriver?.rating) || 4.85,
      pickupAddress: data.pickupAddress,
      pickupCoords: data.pickupCoords,
      dropoffAddress: data.dropoffAddress,
      dropoffCoords: data.dropoffCoords,
      fare: data.fare,
      cabType: data.cabType,
      status: RideStatus.REQUESTED,
      otp,
      createdAt: Date.now(),
    };

    this.activeRides.set(rideId, rideState);
    client.join(`ride_${rideId}`);

    // Ensure rider user exists in PostgreSQL to satisfy foreign key
    if (this.userRepository) {
      try {
        let riderUser = await this.userRepository.findByUuid(dbRiderId);
        if (!riderUser) {
          riderUser = this.userRepository.create({
            uuid: dbRiderId,
            first_name: data.riderName?.split(' ')[0] || 'Rider',
            last_name: data.riderName?.split(' ').slice(1).join(' ') || 'User',
            email: `${dbRiderId}@taxii.in`,
            phone: data.riderPhone || '+91 98765 12340',
            is_verified: true,
          });
          await this.userRepository.saveUser(riderUser);
        }
      } catch (err) {
        this.logger.warn(`Could not ensure rider existence: ${err.message}`);
      }
    }

    // Persist to PostgreSQL database
    try {
      if (this.rideRepository) {
        await this.rideRepository.save({
          uuid: rideId,
          rider_id: dbRiderId,
          driver_id: closestDriver?.uuid || 'd-amit-124',
          pickup_address: data.pickupAddress,
          pickup_latitude: String(data.pickupCoords.lat),
          pickup_longitude: String(data.pickupCoords.lng),
          dropoff_address: data.dropoffAddress,
          dropoff_latitude: String(data.dropoffCoords.lat),
          dropoff_longitude: String(data.dropoffCoords.lng),
          distance: data.distance || '4.5',
          fare: String(data.fare),
          status: RideStatus.REQUESTED,
          otp,
        });
      }
    } catch (err) {
      this.logger.warn(`Could not persist ride to PostgreSQL: ${err.message}`);
    }

    // Acknowledge to rider
    client.emit('ride-created', {
      rideId,
      status: RideStatus.REQUESTED,
      otp,
      message: 'Searching for nearby drivers in fleet...',
    });

    // Broadcast incoming ride request to all online drivers
    const incomingData = {
      rideId,
      fare: data.fare,
      distance: data.distance || '4.8 km',
      duration: data.duration || '12 min',
      passengerName: data.riderName,
      passengerRating: 4.9,
      passengerPhone: data.riderPhone || '+91 98765 12340',
      pickup: data.pickupAddress,
      dropoff: data.dropoffAddress,
      pickupCoords: data.pickupCoords,
      dropoffCoords: data.dropoffCoords,
      cabType: data.cabType,
    };

    this.server.to('drivers_channel').emit('incoming-ride-request', incomingData);
    this.server.emit('incoming-ride-request', incomingData);

    return { success: true, rideId, otp };
  }

  /**
   * Driver accepts ride
   */
  @SubscribeMessage('accept-ride')
  async handleAcceptRide(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: AcceptRidePayload,
  ) {
    this.logger.log(`Driver ${data.driverName} accepted ride ${data.rideId}`);

    let ride = this.activeRides.get(data.rideId);
    if (!ride) {
      ride = {
        id: data.rideId,
        riderId: 'rider-38',
        riderName: 'Rajneesh Kumar',
        pickupAddress: 'Sector 22, Chandigarh',
        pickupCoords: { lat: 30.7333, lng: 76.7794 },
        dropoffAddress: 'Elante Mall, Chandigarh',
        dropoffCoords: { lat: 30.7055, lng: 76.8013 },
        fare: 220,
        cabType: 'Sedan',
        status: RideStatus.ACCEPTED,
        otp: Math.floor(1000 + Math.random() * 9000).toString(),
        createdAt: Date.now(),
      };
      this.activeRides.set(data.rideId, ride);
    }

    ride.status = RideStatus.ACCEPTED;
    ride.driverId = data.driverId;
    ride.driverName = data.driverName;
    ride.driverPhone = data.phone || '+91 98123 45678';
    ride.driverRating = data.driverRating || 4.85;
    ride.vehicleModel = data.vehicleModel || 'Maruti Suzuki Swift';
    ride.vehiclePlate = data.vehiclePlate || 'PB 01 AB 1234';

    client.join(`ride_${data.rideId}`);

    // Update PostgreSQL
    try {
      if (this.rideRepository) {
        await this.rideRepository.update(
          { uuid: data.rideId },
          {
            driver_id: data.driverId,
            status: RideStatus.ACCEPTED,
            accepted_at: new Date().toISOString(),
          },
        );
      }
    } catch (err) {
      this.logger.warn(`PostgreSQL update skipped: ${err.message}`);
    }

    const payload = {
      rideId: data.rideId,
      status: RideStatus.ACCEPTED,
      driver: {
        name: ride.driverName,
        rating: ride.driverRating,
        rides: 124,
        vehicleModel: ride.vehicleModel,
        vehiclePlate: ride.vehiclePlate,
        avatar: data.avatar || '/amit-driver.jpg',
        phone: ride.driverPhone,
        etaMinutes: data.etaMinutes || 3,
        distanceKm: 1.2,
      },
      otp: ride.otp,
    };

    this.server.to(`ride_${data.rideId}`).emit('ride-accepted', payload);
    this.server.emit('ride-accepted', payload);

    return { success: true, otp: ride.otp };
  }

  /**
   * Driver updates live GPS location (sent every 5 seconds while driving)
   */
  @SubscribeMessage('update-location')
  async handleUpdateLocation(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: LocationPayload,
  ) {
    if (!data || !data.lat || !data.lng) return;

    if (data.rideId && this.activeRides.has(data.rideId)) {
      const ride = this.activeRides.get(data.rideId)!;
      ride.driverLocation = {
        lat: data.lat,
        lng: data.lng,
        heading: data.heading,
        speed: data.speed,
      };

      this.server.to(`ride_${data.rideId}`).emit('location-updated', {
        driverId: data.driverId,
        rideId: data.rideId,
        lat: data.lat,
        lng: data.lng,
        heading: data.heading ?? 0,
        speed: data.speed ?? 30,
        timestamp: data.timestamp || Date.now(),
      });
    }

    // Update driver coordinates in database / memory
    if (data.driverId && this.driverRepository) {
      try {
        await this.driverRepository.update(
          { uuid: data.driverId },
          {
            current_latitude: String(data.lat),
            current_longitude: String(data.lng),
          },
        );
      } catch {}
    }

    return { success: true, timestamp: Date.now() };
  }

  /**
   * Driver verifies OTP provided by rider to begin the drive
   */
  @SubscribeMessage('verify-otp')
  async handleVerifyOtp(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { rideId: string; otp: string; driverId?: string },
  ) {
    this.logger.log(`Verifying OTP ${data.otp} for ride ${data.rideId}`);

    const ride = this.activeRides.get(data.rideId);
    const expectedOtp = ride?.otp || '4829';

    if (data.otp && data.otp.trim() === expectedOtp.trim()) {
      if (ride) {
        ride.status = RideStatus.IN_PROGRESS;
      }

      try {
        if (this.rideRepository) {
          await this.rideRepository.update(
            { uuid: data.rideId },
            {
              status: RideStatus.IN_PROGRESS,
              started_at: new Date().toISOString(),
            },
          );
        }
      } catch (err) {
        this.logger.warn(`PostgreSQL update skipped: ${err.message}`);
      }

      const response = {
        success: true,
        rideId: data.rideId,
        status: RideStatus.IN_PROGRESS,
        message: 'OTP verified successfully! Drive has started.',
      };

      this.server.to(`ride_${data.rideId}`).emit('trip-started', response);
      this.server.emit('trip-started', response);

      return response;
    } else {
      const errorResponse = {
        success: false,
        message: 'Invalid OTP! Please ask passenger for the 4-digit code.',
      };
      client.emit('otp-error', errorResponse);
      return errorResponse;
    }
  }

  /**
   * In-trip messaging / Chat between rider and driver
   */
  @SubscribeMessage('send-message')
  handleSendMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: ChatMessagePayload,
  ) {
    this.logger.log(`Message in ride ${data.rideId} from ${data.senderRole}: ${data.text}`);

    const message: ChatMessagePayload = {
      id: `MSG-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      rideId: data.rideId,
      senderId: data.senderId,
      senderName: data.senderName,
      senderRole: data.senderRole,
      text: data.text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    // Store in chat history
    if (!this.chatHistories.has(data.rideId)) {
      this.chatHistories.set(data.rideId, []);
    }
    this.chatHistories.get(data.rideId)!.push(message);

    this.server.to(`ride_${data.rideId}`).emit('receive-message', message);
    this.server.emit('receive-message', message);

    return { success: true, message };
  }

  /**
   * Driver completes trip at dropoff location
   */
  @SubscribeMessage('complete-trip')
  async handleCompleteTrip(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { rideId: string; fare?: number; driverId?: string },
  ) {
    this.logger.log(`Trip completed for ride ${data.rideId}`);

    const ride = this.activeRides.get(data.rideId);
    if (ride) {
      ride.status = RideStatus.COMPLETED;
    }

    try {
      if (this.rideRepository) {
        await this.rideRepository.update(
          { uuid: data.rideId },
          {
            status: RideStatus.COMPLETED,
            completed_at: new Date().toISOString(),
          },
        );
      }
      if (this.driverRepository && data.driverId) {
        await this.driverRepository.increment({ uuid: data.driverId }, 'total_rides', 1);
      }
    } catch (err) {
      this.logger.warn(`PostgreSQL update skipped: ${err.message}`);
    }

    const payload = {
      rideId: data.rideId,
      status: RideStatus.COMPLETED,
      fare: data.fare || ride?.fare || 220,
      timestamp: Date.now(),
      message: 'Trip completed safely! Thank you for choosing Taxii.',
    };

    this.server.to(`ride_${data.rideId}`).emit('trip-completed', payload);
    this.server.emit('trip-completed', payload);

    return { success: true };
  }

  /**
   * Ride cancellation by either passenger or driver
   */
  @SubscribeMessage('cancel-ride')
  async handleCancelRide(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    data: { rideId: string; reason?: string; cancelledBy?: 'rider' | 'driver' },
  ) {
    this.logger.log(`Ride ${data.rideId} cancelled by ${data.cancelledBy}`);

    const ride = this.activeRides.get(data.rideId);
    if (ride) {
      ride.status = RideStatus.CANCELLED;
    }

    try {
      if (this.rideRepository) {
        await this.rideRepository.update(
          { uuid: data.rideId },
          {
            status: RideStatus.CANCELLED,
            cancelled_at: new Date().toISOString(),
          },
        );
      }
    } catch (err) {
      this.logger.warn(`PostgreSQL update skipped: ${err.message}`);
    }

    const payload = {
      rideId: data.rideId,
      status: RideStatus.CANCELLED,
      reason: data.reason || 'Cancelled by user',
      cancelledBy: data.cancelledBy || 'rider',
    };

    this.server.to(`ride_${data.rideId}`).emit('ride-cancelled', payload);
    this.server.emit('ride-cancelled', payload);

    return { success: true };
  }
}
