import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Auth } from '../../../domain/auth/auth';
import { AuthRepository } from '../../../infrastructure/database/repositories/auth.repository';
import { LoginDto } from './login.dto';
import { TokenService } from '../services/token.service';
import { AuthResponse } from '../interfaces/auth-response.interface';

@Injectable()
export class LoginService {
  constructor(
    @InjectRepository(Auth)
    private readonly authRepository: AuthRepository,
    private readonly tokenService: TokenService,
  ) {}

  public async login(dto: LoginDto): Promise<AuthResponse> {
    const { email, password, role } = dto;
    const auth = await this.authRepository.findUser(email);

    if (!auth) {
      throw new UnauthorizedException('Invalid email or password');
    }

    if (role && auth.role !== role) {
      throw new UnauthorizedException(
        `Account is not registered as a ${role.toLowerCase()}`,
      );
    }

    const validPassword = await auth.comparePassword(password);
    if (!validPassword) {
      throw new UnauthorizedException('Invalid email or password');
    }

    if (!auth.isActive()) {
      throw new BadRequestException('Account is not active');
    }

    const tokens = await this.tokenService.generateTokens({
      sub: auth.uuid,
      email: auth.email,
      role: auth.role,
    });

    return {
      id: auth.id,
      uuid: auth.uuid,
      email: auth.email,
      status: auth.status,
      role: auth.role,
      created_at: auth.created_at,
      updated_at: auth.updated_at,
      user: auth.user,
      driver: auth.driver,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    };
  }

  public async handle(dto: LoginDto): Promise<AuthResponse> {
    return this.login(dto);
  }
}