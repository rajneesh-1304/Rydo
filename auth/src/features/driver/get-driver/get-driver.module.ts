import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Driver } from '../../../domain/driver/driver';
import { Vehicle } from '../../../domain/driver/vehicle';
import { DriverRepository } from '../../../infrastructure/repositories/driver.repository';
import { VehicleRepository } from '../../../infrastructure/repositories/vehicle.repository';
import { DriverGetController } from './get-driver.controller';
import { DriverGetHandler } from './get-driver.service';
import { Users } from 'src/domain/user/user';

@Module({
  imports: [TypeOrmModule.forFeature([Driver, Users, Vehicle])],
  controllers: [DriverGetController],
  providers: [DriverRepository, VehicleRepository, DriverGetHandler],
  exports: [DriverGetHandler],
})
export class DriverGetModule { }
