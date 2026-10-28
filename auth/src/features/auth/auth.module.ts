import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { Auth } from '../../domain/auth/auth';
import { Users } from '../../domain/user/user';
import { Driver } from '../../domain/driver/driver';
import { Vehicle } from '../../domain/driver/vehicle';
import { AuthRepository } from '../../infrastructure/database/repositories/auth.repository';
import { TokenService } from './services/token.service';
import { LoginController } from './login/login.controller';
import { LoginService } from './login/login.service';
import { RegisterController } from './register/register.controller';
import { RegisterService } from './register/register.service';

@Module({
  imports: [
    JwtModule.register({}),
    TypeOrmModule.forFeature([Auth, Users, Driver, Vehicle]),
  ],
  controllers: [LoginController, RegisterController],
  providers: [TokenService, AuthRepository, RegisterService, LoginService],
  exports: [TokenService, AuthRepository, RegisterService, LoginService],
})
export class AuthFeatureModule {}
