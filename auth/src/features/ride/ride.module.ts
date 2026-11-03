import { Module } from '@nestjs/common';
import { RequestRideModule } from './request-ride/request-ride.module';
import { AcceptRideModule } from './accept-ride/accept-ride.module';
import { CancelRideModule } from './cancel-ride/cancel-ride.module';
import { GetRideModule } from './get-ride/get-ride.module';

@Module({
  imports: [
    RequestRideModule,
    AcceptRideModule,
    CancelRideModule,
    GetRideModule,
  ],
  exports: [
    RequestRideModule,
    AcceptRideModule,
    CancelRideModule,
    GetRideModule,
  ],
})
export class RideFeatureModule {}
