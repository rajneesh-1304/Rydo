import {
  Column,
  CreateDateColumn,
  Entity,
  Generated,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { Status } from './enum/status.enum';
import { Users } from '../user/user';
import { Driver } from '../driver/driver';
import { Role } from './enum/role.enum';

@Entity('auth')
export class Auth {
  @PrimaryGeneratedColumn()
  id: number;

  @Generated('uuid')
  @Column({ type: 'uuid', unique: true })
  uuid: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column({
    type: 'enum',
    enum: Status,
    default: Status.ACTIVE,
  })
  status: Status;

  @Column({
    type: 'enum',
    enum: Role,
    default: Role.USER,
  })
  role: Role;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @OneToOne(() => Users, (user) => user.auth)
  user?: Users;

  @OneToOne(() => Driver, (driver) => driver.auth)
  driver?: Driver;

  public async comparePassword(password: string): Promise<boolean> {
    return bcrypt.compare(password, this.password);
  }

  public static async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
  }

  public isActive(): boolean {
    return this.status === Status.ACTIVE;
  }
}
