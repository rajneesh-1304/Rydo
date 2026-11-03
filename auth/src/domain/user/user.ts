import {
  BeforeInsert,
  Column,
  CreateDateColumn,
  Entity,
  Generated,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Status } from './enums/status.enum';
import { Role } from './enums/role.enum';
import { Driver } from '../driver/driver';
import { ConflictException } from '@nestjs/common';
import { UpdateUserDto } from 'src/features/user/update -user/update-user.dto';
import { Rides } from '../rides/rides.entity';

@Entity('users')
export class Users {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 64, unique: true })
  uuid: string;

  @BeforeInsert()
  generateUuid() {
    if (!this.uuid) {
      this.uuid = `u-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 8)}`;
    }
  }

  @Column({ unique: true, nullable: true })
  firebase_uid?: string;

  @Column({ unique: true })
  email: string;

  @Column()
  first_name: string;

  @Column()
  last_name: string;

  @Column({ unique: true, nullable: true })
  phone?: string;

  @Column({ nullable: true })
  image?: string;

  @Column({ nullable: true })
  gender?: string;

  @Column({ type: 'date', nullable: true })
  dob?: Date;

  @Column({
    type: 'varchar',
    length: 32,
    default: Status.ACTIVE,
  })
  status: Status;

  @Column({
    type: 'varchar',
    length: 32,
    default: Role.USER,
  })
  role: Role;

  @Column({ type: 'varchar', nullable: true })
  provider_id?: string;

  @Column({ type: 'boolean', default: false })
  is_verified: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @OneToOne(() => Driver, (driver) => driver.user)
  driver: Driver

  @OneToMany(() => Rides, (ride) => ride.rider)
  rides: Rides[]

  public isActive(): boolean {
    return this.status === Status.ACTIVE;
  }

  allowedToUpdate(data: UpdateUserDto) {
    if (data.email !== this.email) {
      throw new ConflictException('Email cannot be updated');
    }
  }
}
