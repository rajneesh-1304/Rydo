import {
  Column,
  CreateDateColumn,
  Entity,
  Generated,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { RideStatus } from './ride-status.enum';
import { Driver } from '../driver/driver';
import { Users } from '../user/user';


@Entity('rides')
@Index(['rider_id'])
@Index(['driver_id'])
@Index(['status'])
export class Rides {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'uuid', unique: true })
  @Generated('uuid')
  uuid: string;

  @Column({ type: 'uuid' })
  rider_id: string;

  @ManyToOne(() => Users, (user) => user.rides)
  @JoinColumn({ name: 'rider_id', referencedColumnName: 'uuid' })
  rider: Users;

  @Column({ type: 'uuid', nullable: true })
  driver_id: string | null;

  @ManyToOne(() => Driver, (driver) => driver.rider, { nullable: true })
  @JoinColumn({ name: 'driver_id', referencedColumnName: 'uuid' })
  driver?: Driver | null;

  @Column({ type: 'varchar', length: 255 })
  pickup_address: string;

  @Column({ type: 'decimal', precision: 10, scale: 7 })
  pickup_latitude: string;

  @Column({ type: 'decimal', precision: 10, scale: 7 })
  pickup_longitude: string;

  @Column({ type: 'varchar', length: 255 })
  dropoff_address: string;

  @Column({ type: 'decimal', precision: 10, scale: 7 })
  dropoff_latitude: string;

  @Column({ type: 'decimal', precision: 10, scale: 7 })
  dropoff_longitude: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  distance: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  fare: string;

  @Column({
    type: 'enum',
    enum: RideStatus,
    default: RideStatus.REQUESTED,
  })
  status: RideStatus;

  @Column({ type: 'timestamp', nullable: true })
  accepted_at: Date | null;

  @Column({ type: 'timestamp', nullable: true })
  started_at: Date | null;

  @Column({ type: 'timestamp', nullable: true })
  completed_at: Date | null;

  @Column({ type: 'timestamp', nullable: true })
  cancelled_at: Date | null;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}