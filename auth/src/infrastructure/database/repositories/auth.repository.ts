import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Auth } from '../../../domain/auth/auth';

@Injectable()
export class AuthRepository extends Repository<Auth> {
  constructor(private readonly dataSource: DataSource) {
    super(Auth, dataSource.createEntityManager());
  }

  public async findUser(email: string): Promise<Auth | null> {
    return this.findOne({
      where: { email },
      relations: {
        user: true,
        driver: true,
      },
    });
  }

  public async findUserByEmail(email: string): Promise<Auth | null> {
    return this.findOne({
      where: { email },
      relations: {
        user: true,
      },
    });
  }

  public async findDriverByEmail(email: string): Promise<Auth | null> {
    return this.findOne({
      where: { email },
      relations: {
        driver: {
          vehicle: true,
        },
      },
    });
  }

  public async existsByEmail(email: string): Promise<boolean> {
    const count = await this.count({ where: { email } });
    return count > 0;
  }
}
