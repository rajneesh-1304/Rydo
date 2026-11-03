import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Rides } from '../../domain/rides/rides.entity';
import { RideStatus } from '../../domain/rides/ride-status.enum';

@Injectable()
export class RideRepository extends Repository<Rides> {
  constructor(private readonly dataSource: DataSource) {
    super(Rides, dataSource.createEntityManager());
  }

  public async findRide(uuid: string): Promise<Rides | null> {
    return this.findOne({
      where: { uuid },
      relations: {
        rider: true,
        driver: {
          user: true,
          vehicle: true,
        },
      },
    });
  }

  public async findById(id: number): Promise<Rides | null> {
    return this.findOne({
      where: { id },
      relations: {
        rider: true,
        driver: {
          user: true,
          vehicle: true,
        },
      },
    });
  }

  public async saveRide(data: Partial<Rides>): Promise<Rides> {
    return this.save(data);
  }

  public async findRidesByRider(riderId: string): Promise<Rides[]> {
    return this.find({
      where: { rider_id: riderId },
      order: { created_at: 'DESC' },
      relations: {
        driver: {
          user: true,
          vehicle: true,
        },
      },
    });
  }

  public async findRidesByDriver(driverId: string): Promise<Rides[]> {
    return this.find({
      where: { driver_id: driverId },
      order: { created_at: 'DESC' },
      relations: {
        rider: true,
      },
    });
  }

  public async findAvailableRides(): Promise<Rides[]> {
    return this.find({
      where: { status: RideStatus.REQUESTED },
      order: { created_at: 'ASC' },
      relations: {
        rider: true,
      },
    });
  }
}
