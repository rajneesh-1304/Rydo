import { Injectable } from '@nestjs/common';
import { RegisterUserCommand } from './register-user.command';
import { UserRepository } from 'src/infrastructure/repositories/user-repository/user.repository';

@Injectable()
export class UserSaveHandler {
  constructor(private readonly userRepository: UserRepository) { }

  public async handle(command: RegisterUserCommand) {
    const { user } = command;

    const userExists = await this.userRepository.findUserByEmail(user.email);
    if (userExists) {
      // Upsert: Update existing user record with latest profile info
      userExists.first_name = user.first_name || userExists.first_name;
      userExists.last_name = user.last_name || userExists.last_name;
      if (user.phone) userExists.phone = user.phone;
      if (user.gender) userExists.gender = user.gender;
      if (user.dob) userExists.dob = user.dob;
      if (user.image) userExists.image = user.image;
      if (user.firebase_uid) userExists.firebase_uid = user.firebase_uid;
      if (user.role) userExists.role = user.role;
      return await this.userRepository.save(userExists);
    }

    const newUser = this.userRepository.create({
      uuid: (user as any).uuid || `u-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 8)}`,
      ...user,
    });
    return await this.userRepository.saveUser(newUser);
  }
}
