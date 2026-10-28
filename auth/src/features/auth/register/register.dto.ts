import { Type } from 'class-transformer';
import {
  IsDate,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { Role } from '../../../domain/auth/enum/role.enum';
import { VehicleDto } from '../dtos/vehicle.dto';

export class RegisterDto {
  @IsString()
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsString()
  @IsNotEmpty()
  first_name: string;

  @IsString()
  @IsNotEmpty()
  last_name: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsEnum(Role)
  role?: Role;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  dob?: Date;

  @IsOptional()
  @IsString()
  gender?: string;

  @IsOptional()
  @IsString()
  image?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => VehicleDto)
  vehicle?: VehicleDto;
}

export const RegisterUserDto = RegisterDto;
export type RegisterUserDto = RegisterDto;
export const RegisterCommand = RegisterDto;
export type RegisterCommand = RegisterDto;
export const RegisterUserCommand = RegisterDto;
export type RegisterUserCommand = RegisterDto;
