import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Rides } from '../../../domain/rides/rides.entity';
import { Driver } from '../../../domain/driver/driver';
import { RideRepository } from '../../../infrastructure/repositories/ride.repository';
import { DriverRepository } from '../../../infrastructure/repositories/driver.repository';
import { AcceptRideController } from './accept-ride.controller';
import { AcceptRideHandler } from './accept-ride.service';

@Module({
  imports: [TypeOrmModule.forFeature([Rides, Driver])],
  controllers: [AcceptRideController],
  providers: [RideRepository, DriverRepository, AcceptRideHandler],
  exports: [AcceptRideHandler],
})
export class AcceptRideModule {}
