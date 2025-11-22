import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
  ForbiddenException,
  BadRequestException,
  Query,
} from '@nestjs/common';
import { AvailabilityService } from './availability.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../role.enum';
import { User } from '../users/entities/user.entity';

@Controller('availability')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AvailabilityController {
  constructor(private readonly availabilityService: AvailabilityService) {}

  /** Médecin ajoute une nouvelle plage horaire (ex: 09:00–17:00) */
  @Post('add')
  @Roles(Role.MEDECIN)
  create(@Body() body: any, @Request() req: { user: User }) {
    return this.availabilityService.create(body, req.user.id.toString());
  }

  /** Récupérer toutes les disponibilités du médecin connecté */
  @Get()
  @Roles(Role.MEDECIN)
  findAll(@Request() req: { user: User }) {
    return this.availabilityService.findAll(req.user.id.toString());
  }

  /** Route publique : voir les dates où un médecin est disponible */
  @Get('public')
  @Roles(Role.PATIENT, Role.MEDECIN, Role.ADMIN)
  async findByMedecinId(@Query('medecinId') medecinId: string) {
    if (!medecinId) throw new BadRequestException('medecinId est requis');
    return this.availabilityService.findByMedecinId(medecinId);
  }

  // NOUVELLE ROUTE PROPRE ET SÉCURISÉE
/*@Get('doctor/slots/:date')
@Roles(Role.MEDECIN)
async getDoctorSlots(
  @Param('date') date: string,
  @Request() req: any,
) {
  return this.availabilityService.getTimeSlotsByDate(req.user.id.toString(), date);
}*/


/**
   * NOUVELLE ROUTE PROPRE POUR LE MÉDECIN
   * Ex: GET /availability/doctor/slots/2025-11-22
   * → Renvoie tous les créneaux du jour pour le médecin connecté
   */
@Get('doctor/slots/:date')
@Roles(Role.MEDECIN)
async getDoctorSlots(
  @Param('date') date: string,
  @Request() req: any,
) {
  return this.availabilityService.getTimeSlotsByDate(req.user.id.toString(), date);
}

/** Route classique pour patient/réceptionniste : voir créneaux d'un médecin */
  @Get('slots')
  @Roles(Role.PATIENT, Role.MEDECIN, Role.RECEPTIONNISTE)
  async getSlots(@Query('medecinId') medecinId: string, @Query('date') date: string) {
    if (!medecinId || !date) throw new BadRequestException('medecinId et date sont requis');
    return this.availabilityService.getTimeSlotsByDate(medecinId, date);
  }


  /** Modifier une plage horaire existante */
  @Put(':id')
  @Roles(Role.MEDECIN)
  async update(
    @Param('id') id: string,
    @Body() body: any,
    @Request() req: { user: User },
  ) {
    const availability = await this.availabilityService.findOne(+id);
    // COMPARAISON CORRECTE : number === number
    if (availability.medecinId !== req.user.id) {
      throw new ForbiddenException('Accès refusé.');
    }
    return this.availabilityService.update(+id, body, req.user.id.toString());
  }


  /** Supprimer une disponibilité (soft delete) */
  @Delete(':id')
  @Roles(Role.MEDECIN)
  async remove(@Param('id') id: string, @Request() req: { user: User }) {
    const availability = await this.availabilityService.findOne(+id);
    // COMPARAISON CORRECTE
    if (availability.medecinId !== req.user.id) {
      throw new ForbiddenException('Vous n\'êtes pas autorisé à supprimer cette disponibilité.');
    }
    await this.availabilityService.remove(+id, req.user.id.toString());
    return { message: 'Disponibilité supprimée avec succès.' };
  }
}