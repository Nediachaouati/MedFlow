import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { Appointment } from './entities/appointment.entity';
import { TimeSlot } from '../availability/entities/time-slot.entity';
import { User } from '../users/entities/user.entity';
import { AppointmentStatus } from './entities/appointment.entity';
import { Role } from '../role.enum';
import { BillService } from 'src/bill/bill.service';

@Injectable()
export class AppointmentService {
  constructor(
    private billService: BillService,
    @InjectRepository(Appointment)
    private appointmentRepo: Repository<Appointment>,
    @InjectRepository(TimeSlot)
    private timeSlotRepo: Repository<TimeSlot>,
    @InjectRepository(User)
    private userRepo: Repository<User>,
  ) {}
 async findByDate(date: string) {
    return this.appointmentRepo.find({
      where: { date },
      relations: ['patient', 'medecin', 'timeSlot'],
    });
  }
  /**
   * Créer un nouveau rendez-vous
   * Vérifie que le médecin existe, que le créneau est libre, pas déjà réservé
   * Met à jour le TimeSlot → "occupé" + patientId + appointmentId
   */
  async create(dto: { medecinId: number; timeSlotId: number; date: string }, patientId: number) {
    const { medecinId, timeSlotId, date } = dto;

    const medecin = await this.userRepo.findOne({ where: { id: medecinId, role: Role.MEDECIN } });
    if (!medecin) throw new BadRequestException('Médecin non trouvé');

    const timeSlot = await this.timeSlotRepo.findOne({
      where: { id: timeSlotId, medecinId: medecinId as any, date },
    });
    if (!timeSlot) throw new NotFoundException('Créneau introuvable');
    if (timeSlot.status !== 'disponible') throw new BadRequestException('Créneau déjà réservé');

    const existing = await this.appointmentRepo.findOne({
      where: { timeSlotId, deleted_at: IsNull() },
    });
    if (existing) throw new BadRequestException('Créneau déjà réservé');

    const appointment = this.appointmentRepo.create({
      medecinId,
      patientId,
      timeSlotId,
      date,
      status: AppointmentStatus.PENDING,
    });
    const saved = await this.appointmentRepo.save(appointment);

    await this.timeSlotRepo.update(timeSlotId, {
      status: 'occupé',
      patientId,
      appointmentId: saved.id,
    });

    return saved;
  }

  /**
   * Liste tous les RDV du patient connecté (passés et à venir)
   */

  async findByPatient(patientId: number) {
    return this.appointmentRepo.find({
      where: { patientId, deleted_at: IsNull() },
      relations: ['medecin', 'timeSlot', 'patient'],
      order: { date: 'DESC' },
    });
  }

  /**
   * Liste tous les RDV du médecin (utilisé dans l'agenda médecin)
   */

  async findByDoctor(medecinId: number) {
    return this.appointmentRepo.find({
      where: { medecinId, deleted_at: IsNull() },
      relations: ['patient', 'timeSlot'],
      order: { date: 'ASC' },
    });
  }

/**
   * Récupère un RDV avec TOUTES les infos utiles (patient, médecin, créneau, disponibilité)
   * Utilisé pour la page "Détail du rendez-vous"
   */

  async findOneWithAllRelations(id: number) {
  const appointment = await this.appointmentRepo.findOne({
    where: { id },
    relations: [
      'patient',
      'medecin',
      'timeSlot',           // INDISPENSABLE
      'timeSlot.availability', // au cas où
    ],
  });

  if (!appointment) {
    throw new NotFoundException('RDV non trouvé');
  }

  return appointment;
}





  async findByDoctorAndDate(medecinId: number, date: string) {
  return this.appointmentRepo.find({
    where: { medecinId, date, deleted_at: IsNull() },
    relations: ['patient', 'timeSlot'],
    order: { date: 'ASC' },
  });
}


/**
   * Annuler un rendez-vous
   * - Vérifie que c'est bien le patient ou le médecin
   * - Interdit l'annulation si < 24h avant le RDV
   * - Remet le créneau en "disponible"
   */

 async cancel(id: number, userId: number) {
  const appointment = await this.appointmentRepo.findOne({
    where: { id },
    relations: ['timeSlot'],
  });

  if (!appointment) throw new NotFoundException('RDV non trouvé');
  if (appointment.patientId !== userId && appointment.medecinId !== userId) {
    throw new ForbiddenException('Accès refusé');
  }
  if (appointment.status === AppointmentStatus.CANCELLED) {
    throw new BadRequestException('RDV déjà annulé');
  }

  // NOUVEAU : VÉRIFICATION DES 24H
  const appointmentDateTime = new Date(`${appointment.date}T${appointment.timeSlot.startTime}`);
  const now = new Date();
  const hoursDiff = (appointmentDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);

  if (hoursDiff < 24) {
    throw new BadRequestException('Annulation impossible moins de 24h avant le rendez-vous');
  }

  // Si tout est OK → on annule
  appointment.status = AppointmentStatus.CANCELLED;
  await this.appointmentRepo.save(appointment);

  await this.timeSlotRepo.update(appointment.timeSlotId, {
    status: 'disponible',
    patientId: undefined,
    appointmentId: undefined,
  });

  return { message: 'Rendez-vous annulé avec succès' };
}

/**
   * Terminer une consultation
   * Le médecin enregistre le diagnostic et les médicaments prescrits
   * Passe le statut à "terminé"
   */
async complete(id: number, diagnostic: string, medicaments: string) {
  const appointment = await this.appointmentRepo.findOne({
    where: { id },
    relations: ['patient', 'medecin', 'timeSlot'],
  });

  if (!appointment) throw new NotFoundException('RDV non trouvé');
  if (appointment.status === AppointmentStatus.COMPLETED)
    throw new BadRequestException('Consultation déjà terminée');

  appointment.status = AppointmentStatus.COMPLETED;
  appointment.diagnostic = diagnostic;
  appointment.medicaments = medicaments;

  const saved = await this.appointmentRepo.save(appointment);

  // === CREATE BILL AUTOMATICALLY ===
  await this.billService.createFromAppointment(saved.id);

  return saved;
}
}