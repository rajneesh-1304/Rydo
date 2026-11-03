import { Injectable, NotFoundException } from '@nestjs/common';
import { RideRepository } from '../../../infrastructure/repositories/ride.repository';
import { GetRideQuery } from './get-ride.query';
import { Rides } from '../../../domain/rides/rides.entity';

@Injectable()
export class GetRideHandler {
  constructor(private readonly rideRepository: RideRepository) {}

  public async handle(query: GetRideQuery): Promise<Rides> {
    const { uuid } = query;
    const ride = await this.rideRepository.findRide(uuid);
    if (!ride) {
      throw new NotFoundException(`Ride not found with identifier '${uuid}'`);
    }
    return ride;
  }
}
