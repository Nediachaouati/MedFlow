
import { Appointment } from "src/appointment/entities/appointment.entity";
import { Availability } from "src/availability/entities/availability.entity";
import { Bill } from "src/bill/entities/bill.entity";
import { Role } from "src/role.enum";
import { Column, CreateDateColumn, DeleteDateColumn, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  email: string;

  @Column({ nullable: true })
  password?: string;

  @Column({ nullable: true })
  name: string;
@OneToMany(() => Bill, (bill) => bill.patient)
bills: Bill[];

  @Column({
    type: 'enum',
    enum: Role,
    default: Role.PATIENT,
  })
  role: Role;

  @Column({ nullable: true })
  phoneNumber?: string;

  @Column({ nullable: true })
  address?: string;

  @Column({ nullable: true })
  speciality?: string;

  @Column({ type: 'date', nullable: true })
  birthDate?: string;

  @Column({ nullable: true })
  photo?: string;

  @OneToMany(() => Availability, availability => availability.medecin)
availabilities: Availability[];

@OneToMany(() => Appointment, (appointment) => appointment.medecin)
appointmentsAsDoctor: Appointment[];

@OneToMany(() => Appointment, (appointment) => appointment.patient)
appointmentsAsPatient: Appointment[];

  @Column({ nullable: true })
  medecinId?: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @DeleteDateColumn({ nullable: true })
  deleted_at: Date;
}
