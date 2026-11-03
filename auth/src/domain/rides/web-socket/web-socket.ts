import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { DriverRepository } from 'src/infrastructure/repositories/driver.repository';
import { RideRepository } from 'src/infrastructure/repositories/ride.repository';

@WebSocketGateway({ namespace: 'events'})
export class EventGateway {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly rideRepository: RideRepository,
    private readonly driverRepository: DriverRepository
  ) {}

  @WebSocketServer()
  server: Server;

  @SubscribeMessage('create-ride')
  async createRide(@MessageBody() data: any) {
    const { rider_id, pickup_address, pickup_latitude, pickup_longitude, dropoff_address, dropoff_latitude, dropoff_longitude, distance, fare } = data;
    const ride = this.rideRepository.create({
      rider_id,
      pickup_address,
      pickup_latitude,
      pickup_longitude,
      dropoff_address,
      dropoff_latitude,
      dropoff_longitude,
      distance,
      fare,
    });
    await this.rideRepository.save(ride);
    this.server.emit('ride-created', ride);
  }

  @SubscribeMessage('ride-created')
  async searchDriver(@MessageBody() data: any) {
    const { rider_id, pickup_latitude, pickup_longitude } = data;
    const driver = await this.driverRepository.findNearestDriver(
      pickup_latitude,
      pickup_longitude
    );
    this.
  }

  @SubscribeMessage('request-ride')
  handleMessage(@MessageBody() data: string) {
    this.server.emit('ride-request-accepted', data);
    this.server.emit('ride-request-rejected', data);
  }
}