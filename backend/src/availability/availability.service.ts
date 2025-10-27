import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Availability } from './entities/availability.entity';

@Injectable()
export class AvailabilityService {
  constructor(
    @InjectRepository(Availability)
    private availabilityRepository: Repository<Availability>,
  ) {}

  async create(body: any, medecinId: string): Promise<Availability> {
    console.log('Données reçues:', body);

    if (!body || typeof body !== 'object' || !body.day || !body.date || !body.startTime || !body.endTime) {
      throw new BadRequestException('Les champs day, date, startTime et endTime sont requis.');
    }

    const { day, date, startTime, endTime } = body;

    if (!day || !date || !startTime || !endTime) {
      throw new BadRequestException('Tous les champs doivent être remplis.');
    }

    const existing = await this.availabilityRepository.findOne({
      where: { day, date, medecinId },
    });
    if (existing) {
      throw new BadRequestException(`Une disponibilité existe déjà pour le jour ${day} et la date ${date}.`);
    }

    const availability = this.availabilityRepository.create({
      medecinId,
      day,
      date,
      startTime,
      endTime,
      status: 'disponible',
    });
    return this.availabilityRepository.save(availability);
  }

  async findAll(medecinId: string): Promise<Availability[]> {
    return this.availabilityRepository.find({
      where: { medecinId },
      order: { day: 'ASC', date: 'ASC', startTime: 'ASC' },
    });
  }

  async findOne(id: number): Promise<Availability> {
    const availability = await this.availabilityRepository.findOne({ where: { id } });
    if (!availability) {
      throw new NotFoundException(`Disponibilité avec ID ${id} non trouvée.`);
    }
    return availability;
  }

  async updateStatus(id: number, status: 'disponible' | 'occupé' | 'annulé'): Promise<Availability> {
    const availability = await this.findOne(id);
    availability.status = status;
    return this.availabilityRepository.save(availability);
  }

  async update(id: number, body: any): Promise<Availability> {
    const availability = await this.findOne(id);

    const { day, date, startTime, endTime } = body;
    if (day) availability.day = day;
    if (date) availability.date = date;
    if (startTime) availability.startTime = startTime;
    if (endTime) availability.endTime = endTime;

    return this.availabilityRepository.save(availability);
  }

  async remove(id: number): Promise<void> {
    const availability = await this.findOne(id);
    await this.availabilityRepository.remove(availability);
  }
}