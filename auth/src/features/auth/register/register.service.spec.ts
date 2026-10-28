import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { RegisterService } from './register.service';
import { Auth } from '../../../domain/auth/auth';
import { Users } from '../../../domain/user/user';
import { Driver } from '../../../domain/driver/driver';
import { Vehicle } from '../../../domain/driver/vehicle';
import { AuthRepository } from '../../../infrastructure/database/repositories/auth.repository';
import { TokenService } from '../services/token.service';
import { Role } from '../../../domain/auth/enum/role.enum';
import { Status } from '../../../domain/auth/enum/status.enum';

import { Repository } from 'typeorm';

jest.mock('typeorm-transactional', () => ({
  Transactional:
    () =>
    (_target: unknown, _propertyKey: string, descriptor: PropertyDescriptor) =>
      descriptor,
  initializeTransactionalContext: jest.fn(),
  addTransactionalDataSource: jest.fn(),
}));

const getRepoToken = (entity: { name: string }) => `${entity.name}Repository`;

describe('RegisterService', () => {
  let service: RegisterService;
  let authRepository: Partial<AuthRepository>;
  let userRepository: Partial<Repository<Users>>;
  let driverRepository: Partial<Repository<Driver>>;
  let vehicleRepository: Partial<Repository<Vehicle>>;
  let tokenService: Partial<TokenService>;

  beforeEach(async () => {
    authRepository = {
      existsByEmail: jest.fn().mockResolvedValue(false),
      create: jest.fn().mockImplementation(
        (data: Partial<Auth>) =>
          ({
            id: 1,
            uuid: 'auth-uuid-123',
            status: Status.ACTIVE,
            created_at: new Date(),
            updated_at: new Date(),
            ...data,
          }) as Auth,
      ),
      save: jest.fn().mockImplementation((data: Auth) => Promise.resolve(data)),
    };

    userRepository = {
      findOne: jest.fn().mockResolvedValue(null),
      create: jest
        .fn()
        .mockImplementation(
          (data: Partial<Users>) => ({ id: 1, ...data }) as Users,
        ),
      save: jest
        .fn()
        .mockImplementation((data: Users) => Promise.resolve(data)),
    };

    driverRepository = {
      findOne: jest.fn().mockResolvedValue(null),
      create: jest
        .fn()
        .mockImplementation(
          (data: Partial<Driver>) => ({ id: 1, ...data }) as Driver,
        ),
      save: jest
        .fn()
        .mockImplementation((data: Driver) => Promise.resolve(data)),
    };

    vehicleRepository = {
      findOne: jest.fn().mockResolvedValue(null),
      create: jest
        .fn()
        .mockImplementation(
          (data: Partial<Vehicle>) => ({ id: 1, ...data }) as Vehicle,
        ),
      save: jest
        .fn()
        .mockImplementation((data: Vehicle) => Promise.resolve(data)),
    };

    tokenService = {
      generateTokens: jest.fn().mockResolvedValue({
        accessToken: 'mock-access-token',
        refreshToken: 'mock-refresh-token',
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RegisterService,
        {
          provide: getRepoToken(Auth),
          useValue: authRepository,
        },
        {
          provide: getRepoToken(Users),
          useValue: userRepository,
        },
        {
          provide: getRepoToken(Driver),
          useValue: driverRepository,
        },
        {
          provide: getRepoToken(Vehicle),
          useValue: vehicleRepository,
        },
        {
          provide: TokenService,
          useValue: tokenService,
        },
      ],
    }).compile();

    service = module.get<RegisterService>(RegisterService);
  });

  it('should register a USER in Auth and Users entities', async () => {
    const dto = {
      email: 'john.doe@example.com',
      password: 'securePassword123',
      first_name: 'John',
      last_name: 'Doe',
      phone: '+1234567890',
      role: Role.USER,
    };

    const result = await service.register(dto);

    expect(authRepository.existsByEmail).toHaveBeenCalledWith(dto.email);
    expect(authRepository.save).toHaveBeenCalled();
    expect(userRepository.create).toHaveBeenCalled();
    expect(userRepository.save).toHaveBeenCalled();
    expect(result.role).toBe(Role.USER);
    expect(result.user).toBeDefined();
    expect(result.driver).toBeUndefined();
    expect(result.accessToken).toBe('mock-access-token');
    expect(result.refreshToken).toBe('mock-refresh-token');
  });

  it('should register a DRIVER in Auth, Driver, and Vehicle entities', async () => {
    const dto = {
      email: 'driver.mike@example.com',
      password: 'securePassword123',
      first_name: 'Mike',
      last_name: 'Driver',
      phone: '+1987654321',
      role: Role.DRIVER,
      vehicle: {
        model: 'Toyota Prius',
        plate_number: 'CAB-999',
        color: 'Yellow',
        license_number: 'LIC-12345',
        license_expiration_date: new Date('2028-01-01'),
        insurance_number: 'INS-67890',
        insurance_expiration_date: new Date('2028-01-01'),
      },
    };

    const result = await service.register(dto);

    expect(authRepository.existsByEmail).toHaveBeenCalledWith(dto.email);
    expect(driverRepository.create).toHaveBeenCalled();
    expect(driverRepository.save).toHaveBeenCalled();
    expect(vehicleRepository.create).toHaveBeenCalled();
    expect(vehicleRepository.save).toHaveBeenCalled();
    expect(result.role).toBe(Role.DRIVER);
    expect(result.driver).toBeDefined();
    expect(result.accessToken).toBe('mock-access-token');
  });

  it('should throw BadRequestException if email already exists', async () => {
    (authRepository.existsByEmail as jest.Mock).mockResolvedValueOnce(true);

    await expect(
      service.register({
        email: 'duplicate@example.com',
        password: 'password123',
        first_name: 'Jane',
        last_name: 'Doe',
      }),
    ).rejects.toThrow(BadRequestException);
  });
});
