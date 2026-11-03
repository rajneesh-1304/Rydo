import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { RideRepository } from '../../../infrastructure/repositories/ride.repository';
import { CancelRideCommand } from './cancel-ride.command';
import { RideStatus } from '../../../domain/rides/ride-status.enum';

@Injectable()
export class CancelRideHandler {
  constructor(private readonly rideRepository: RideRepository) {}

  public async handle(command: CancelRideCommand) {
    const { rideUuid } = command;

    const ride = await this.rideRepository.findRide(rideUuid);
    if (!ride) {
      throw new NotFoundException(`Ride not found with identifier '${rideUuid}'`);
    }

    if (
      ride.status === RideStatus.COMPLETED ||
      ride.status === RideStatus.CANCELLED
    ) {
      throw new BadRequestException(
        `Cannot cancel ride with current status '${ride.status}'`,
      );
    }

    ride.status = RideStatus.CANCELLED;
    ride.cancelled_at = new Date();

    return await this.rideRepository.saveRide(ride);
  }
}
