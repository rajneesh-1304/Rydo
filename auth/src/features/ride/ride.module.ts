import { Module } from '@nestjs/common';
import { RequestRideModule } from './request-ride/request-ride.module';
import { AcceptRideModule } from './accept-ride/accept-ride.module';
import { CancelRideModule } from './cancel-ride/cancel-ride.module';
import { GetRideModule } from './get-ride/get-ride.module';
import { RideWebsocketModule } from './websocket/ride-websocket.module';

@Module({
  imports: [
    RequestRideModule,
    AcceptRideModule,
    CancelRideModule,
    GetRideModule,
    RideWebsocketModule,
  ],
  exports: [
    RequestRideModule,
    AcceptRideModule,
    CancelRideModule,
    GetRideModule,
    RideWebsocketModule,
  ],
})
export class RideFeatureModule {}
