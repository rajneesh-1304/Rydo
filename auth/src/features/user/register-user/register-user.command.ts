import { RegisterUserDto } from './register-user.dto';

export class RegisterUserCommand {
  constructor(public readonly user: RegisterUserDto) { }
}