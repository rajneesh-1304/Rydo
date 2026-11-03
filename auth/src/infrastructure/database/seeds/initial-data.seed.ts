import { Injectable, OnApplicationBootstrap, Logger } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { Users } from '../../../domain/user/user';
import { Driver } from '../../../domain/driver/driver';
import { Vehicle } from '../../../domain/driver/vehicle';
import { Rides } from '../../../domain/rides/rides.entity';
import { Role } from '../../../domain/user/enums/role.enum';
import { Status } from '../../../domain/user/enums/status.enum';
import { RideStatus } from '../../../domain/rides/ride-status.enum';

@Injectable()
export class DataSeedService implements OnApplicationBootstrap {
  private readonly logger = new Logger(DataSeedService.name);

  constructor(private readonly dataSource: DataSource) {}

  async onApplicationBootstrap() {
    try {
      if (!this.dataSource.isInitialized) {
        return;
      }
      await this.seedInitialRealData();
    } catch (err) {
      this.logger.warn(`Data seeding skipped or encountered issue: ${err.message}`);
    }
  }

  public async seedInitialRealData() {
    const userRepo = this.dataSource.getRepository(Users);
    const driverRepo = this.dataSource.getRepository(Driver);
    const vehicleRepo = this.dataSource.getRepository(Vehicle);
    const rideRepo = this.dataSource.getRepository(Rides);

    // 1. Check if rider exists, if not create
    let rider = await userRepo.findOne({ where: { email: 'rajneesh@taxii.in' } });
    if (!rider) {
      rider = userRepo.create({
        uuid: 'u-rajneesh-38',
        firebase_uid: 'fb-rajneesh-38',
        first_name: 'Rajneesh',
        last_name: 'Kumar',
        email: 'rajneesh@taxii.in',
        phone: '+91 98765 12340',
        gender: 'Male',
        role: Role.USER,
        status: Status.ACTIVE,
        is_verified: true,
      });
      await userRepo.save(rider);
      this.logger.log('Seeded Rider profile: Rajneesh Kumar');
    }

    // 2. Real drivers definitions
    const realDriversData = [
      {
        uuid: 'd-amit-124',
        user: {
          uuid: 'u-driver-amit',
          first_name: 'Amit',
          last_name: 'Kumar',
          email: 'amit.kumar@taxii.in',
          phone: '+91 98123 45678',
          gender: 'Male',
          role: Role.DRIVER,
        },
        vehicle: {
          model: 'Maruti Suzuki Swift',
          plate_number: 'PB 01 AB 1234',
          color: 'White',
          license_number: 'DL-0420190012345',
          license_expiration_date: new Date('2029-12-31'),
          insurance_number: 'INS-9921827',
          insurance_expiration_date: new Date('2027-05-15'),
          cab_type: 'Sedan',
        },
        rating: 4.85,
        total_rides: 124,
        current_latitude: '30.7333000',
        current_longitude: '76.7794000',
      },
      {
        uuid: 'd-harpreet-88',
        user: {
          uuid: 'u-driver-harpreet',
          first_name: 'Harpreet',
          last_name: 'Singh',
          email: 'harpreet.singh@taxii.in',
          phone: '+91 98234 56789',
          gender: 'Male',
          role: Role.DRIVER,
        },
        vehicle: {
          model: 'Bajaj RE Auto',
          plate_number: 'CH 01 TA 4421',
          color: 'Yellow-Green',
          license_number: 'CH-0120180023451',
          license_expiration_date: new Date('2028-06-30'),
          insurance_number: 'INS-8812341',
          insurance_expiration_date: new Date('2026-11-20'),
          cab_type: 'Auto',
        },
        rating: 4.90,
        total_rides: 215,
        current_latitude: '30.7414000',
        current_longitude: '76.7681000',
      },
      {
        uuid: 'd-rahul-76',
        user: {
          uuid: 'u-driver-rahul',
          first_name: 'Rahul',
          last_name: 'Sharma',
          email: 'rahul.sharma@taxii.in',
          phone: '+91 98345 67890',
          gender: 'Male',
          role: Role.DRIVER,
        },
        vehicle: {
          model: 'Honda Activa 6G',
          plate_number: 'PB 65 C 8901',
          color: 'Matte Black',
          license_number: 'PB-6520200034562',
          license_expiration_date: new Date('2030-01-15'),
          insurance_number: 'INS-7723901',
          insurance_expiration_date: new Date('2027-08-10'),
          cab_type: 'Bike',
        },
        rating: 4.75,
        total_rides: 89,
        current_latitude: '30.7250000',
        current_longitude: '76.7850000',
      },
      {
        uuid: 'd-vikas-55',
        user: {
          uuid: 'u-driver-vikas',
          first_name: 'Vikas',
          last_name: 'Verma',
          email: 'vikas.verma@taxii.in',
          phone: '+91 98456 78901',
          gender: 'Male',
          role: Role.DRIVER,
        },
        vehicle: {
          model: 'Maruti Suzuki WagonR',
          plate_number: 'CH 01 B 5512',
          color: 'Silver',
          license_number: 'CH-0120210045673',
          license_expiration_date: new Date('2029-09-12'),
          insurance_number: 'INS-6623812',
          insurance_expiration_date: new Date('2027-04-18'),
          cab_type: 'Mini',
        },
        rating: 4.80,
        total_rides: 142,
        current_latitude: '30.7180000',
        current_longitude: '76.7650000',
      },
      {
        uuid: 'd-gurpreet-92',
        user: {
          uuid: 'u-driver-gurpreet',
          first_name: 'Gurpreet',
          last_name: 'Singh',
          email: 'gurpreet.singh@taxii.in',
          phone: '+91 98567 89012',
          gender: 'Male',
          role: Role.DRIVER,
        },
        vehicle: {
          model: 'Hyundai Aura',
          plate_number: 'PB 10 AZ 9821',
          color: 'Titan Grey',
          license_number: 'PB-1020220056784',
          license_expiration_date: new Date('2031-03-25'),
          insurance_number: 'INS-5512940',
          insurance_expiration_date: new Date('2028-02-14'),
          cab_type: 'Sedan',
        },
        rating: 4.92,
        total_rides: 310,
        current_latitude: '30.7055000',
        current_longitude: '76.8013000',
      },
    ];

    for (const item of realDriversData) {
      let driverUser = await userRepo.findOne({ where: { email: item.user.email } });
      if (!driverUser) {
        driverUser = userRepo.create({
          uuid: item.user.uuid,
          firebase_uid: `fb-${item.user.uuid}`,
          first_name: item.user.first_name,
          last_name: item.user.last_name,
          email: item.user.email,
          phone: item.user.phone,
          gender: item.user.gender,
          role: item.user.role,
          status: Status.ACTIVE,
          is_verified: true,
        });
        await userRepo.save(driverUser);
      }

      let driver = await driverRepo.findOne({ where: { uuid: item.uuid } });
      if (!driver) {
        driver = driverRepo.create({
          uuid: item.uuid,
          user: driverUser,
          status: Status.ACTIVE,
          rating: item.rating,
          total_rides: item.total_rides,
          current_latitude: item.current_latitude,
          current_longitude: item.current_longitude,
          is_online: true,
        });
        await driverRepo.save(driver);

        const vehicle = vehicleRepo.create({
          uuid: `veh-${item.uuid}`,
          model: item.vehicle.model,
          plate_number: item.vehicle.plate_number,
          color: item.vehicle.color,
          license_number: item.vehicle.license_number,
          license_expiration_date: item.vehicle.license_expiration_date,
          insurance_number: item.vehicle.insurance_number,
          insurance_expiration_date: item.vehicle.insurance_expiration_date,
          cab_type: item.vehicle.cab_type,
          driver,
        });
        await vehicleRepo.save(vehicle);
      }
    }

    this.logger.log(`Initialized 5 real drivers and vehicles in fleet database`);

    // 3. Check and seed initial real completed rides history if empty
    const rideCount = await rideRepo.count();
    if (rideCount === 0 && rider) {
      const initialRides = [
        {
          uuid: 'BK-9021',
          rider_id: rider.uuid,
          driver_id: 'd-amit-124',
          pickup_address: 'Sector 22, Chandigarh',
          pickup_latitude: '30.7333000',
          pickup_longitude: '76.7794000',
          dropoff_address: 'Elante Mall, Chandigarh',
          dropoff_latitude: '30.7055000',
          dropoff_longitude: '76.8013000',
          distance: '4.8',
          fare: '250.00',
          status: RideStatus.COMPLETED,
          otp: '4829',
          started_at: new Date(Date.now() - 86400000 * 2).toISOString(),
          completed_at: new Date(Date.now() - 86400000 * 2 + 1800000).toISOString(),
        },
        {
          uuid: 'BK-8842',
          rider_id: rider.uuid,
          driver_id: 'd-harpreet-88',
          pickup_address: 'Sector 17, Chandigarh',
          pickup_latitude: '30.7414000',
          pickup_longitude: '76.7681000',
          dropoff_address: 'Sukhna Lake, Chandigarh',
          dropoff_latitude: '30.7421000',
          dropoff_longitude: '76.8188000',
          distance: '5.2',
          fare: '120.00',
          status: RideStatus.COMPLETED,
          otp: '7193',
          started_at: new Date(Date.now() - 86400000 * 3).toISOString(),
          completed_at: new Date(Date.now() - 86400000 * 3 + 1200000).toISOString(),
        },
        {
          uuid: 'BK-7619',
          rider_id: rider.uuid,
          driver_id: 'd-rahul-76',
          pickup_address: 'Sector 35, Chandigarh',
          pickup_latitude: '30.7250000',
          pickup_longitude: '76.7850000',
          dropoff_address: 'Sector 43 ISBT, Chandigarh',
          dropoff_latitude: '30.7180000',
          dropoff_longitude: '76.7650000',
          distance: '3.1',
          fare: '80.00',
          status: RideStatus.COMPLETED,
          otp: '3312',
          started_at: new Date(Date.now() - 86400000 * 5).toISOString(),
          completed_at: new Date(Date.now() - 86400000 * 5 + 900000).toISOString(),
        },
      ];

      for (const r of initialRides) {
        const rideEntity = rideRepo.create(r);
        await rideRepo.save(rideEntity);
      }
      this.logger.log(`Initialized 3 real ride history entries in database`);
    }
  }
}
