import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Rides } from '../../../domain/rides/rides.entity';
import { RideRepository } from '../../../infrastructure/repositories/ride.repository';
import { CancelRideController } from './cancel-ride.controller';
import { CancelRideHandler } from './cancel-ride.service';

@Module({
  imports: [TypeOrmModule.forFeature([Rides])],
  controllers: [CancelRideController],
  providers: [RideRepository, CancelRideHandler],
  exports: [CancelRideHandler],
})
export class CancelRideModule {}
