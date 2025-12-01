import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Availability } from './entities/availability.entity';
import { TimeSlot } from './entities/time-slot.entity';
import { CreateAvailabilityDto } from './dto/create-availability.dto';

@Injectable()
export class AvailabilityService {
  constructor(
    @InjectRepository(Availability)
    private availabilityRepo: Repository<Availability>,
    @InjectRepository(TimeSlot)
    private timeSlotRepo: Repository<TimeSlot>,
  ) {}

  private readonly SLOT_DURATION = 20;


  /** Créer une nouvelle disponibilité → génère automatiquement les créneaux de 20 min */
  async create(dto: CreateAvailabilityDto, medecinId: string): Promise<Availability> {
    const existing = await this.availabilityRepo.findOne({
      where: { medecinId: Number(medecinId), date: dto.date },
    });
    if (existing) {
      throw new BadRequestException('Vous avez déjà une plage horaire pour cette date.');
    }

    const availability = this.availabilityRepo.create({
      ...dto,
      medecinId: Number(medecinId), 
      status: 'disponible',
    });

    const saved = await this.availabilityRepo.save(availability);
    await this.generateTimeSlots(saved);

    return saved; 
  }

  /** Génère les créneaux toutes les 20 minutes entre startTime et endTime */
  private async generateTimeSlots(availability: Availability) {
    const start = this.timeToMinutes(availability.startTime);
    const end = this.timeToMinutes(availability.endTime);

    for (let time = start; time < end; time += this.SLOT_DURATION) {
      const startTime = this.minutesToTime(time);
      const endTime = this.minutesToTime(time + this.SLOT_DURATION);

      const slot = this.timeSlotRepo.create({
        availabilityId: availability.id,
        medecinId: availability.medecinId, 
        date: availability.date,
        startTime,
        endTime,
        status: 'disponible' as const,
      });

      await this.timeSlotRepo.save(slot);
    }
  }
/** Convertit "09:30" → 570 minutes */
  private timeToMinutes(time: string): number {
    const [h, m] = time.split(':').map(Number);
    return h * 60 + m;
  }
/** Convertit 570 minutes → "09:30" */
  private minutesToTime(minutes: number): string {
    const h = Math.floor(minutes / 60).toString().padStart(2, '0');
    const m = (minutes % 60).toString().padStart(2, '0');
    return `${h}:${m}`;
  }


/** Récupérer toutes les disponibilités du médecin */
  async findAll(medecinId: string) {
    return this.availabilityRepo.find({ where: { medecinId: Number(medecinId) } });
  }


  /** Récupérer une disponibilité par ID */
  async findOne(id: number): Promise<Availability> {
    const availability = await this.availabilityRepo.findOne({ where: { id } });
    if (!availability) throw new NotFoundException(`Disponibilité non trouvée.`);
    return availability;
  }


  /** Récupérer toutes les dates disponibles d'un médecin  */
  async findByMedecinId(medecinId: string): Promise<Availability[]> {
    return this.availabilityRepo.find({
      where: { medecinId: Number(medecinId) },
      order: { date: 'ASC' },
    });
  }

/**
   * Récupère tous les créneaux d'une date pour un médecin
   * Gère les RDV annulés → les créneaux redeviennent libres
   */

async getTimeSlotsByDate(medecinId: string, date: string): Promise<any[]> {
  const normalizedDate = date.substring(0, 10);

  const slots = await this.timeSlotRepo
    .createQueryBuilder('slot')
    .where('slot.medecinId = :medecinId', { medecinId: Number(medecinId) })
    .andWhere('slot.date = :date', { date: normalizedDate })
    .leftJoinAndSelect('slot.appointment', 'appointment')
    .leftJoinAndSelect('appointment.patient', 'patient')
    .orderBy('slot.startTime', 'ASC')
    .getMany();

  return slots.map(slot => {
    // Si le RDV existe mais est annulé → on force "disponible"
    if (slot.appointment && slot.appointment.status === 'annulé') {
      return {
        ...slot,
        status: 'disponible',
        patient: null,
        appointment: null, 
      };
    }

    if (slot.appointment) {
      return {
        ...slot,
        status: 'occupé',
        patient: slot.appointment.patient,
        appointment: {
          id: slot.appointment.id,
          status: slot.appointment.status,
        },
      };
    }

    return {
      ...slot,
      status: 'disponible',
      patient: null,
      appointment: null,
    };
  });
}


/** Modifier une disponibilité : supprime et régénère tous les créneaux */
async update(id: number, body: any, medecinId: string) {
    const avail = await this.availabilityRepo.findOneOrFail({ where: { id } });
    if (avail.medecinId !== Number(medecinId)) {
      throw new BadRequestException('Accès refusé');
    }

    await this.timeSlotRepo.delete({ availabilityId: id });
    Object.assign(avail, body);
    const updated = await this.availabilityRepo.save(avail);
    await this.generateTimeSlots(updated);
    return updated;
  }

  /** Supprimer une disponibilité → soft delete + suppression des créneaux */
  async remove(id: number, medecinId: string) {
    const avail = await this.availabilityRepo.findOneOrFail({ where: { id } });
    if (avail.medecinId !== Number(medecinId)) {
      throw new BadRequestException('Accès refusé');
    }

    await this.timeSlotRepo.delete({ availabilityId: id });
    await this.availabilityRepo.softDelete(id);
  }
}