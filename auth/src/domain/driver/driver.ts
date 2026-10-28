import {
  Column,
  CreateDateColumn,
  Entity,
  Generated,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Auth } from '../auth/auth';
import { Vehicle } from './vehicle';

@Entity('driver')
export class Driver {
  @PrimaryGeneratedColumn()
  id: number;

  @Generated('uuid')
  @Column({ type: 'uuid', unique: true })
  uuid: string;

  @Column()
  first_name: string;

  @Column()
  last_name: string;

  @Column({ unique: true, nullable: true })
  phone: string;

  @Column({ nullable: true })
  image: string;

  @Column({ nullable: true })
  gender: string;

  @Column({ type: 'date', nullable: true })
  dob: Date;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @OneToOne(() => Auth, (auth) => auth.driver, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'auth_id' })
  auth: Auth;

  @OneToOne(() => Vehicle, (vehicle) => vehicle.driver)
  vehicle: Vehicle;
}
