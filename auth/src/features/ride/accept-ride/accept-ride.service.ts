import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { RideRepository } from '../../../infrastructure/repositories/ride.repository';
import { DriverRepository } from '../../../infrastructure/repositories/driver.repository';
import { AcceptRideCommand } from './accept-ride.command';
import { RideStatus } from '../../../domain/rides/ride-status.enum';

@Injectable()
export class AcceptRideHandler {
  constructor(
    private readonly rideRepository: RideRepository,
    private readonly driverRepository: DriverRepository,
  ) {}

  public async handle(command: AcceptRideCommand) {
    const { rideUuid, driverId } = command;

    const ride = await this.rideRepository.findRide(rideUuid);
    if (!ride) {
      throw new NotFoundException(`Ride not found with identifier '${rideUuid}'`);
    }

    if (ride.status !== RideStatus.REQUESTED) {
      throw new ConflictException(
        `Ride cannot be accepted. Current status is '${ride.status}'`,
      );
    }

    const driver = await this.driverRepository.findDriver(driverId);
    if (!driver) {
      throw new NotFoundException(
        `Driver not found with identifier '${driverId}'`,
      );
    }

    ride.driver_id = driver.uuid;
    ride.status = RideStatus.ACCEPTED;
    ride.accepted_at = new Date();

    return await this.rideRepository.saveRide(ride);
  }
}
