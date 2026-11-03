import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Rides } from '../../../domain/rides/rides.entity';
import { RideRepository } from '../../../infrastructure/repositories/ride.repository';
import { GetRideController } from './get-ride.controller';
import { GetRideHandler } from './get-ride.service';

@Module({
  imports: [TypeOrmModule.forFeature([Rides])],
  controllers: [GetRideController],
  providers: [RideRepository, GetRideHandler],
  exports: [GetRideHandler],
})
export class GetRideModule {}
