import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Request, ForbiddenException } from '@nestjs/common';
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

  @Post('add')
  @Roles(Role.MEDECIN)
  create(@Body() body: any, @Request() req: { user: User }) {
    console.log('Body reçu:', body);
    return this.availabilityService.create(body, req.user.id.toString());
  }

  @Get()
  @Roles(Role.MEDECIN)
  findAll(@Request() req: { user: User }) {
    return this.availabilityService.findAll(req.user.id.toString());
  }

 

@Roles(Role.MEDECIN)
  @Put(':id/status')
  async updateStatus(@Param('id') id: string, @Body('status') status: 'disponible' | 'occupé' | 'annulé', @Request() req: { user: User }) {
    const availability = await this.availabilityService.findOne(+id);
    console.log('Comparaison:', { userId: req.user.id.toString(), medecinId: availability.medecinId.toString() });
    if (req.user.id.toString() !== availability.medecinId.toString()) {
      throw new ForbiddenException('Vous n\'êtes pas autorisé à modifier cette disponibilité.');
    }
    return this.availabilityService.updateStatus(+id, status);
  }

  @Roles(Role.MEDECIN)
  @Put(':id')
  async update(@Param('id') id: string, @Body() body: any, @Request() req: { user: User }) {
    const availability = await this.availabilityService.findOne(+id);
    console.log('Comparaison:', { userId: req.user.id.toString(), medecinId: availability.medecinId.toString() });
    if (req.user.id.toString() !== availability.medecinId.toString()) {
      throw new ForbiddenException('Vous n\'êtes pas autorisé à modifier cette disponibilité.');
    }
    return this.availabilityService.update(+id, body);
  }

  @Roles(Role.MEDECIN)
  @Delete(':id')
  async remove(@Param('id') id: string, @Request() req: { user: User }) {
    const availability = await this.availabilityService.findOne(+id);
    console.log('Comparaison:', { userId: req.user.id.toString(), medecinId: availability.medecinId.toString() });
    if (req.user.id.toString() !== availability.medecinId.toString()) {
      throw new ForbiddenException('Vous n\'êtes pas autorisé à supprimer cette disponibilité.');
    }
    return this.availabilityService.remove(+id);
  }
}