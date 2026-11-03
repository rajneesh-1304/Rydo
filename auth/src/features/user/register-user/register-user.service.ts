import { ConflictException, Injectable } from '@nestjs/common';
import { RegisterUserCommand } from './register-user.command';
import { UserRepository } from 'src/infrastructure/repositories/user-repository/user.repository';

@Injectable()
export class UserSaveHandler {
  constructor(private readonly userRepository: UserRepository) { }

  public async handle(command: RegisterUserCommand) {
    const { user } = command;

    const userExists = await this.userRepository.findUserByEmail(user.email);
    if (userExists) {
      throw new ConflictException('Email is already in use');
    }

    const newUser = this.userRepository.create(user);
    return await this.userRepository.saveUser(newUser);
  }
}
