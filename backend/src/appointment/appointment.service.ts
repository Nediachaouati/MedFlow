import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { Appointment } from './entities/appointment.entity';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import { User } from '../users/entities/user.entity';
import { AppointmentStatus } from './entities/appointment.entity';
import { Role } from '../role.enum'; // AJOUTE CET IMPORT !

@Injectable()
export class AppointmentService {
  constructor(
    @InjectRepository(Appointment)
    private appointmentRepo: Repository<Appointment>,
    @InjectRepository(User)
    private userRepo: Repository<User>,
  ) {}

  async create(dto: CreateAppointmentDto, patientId: number): Promise<Appointment> {
    const medecin = await this.userRepo.findOne({
      where: { id: dto.medecinId, role: Role.MEDECIN }, // ICI : Role.MEDECIN
    });
    if (!medecin) throw new BadRequestException('Médecin non trouvé');

    const conflict = await this.appointmentRepo.findOne({
      where: {
        medecinId: dto.medecinId,
        date: dto.date,
        time: dto.time,
        deleted_at: IsNull(),
      },
    });
    if (conflict) throw new BadRequestException('Ce créneau est déjà pris');

    const appointment = this.appointmentRepo.create({
      ...dto,
      patientId,
      status: AppointmentStatus.PENDING,
    });

    return this.appointmentRepo.save(appointment);
  }

  // ... le reste du code reste identique
  async findByPatient(patientId: number): Promise<Appointment[]> {
    return this.appointmentRepo.find({
      where: { patientId, deleted_at: IsNull() },
      relations: ['medecin'],
      order: { date: 'DESC', time: 'DESC' },
    });
  }

  async findByDoctor(medecinId: number): Promise<Appointment[]> {
    return this.appointmentRepo.find({
      where: { medecinId, deleted_at: IsNull() },
      relations: ['patient'],
      order: { date: 'ASC', time: 'ASC' },
    });
  }

  async update(id: number, dto: UpdateAppointmentDto): Promise<Appointment> {
    await this.appointmentRepo.update(id, dto);
    const updated = await this.appointmentRepo.findOne({ where: { id } });
    if (!updated) throw new NotFoundException('RDV non trouvé');
    return updated;
  }

  async cancel(id: number, userId: number): Promise<Appointment> {
    const appointment = await this.appointmentRepo.findOne({ where: { id } });
    if (!appointment) throw new NotFoundException('RDV non trouvé');

    if (appointment.patientId !== userId && appointment.medecinId !== userId) {
      throw new BadRequestException('Accès refusé');
    }

    appointment.status = AppointmentStatus.CANCELLED;
    return this.appointmentRepo.save(appointment);
  }

  async remove(id: number): Promise<void> {
    const appointment = await this.appointmentRepo.findOne({ where: { id } });
    if (!appointment) throw new NotFoundException('RDV non trouvé');
    await this.appointmentRepo.softDelete(id);
  }
}