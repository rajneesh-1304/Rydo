import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Users } from '../../../domain/user/user';
import { IUserRepository } from './user.interface';

@Injectable()
export class UserRepository extends Repository<Users> {
  constructor(private readonly dataSource: DataSource) {
    super(Users, dataSource.createEntityManager());
  }

  public async findById(id: number): Promise<Users | null> {
    return this.findOne({
      where: { id },
    });
  }

  async findUserByEmail(email: string) {
    return this.findOne({ where: { email } });
  }

  public async saveUser(data: IUserRepository) {
    return this.save(data);
  }

  public async findUser(uuid: string): Promise<Users | null> {
    return this.findOne({
      where: { uuid },
    });
  }

  public async findByUuid(uuid: string): Promise<Users | null> {
    return this.findOne({
      where: { uuid },
    });
  }

  public async findByFirebaseUid(firebase_uid: string): Promise<Users | null> {
    return this.findOne({
      where: { firebase_uid },
    });
  }

  public async findByEmail(email: string): Promise<Users | null> {
    return this.findOne({
      where: { email },
    });
  }

  public async findByPhone(phone: string): Promise<Users | null> {
    return this.findOne({
      where: { phone },
    });
  }

  public async findByIdentifier(identifier: string): Promise<Users | null> {
    // Check if numeric id
    if (/^\d+$/.test(identifier)) {
      const user = await this.findById(Number(identifier));
      if (user) return user;
    }

    // Check if UUID
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (uuidRegex.test(identifier)) {
      const user = await this.findByUuid(identifier);
      if (user) return user;
    }

    // Check if email
    if (identifier.includes('@')) {
      const user = await this.findByEmail(identifier);
      if (user) return user;
    }

    // Check by firebase_uid
    const userByFirebase = await this.findByFirebaseUid(identifier);
    if (userByFirebase) return userByFirebase;

    // Check by phone
    return this.findByPhone(identifier);
  }

  public async existsByEmail(email: string): Promise<boolean> {
    const count = await this.count({ where: { email } });
    return count > 0;
  }

  public async existsByPhone(phone: string): Promise<boolean> {
    const count = await this.count({ where: { phone } });
    return count > 0;
  }


}
