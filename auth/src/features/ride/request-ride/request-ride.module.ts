import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Rides } from '../../../domain/rides/rides.entity';
import { Users } from '../../../domain/user/user';
import { RideRepository } from '../../../infrastructure/repositories/ride.repository';
import { UserRepository } from '../../../infrastructure/repositories/user-repository/user.repository';
import { RequestRideController } from './request-ride.controller';
import { RequestRideHandler } from './request-ride.service';

@Module({
  imports: [TypeOrmModule.forFeature([Rides, Users])],
  controllers: [RequestRideController],
  providers: [RideRepository, UserRepository, RequestRideHandler],
  exports: [RequestRideHandler],
})
export class RequestRideModule {}
