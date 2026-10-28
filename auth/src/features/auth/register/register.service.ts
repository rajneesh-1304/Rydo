import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Transactional } from 'typeorm-transactional';
import { Auth } from '../../../domain/auth/auth';
import { Users } from '../../../domain/user/user';
import { Driver } from '../../../domain/driver/driver';
import { Vehicle } from '../../../domain/driver/vehicle';
import { AuthRepository } from '../../../infrastructure/database/repositories/auth.repository';
import { RegisterDto } from './register.dto';
import { Status } from '../../../domain/auth/enum/status.enum';
import { Role } from '../../../domain/auth/enum/role.enum';
import { TokenService } from '../services/token.service';
import { AuthResponse } from '../interfaces/auth-response.interface';

@Injectable()
export class RegisterService {
  constructor(
    @InjectRepository(Auth)
    private readonly authRepository: AuthRepository,
    @InjectRepository(Users)
    private readonly userRepository: Repository<Users>,
    @InjectRepository(Driver)
    private readonly driverRepository: Repository<Driver>,
    @InjectRepository(Vehicle)
    private readonly vehicleRepository: Repository<Vehicle>,
    private readonly tokenService: TokenService,
  ) {}

  @Transactional()
  public async register(dto: RegisterDto): Promise<AuthResponse> {
    const {
      email,
      password,
      first_name,
      last_name,
      phone,
      dob,
      gender,
      image,
      vehicle,
      role,
    } = dto;

    const targetRole = role || Role.USER;

    const emailExists = await this.authRepository.existsByEmail(email);
    if (emailExists) {
      throw new BadRequestException(
        'An account with this email already exists',
      );
    }

    if (phone) {
      if (targetRole === Role.DRIVER) {
        const phoneExists = await this.driverRepository.findOne({
          where: { phone },
        });
        if (phoneExists) {
          throw new BadRequestException(
            'Driver phone number is already registered',
          );
        }
      } else {
        const phoneExists = await this.userRepository.findOne({
          where: { phone },
        });
        if (phoneExists) {
          throw new BadRequestException(
            'User phone number is already registered',
          );
        }
      }
    }

    if (targetRole === Role.DRIVER && vehicle) {
      const [existingPlate, existingLicense, existingInsurance] =
        await Promise.all([
          this.vehicleRepository.findOne({
            where: { plate_number: vehicle.plate_number },
          }),
          this.vehicleRepository.findOne({
            where: { license_number: vehicle.license_number },
          }),
          this.vehicleRepository.findOne({
            where: { insurance_number: vehicle.insurance_number },
          }),
        ]);

      if (existingPlate) {
        throw new BadRequestException(
          'Vehicle plate number is already registered',
        );
      }
      if (existingLicense) {
        throw new BadRequestException(
          'Vehicle license number is already registered',
        );
      }
      if (existingInsurance) {
        throw new BadRequestException(
          'Vehicle insurance number is already registered',
        );
      }
    }

    const hashedPassword = await Auth.hashPassword(password);

    const auth = this.authRepository.create({
      email,
      password: hashedPassword,
      role: targetRole,
      status: Status.ACTIVE,
    });

    const savedAuth = await this.authRepository.save(auth);

    if (targetRole === Role.DRIVER) {
      const driver = this.driverRepository.create({
        first_name,
        last_name,
        phone,
        dob,
        gender,
        image,
        auth: savedAuth,
      });

      const savedDriver = await this.driverRepository.save(driver);

      if (vehicle) {
        const newVehicle = this.vehicleRepository.create({
          model: vehicle.model,
          plate_number: vehicle.plate_number,
          color: vehicle.color,
          license_number: vehicle.license_number,
          license_expiration_date: vehicle.license_expiration_date,
          insurance_number: vehicle.insurance_number,
          insurance_expiration_date: vehicle.insurance_expiration_date,
          car_image: vehicle.car_image,
          driver: savedDriver,
        });

        const savedVehicle = await this.vehicleRepository.save(newVehicle);
        savedDriver.vehicle = savedVehicle;
      }

      savedAuth.driver = savedDriver;
    } else {
      const user = this.userRepository.create({
        first_name,
        last_name,
        phone,
        dob,
        gender,
        image,
        auth: savedAuth,
      });

      const savedUser = await this.userRepository.save(user);
      savedAuth.user = savedUser;
    }

    const tokens = await this.tokenService.generateTokens({
      sub: savedAuth.uuid,
      email: savedAuth.email,
      role: savedAuth.role,
    });

    return {
      id: savedAuth.id,
      uuid: savedAuth.uuid,
      email: savedAuth.email,
      status: savedAuth.status,
      role: savedAuth.role,
      created_at: savedAuth.created_at,
      updated_at: savedAuth.updated_at,
      user: savedAuth.user,
      driver: savedAuth.driver,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    };
  }

  public async handle(dto: RegisterDto): Promise<AuthResponse> {
    return this.register(dto);
  }
}

export const RegisterHandler = RegisterService;
export type RegisterHandler = RegisterService;
