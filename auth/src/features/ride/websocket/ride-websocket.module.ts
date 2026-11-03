import { Module } from '@nestjs/common';
import { RideWebsocketGateway } from './ride-websocket.gateway';
import { RideRepository } from '../../../infrastructure/repositories/ride.repository';
import { DriverRepository } from '../../../infrastructure/repositories/driver.repository';
import { UserRepository } from '../../../infrastructure/repositories/user-repository/user.repository';

@Module({
  providers: [RideWebsocketGateway, RideRepository, DriverRepository, UserRepository],
  exports: [RideWebsocketGateway],
})
export class RideWebsocketModule {}

