import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DriverRepository } from '../../../infrastructure/repositories/driver.repository';
import { VehicleRepository } from '../../../infrastructure/repositories/vehicle.repository';
import { UserRepository } from '../../../infrastructure/repositories/user-repository/user.repository';
import { Driver } from '../../../domain/driver/driver';
import { DriverUpdateCommand } from './update.command';

@Injectable()
export class DriverUpdateHandler {
  constructor(
    private readonly driverRepository: DriverRepository,
    private readonly vehicleRepository: VehicleRepository,
    private readonly userRepository: UserRepository,
  ) {}

  public async handle(command: DriverUpdateCommand): Promise<Driver> {
    const { uuid, data } = command;
    const driver = await this.driverRepository.findDriver(uuid);
    if (!driver) {
      throw new NotFoundException(
        `Driver not found with identifier '${uuid}'`,
      );
    }

    const { vehicle: vehicleDto, status, ...userData } = data;

    if (driver.user) {
      if (userData.email && userData.email !== driver.user.email) {
        const emailExists = await this.userRepository.findUserByEmail(
          userData.email,
        );
        if (emailExists) {
          throw new ConflictException('Email is already in use');
        }
      }

      if (userData.phone && userData.phone !== driver.user.phone) {
        const phoneExists = await this.userRepository.existsByPhone(
          userData.phone,
        );
        if (phoneExists) {
          throw new ConflictException('Phone number is already in use');
        }
      }

      Object.assign(driver.user, userData);
      await this.userRepository.save(driver.user);
    }

    if (status) {
      driver.status = status;
    }

    if (vehicleDto) {
      if (driver.vehicle) {
        Object.assign(driver.vehicle, vehicleDto);
        await this.vehicleRepository.saveVehicleDetails(driver.vehicle);
      } else {
        const newVehicle = this.vehicleRepository.create({
          ...vehicleDto,
          driver,
        });
        driver.vehicle = await this.vehicleRepository.saveVehicleDetails(
          newVehicle,
        );
      }
    }

    return this.driverRepository.saveDriverDetails(driver);
  }
}
