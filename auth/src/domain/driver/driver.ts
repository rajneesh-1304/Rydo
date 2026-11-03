import {
  BeforeInsert,
  Column,
  Entity,
  Generated,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Status } from '../user/enums/status.enum';
import { Vehicle } from './vehicle';
import { Users } from '../user/user';
import { Rides } from '../rides/rides.entity';

@Entity('driver')
export class Driver {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 64, unique: true })
  uuid: string;

  @BeforeInsert()
  generateUuid() {
    if (!this.uuid) {
      this.uuid = `d-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 8)}`;
    }
  }

  @Column({
    type: 'varchar',
    length: 32,
    default: Status.ACTIVE,
  })
  status: Status;

  @Column({ type: 'decimal', precision: 3, scale: 2, default: 4.85 })
  rating: number;

  @Column({ type: 'int', default: 124 })
  total_rides: number;

  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
  current_latitude?: string;

  @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
  current_longitude?: string;

  @Column({ type: 'boolean', default: true })
  is_online: boolean;

  @OneToOne(() => Users, (user) => user.driver)
  @JoinColumn({ name: 'user_id' })
  user: Users;

  @OneToOne(() => Vehicle, (vehicle) => vehicle.driver, {
    cascade: true,
  })
  vehicle?: Vehicle;

  @OneToMany(() => Rides, (ride) => ride.driver)
  rider: Rides[]

  public isActive(): boolean {
    return this.status === Status.ACTIVE;
  }
}
