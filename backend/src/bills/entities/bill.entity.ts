import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  CreateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Appointment } from 'src/appointment/entities/appointment.entity';
import { BillItem } from './bill-item.entity';


export type BillStatus = 'UNPAID' | 'PAID' | 'CANCELLED';

@Entity({ name: 'bills' })
export class Bill {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, { eager: true })
  patient: User;

  @ManyToOne(() => Appointment, { eager: true, nullable: true })
  appointment: Appointment;

  @OneToMany(() => BillItem, (item) => item.bill, { cascade: true, eager: true })
  items: BillItem[];

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  totalAmount: number;

  @Column({ type: 'varchar', length: 20, default: 'UNPAID' })
  status: BillStatus;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ nullable: true, type: 'timestamp' })
  paidAt?: Date;

  @Column({ nullable: true, length: 50 })
  paymentMethod?: string; // cash | card | online
}
