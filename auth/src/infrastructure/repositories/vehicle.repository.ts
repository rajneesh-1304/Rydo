import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Vehicle } from '../../domain/driver/vehicle';

@Injectable()
export class VehicleRepository extends Repository<Vehicle> {
  constructor(private readonly dataSource: DataSource) {
    super(Vehicle, dataSource.createEntityManager());
  }

  public async findByPlateNumber(plate_number: string): Promise<Vehicle | null> {
    return this.findOne({
      where: { plate_number },
    });
  }

  public async findByLicenseNumber(license_number: string): Promise<Vehicle | null> {
    return this.findOne({
      where: { license_number },
    });
  }

  public async findByInsuranceNumber(insurance_number: string): Promise<Vehicle | null> {
    return this.findOne({
      where: { insurance_number },
    });
  }

  public async saveVehicleDetails(data: Partial<Vehicle>): Promise<Vehicle> {
    return this.save(data);
  }
}
