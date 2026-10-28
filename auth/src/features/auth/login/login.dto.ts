import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { Role } from '../../../domain/auth/enum/role.enum';

export class LoginDto {
  @IsString()
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsOptional()
  @IsEnum(Role)
  role?: Role;
}

export const LoginUserDto = LoginDto;
export type LoginUserDto = LoginDto;
export const LoginCommand = LoginDto;
export type LoginCommand = LoginDto;
export const LoginUserCommand = LoginDto;
export type LoginUserCommand = LoginDto;
