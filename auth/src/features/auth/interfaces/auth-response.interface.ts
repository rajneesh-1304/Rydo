import { Role } from '../../../domain/auth/enum/role.enum';
import { Status } from '../../../domain/auth/enum/status.enum';
import { Users } from '../../../domain/user/user';
import { Driver } from '../../../domain/driver/driver';

export interface BaseAuthResult {
  id: number;
  uuid: string;
  email: string;
  status: Status;
  role: Role;
  created_at: Date;
  updated_at: Date;
  accessToken: string;
  refreshToken: string;
}

export interface UserAuthResponse extends BaseAuthResult {
  user?: Users;
}

export interface DriverAuthResponse extends BaseAuthResult {
  driver?: Driver;
}

export interface AuthResponse extends BaseAuthResult {
  user?: Users;
  driver?: Driver;
}
