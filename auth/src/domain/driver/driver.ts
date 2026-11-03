import {
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

  @Generated('uuid')
  @Column({ type: 'uuid', unique: true })
  uuid: string;

  @Column({
    type: 'enum',
    enum: Status,
    default: Status.ACTIVE,
  })
  status: Status;

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
