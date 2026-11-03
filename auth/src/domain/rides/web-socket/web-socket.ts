import { WebSocketGateway, WebSocketServer, SubscribeMessage, MessageBody } from '@nestjs/websockets';
import { Server } from 'socket.io';
import { DriverRepository } from '../../../infrastructure/repositories/driver.repository';
import { RideRepository } from '../../../infrastructure/repositories/ride.repository';
import { Optional } from '@nestjs/common';

@WebSocketGateway({ cors: { origin: '*' } })
export class EventGateway {
  constructor(
    @Optional() private readonly rideRepository?: RideRepository,
    @Optional() private readonly driverRepository?: DriverRepository,
  ) {}

  @WebSocketServer()
  server: Server;

  @SubscribeMessage('create-ride')
  async createRide(@MessageBody() data: any) {
    if (this.rideRepository) {
      const ride = this.rideRepository.create(data);
      await this.rideRepository.save(ride);
      this.server.emit('ride-created', ride);
      return ride;
    }
    this.server.emit('ride-created', data);
    return data;
  }

  @SubscribeMessage('ride-created')
  async searchDriver(@MessageBody() data: any) {
    const { pickup_latitude, pickup_longitude } = data;
    if (this.driverRepository) {
      const driver = await this.driverRepository.findNearestDriver(
        pickup_latitude,
        pickup_longitude,
      );
      this.server.emit('driver-found', driver);
      return driver;
    }
  }

  @SubscribeMessage('request-ride')
  handleMessage(@MessageBody() data: any) {
    this.server.emit('ride-request-accepted', data);
    this.server.emit('ride-request-rejected', data);
  }
}
