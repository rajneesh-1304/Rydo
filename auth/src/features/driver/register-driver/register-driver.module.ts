import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Driver } from '../../../domain/driver/driver';
import { Vehicle } from '../../../domain/driver/vehicle';
import { Users } from '../../../domain/user/user';
import { DriverRepository } from '../../../infrastructure/repositories/driver.repository';
import { VehicleRepository } from '../../../infrastructure/repositories/vehicle.repository';
import { UserRepository } from '../../../infrastructure/repositories/user-repository/user.repository';
import { DriverSaveController } from './register-driver.controller';
import { DriverSaveHandler } from './register-driver.service';

@Module({
  imports: [TypeOrmModule.forFeature([Driver, Vehicle, Users])],
  controllers: [DriverSaveController],
  providers: [
    DriverRepository,
    VehicleRepository,
    UserRepository,
    DriverSaveHandler,
  ],
  exports: [DriverSaveHandler],
})
export class DriverSaveModule { }
