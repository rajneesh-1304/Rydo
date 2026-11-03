import { ConflictException, Injectable } from '@nestjs/common';
import { DriverRepository } from '../../../infrastructure/repositories/driver.repository';
import { VehicleRepository } from '../../../infrastructure/repositories/vehicle.repository';
import { UserRepository } from '../../../infrastructure/repositories/user-repository/user.repository';
import { Role } from '../../../domain/user/enums/role.enum';
import { Status } from '../../../domain/user/enums/status.enum';
import { SaveDriverCommand } from './register-driver.command';

@Injectable()
export class DriverSaveHandler {
  constructor(
    private readonly driverRepository: DriverRepository,
    private readonly vehicleRepository: VehicleRepository,
    private readonly userRepository: UserRepository,
  ) { }

  public async handle(command: SaveDriverCommand) {
    const { vehicle: vehicleDto, ...driverData } = command.driver;

    let user = await this.userRepository.findUserByEmail(driverData.email);
    if (!user) {
      if (driverData.phone) {
        const phoneExists = await this.userRepository.existsByPhone(
          driverData.phone,
        );
        if (phoneExists) {
          throw new ConflictException('Phone number is already in use');
        }
      }

      user = await this.userRepository.saveUser({
        ...driverData,
        role: Role.DRIVER,
        status: driverData.status || Status.ACTIVE,
      });
    } else {
      user.role = Role.DRIVER;
      await this.userRepository.save(user);
    }

    let driver = await this.driverRepository.findOne({
      where: { user: { id: user.id } },
      relations: { vehicle: true, user: true },
    });

    if (!driver) {
      driver = this.driverRepository.create({
        uuid: `d-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
        user,
        status: driverData.status || Status.ACTIVE,
        is_online: true,
        rating: 4.85,
        total_rides: 120,
        current_latitude: '30.7333',
        current_longitude: '76.7794',
      });
      driver = await this.driverRepository.save(driver);
    } else {
      driver.is_online = true;
      await this.driverRepository.save(driver);
    }

    if (vehicleDto) {
      const cabType = (vehicleDto as any).cab_type || 'Sedan';
      if (driver.vehicle) {
        Object.assign(driver.vehicle, { ...vehicleDto, cab_type: cabType });
        await this.vehicleRepository.saveVehicleDetails(driver.vehicle);
      } else {
        if (vehicleDto.plate_number) {
          const plateExists = await this.vehicleRepository.findByPlateNumber(
            vehicleDto.plate_number,
          );
          if (plateExists) {
            throw new ConflictException(
              'Vehicle plate number is already registered',
            );
          }
        }

        const newVehicle = this.vehicleRepository.create({
          uuid: `v-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`,
          ...vehicleDto,
          cab_type: cabType,
          driver,
        });
        driver.vehicle = await this.vehicleRepository.saveVehicleDetails(
          newVehicle,
        );
      }
    }

    return await this.driverRepository.findDriver(driver.uuid);
  }
}

