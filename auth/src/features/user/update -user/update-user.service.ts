import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Users } from '../../../domain/user/user';
import { UpdateUserCommand } from './update-user.command';
import { UserRepository } from 'src/infrastructure/repositories/user-repository/user.repository';

@Injectable()
export class UserUpdateHandler {
  constructor(private readonly userRepository: UserRepository) { }

  public async handle(command: UpdateUserCommand): Promise<Users> {
    const { uuid, data } = command;
    const user = await this.userRepository.findUser(uuid);
    if (!user) {
      throw new NotFoundException(`User not found`);
    }

    user.allowedToUpdate(data);

    return this.userRepository.saveUser(user);
  }
}
