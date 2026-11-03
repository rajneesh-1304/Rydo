import { Injectable, NotFoundException } from '@nestjs/common';
import { DriverRepository } from '../../../infrastructure/repositories/driver.repository';
import { Driver } from '../../../domain/driver/driver';
import { DriverGetQuery } from './get-driver.query';

@Injectable()
export class DriverGetHandler {
  constructor(private readonly driverRepository: DriverRepository) { }

  public async handle(query: DriverGetQuery) {
    const { uuid } = query;
    const driver = await this.driverRepository.findDriver(uuid);
    if (!driver) {
      throw new NotFoundException(`Driver not found`);
    }
    return driver;
  }
}
