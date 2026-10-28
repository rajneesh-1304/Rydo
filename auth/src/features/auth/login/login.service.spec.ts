import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { LoginService } from './login.service';
import { Auth } from '../../../domain/auth/auth';
import { AuthRepository } from '../../../infrastructure/database/repositories/auth.repository';
import { TokenService } from '../services/token.service';
import { Role } from '../../../domain/auth/enum/role.enum';
import { Status } from '../../../domain/auth/enum/status.enum';

const getRepoToken = (entity: { name: string }) => `${entity.name}Repository`;

describe('LoginService', () => {
  let service: LoginService;
  let authRepository: Partial<AuthRepository>;
  let tokenService: Partial<TokenService>;

  beforeEach(async () => {
    tokenService = {
      generateTokens: jest.fn().mockResolvedValue({
        accessToken: 'mock-access-token',
        refreshToken: 'mock-refresh-token',
      }),
    };

    authRepository = {
      findUser: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LoginService,
        {
          provide: getRepoToken(Auth),
          useValue: authRepository,
        },
        {
          provide: TokenService,
          useValue: tokenService,
        },
      ],
    }).compile();

    service = module.get<LoginService>(LoginService);
  });

  it('should authenticate user and return tokens and user profile', async () => {
    const mockAuth = {
      id: 1,
      uuid: 'user-uuid',
      email: 'user@example.com',
      status: Status.ACTIVE,
      role: Role.USER,
      created_at: new Date(),
      updated_at: new Date(),
      comparePassword: jest.fn().mockResolvedValue(true),
      isActive: jest.fn().mockReturnValue(true),
      user: { id: 1, first_name: 'John', last_name: 'Doe' },
    };

    (authRepository.findUser as jest.Mock).mockResolvedValue(mockAuth);

    const result = await service.login({
      email: 'user@example.com',
      password: 'correctPassword',
    });

    expect(result.role).toBe(Role.USER);
    expect(result.user).toBeDefined();
    expect(result.accessToken).toBe('mock-access-token');
  });

  it('should authenticate driver and return tokens and driver profile', async () => {
    const mockAuth = {
      id: 2,
      uuid: 'driver-uuid',
      email: 'driver@example.com',
      status: Status.ACTIVE,
      role: Role.DRIVER,
      created_at: new Date(),
      updated_at: new Date(),
      comparePassword: jest.fn().mockResolvedValue(true),
      isActive: jest.fn().mockReturnValue(true),
      driver: { id: 1, first_name: 'Mike', last_name: 'Driver' },
    };

    (authRepository.findUser as jest.Mock).mockResolvedValue(mockAuth);

    const result = await service.login({
      email: 'driver@example.com',
      password: 'correctPassword',
    });

    expect(result.role).toBe(Role.DRIVER);
    expect(result.driver).toBeDefined();
    expect(result.accessToken).toBe('mock-access-token');
  });

  it('should throw UnauthorizedException on invalid password', async () => {
    const mockAuth = {
      id: 1,
      comparePassword: jest.fn().mockResolvedValue(false),
    };

    (authRepository.findUser as jest.Mock).mockResolvedValue(mockAuth);

    await expect(
      service.login({
        email: 'user@example.com',
        password: 'wrongPassword',
      }),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('should throw BadRequestException if account is inactive', async () => {
    const mockAuth = {
      id: 1,
      comparePassword: jest.fn().mockResolvedValue(true),
      isActive: jest.fn().mockReturnValue(false),
    };

    (authRepository.findUser as jest.Mock).mockResolvedValue(mockAuth);

    await expect(
      service.login({
        email: 'user@example.com',
        password: 'correctPassword',
      }),
    ).rejects.toThrow(BadRequestException);
  });
});
