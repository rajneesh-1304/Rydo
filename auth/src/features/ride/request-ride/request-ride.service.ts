import { Injectable, NotFoundException } from '@nestjs/common';
import { RideRepository } from '../../../infrastructure/repositories/ride.repository';
import { UserRepository } from '../../../infrastructure/repositories/user-repository/user.repository';
import { RequestRideCommand } from './request-ride.command';
import { RideStatus } from '../../../domain/rides/ride-status.enum';

@Injectable()
export class RequestRideHandler {
  constructor(
    private readonly rideRepository: RideRepository,
    private readonly userRepository: UserRepository,
  ) {}

  public async handle(command: RequestRideCommand) {
    const { ride: rideData } = command;

    const rider = await this.userRepository.findUser(rideData.rider_id);
    if (!rider) {
      throw new NotFoundException(
        `Rider not found with identifier '${rideData.rider_id}'`,
      );
    }

    const newRide = this.rideRepository.create({
      rider_id: rider.uuid,
      pickup_address: rideData.pickup_address,
      pickup_latitude: String(rideData.pickup_latitude),
      pickup_longitude: String(rideData.pickup_longitude),
      dropoff_address: rideData.dropoff_address,
      dropoff_latitude: String(rideData.dropoff_latitude),
      dropoff_longitude: String(rideData.dropoff_longitude),
      distance: String(rideData.distance),
      fare: rideData.fare ? String(rideData.fare) : undefined,
      status: RideStatus.REQUESTED,
    });

    return await this.rideRepository.saveRide(newRide);
  }
}
