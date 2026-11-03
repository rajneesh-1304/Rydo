import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Driver } from '../../domain/driver/driver';

@Injectable()
export class DriverRepository extends Repository<Driver> {
  constructor(private readonly dataSource: DataSource) {
    super(Driver, dataSource.createEntityManager());
  }

  public async findById(id: number): Promise<Driver | null> {
    return this.findOne({
      where: { id },
      relations: {
        vehicle: true,
        user: true,
      },
    });
  }

  public async findDriver(uuid: string) {
    return this.findOne({
      where: { uuid },
      relations: {
        vehicle: true,
        user: true,
      },
    });
  }

  public async saveDriverDetails(data: Partial<Driver>): Promise<Driver> {
    return this.save(data);
  }
}
