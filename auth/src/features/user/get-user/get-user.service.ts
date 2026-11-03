import { Injectable, NotFoundException } from '@nestjs/common';
import { UserRepository } from '../../../infrastructure/repositories/user-repository/user.repository';
import { Users } from '../../../domain/user/user';
import { GetUserQuery } from './get-user.query';

@Injectable()
export class UserGetHandler {
  constructor(private readonly userRepository: UserRepository) { }

  public async handle(query: GetUserQuery): Promise<Users> {
    const { uuid } = query;
    const user = await this.userRepository.findUser(uuid);
    if (!user) {
      throw new NotFoundException(`User not found with identifier '${uuid}'`);
    }
    return user;
  }
}
