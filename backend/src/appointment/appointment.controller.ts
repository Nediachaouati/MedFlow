import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Put,
  UseGuards,
  Request,
  Query,
  BadRequestException, 
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { AppointmentService } from './appointment.service';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Role } from 'src/role.enum';

@Controller('appointments')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AppointmentController {
  constructor(private readonly appointmentService: AppointmentService) {}
  
  
@Get()
@Roles(Role.RECEPTIONNISTE, Role.ADMIN) 
async findByDate(@Query('date') date: string) {
  if (!date) throw new BadRequestException('Paramètre date requis');
  return this.appointmentService.findByDate(date);
}

@Roles(Role.RECEPTIONNISTE)
@Get('with-bills')
async findByDateWithBills(@Query('date') date: string) {
  if (!date) throw new BadRequestException('Paramètre date requis');
    return this.appointmentService.findByDateWithBills(date);
  }

  @Get('available-slots')
@Roles(Role.PATIENT, Role.RECEPTIONNISTE, Role.MEDECIN) 
async getAvailableSlots(
  @Query('medecinId') medecinId: string,
  @Query('date') date: string,
) {
  if (!medecinId || !date) {
    throw new BadRequestException('medecinId et date sont requis');
  }
  return this.appointmentService.getAvailableSlots(+medecinId, date);
}

  /**
   * Créer un rendez-vous
   * - Patient peut se prendre un RDV lui-même
   * - Réceptionniste peut prendre un RDV pour un autre patient 
   */
  @Roles(Role.PATIENT,Role.RECEPTIONNISTE)
  @Post('add')
  create(
  @Body() body: { medecinId: number; timeSlotId: number; date: string; patientId?: number },
  @Request() req: any,
) {
  const patientId = body.patientId || req.user.id;
  return this.appointmentService.create(body, patientId);
}

/**
   * Récupérer tous MES rendez-vous 
   */
  @Roles(Role.PATIENT)
  @Get('my')
  findMy(@Request() req: any) {
    return this.appointmentService.findByPatient(req.user.id);
  }

/**
   * Récupérer un RDV précis   
   */
  @Get(':id')
@Roles(Role.MEDECIN, Role.PATIENT)
async findOne(@Param('id') id: string) {
  return this.appointmentService.findOneWithAllRelations(+id);
}

/**
   * Récupérer tous les RDV du médecin connecté 
   */
  @Roles(Role.MEDECIN)
  @Get('doctor')
  findDoctor(@Request() req: any) {
    return this.appointmentService.findByDoctor(req.user.id);
  }


  /**
   * Annuler un rendez-vous
   * Patient  peut annuler 
   */
  @Roles(Role.PATIENT, Role.MEDECIN)
  @Put(':id/cancel')
  cancel(@Param('id') id: string, @Request() req: any) {
    return this.appointmentService.cancel(+id, req.user.id);
  }


  /**
   * Marquer une consultation comme terminée
   * Le médecin entre le diagnostic + ordonnance
   */
  @Roles(Role.MEDECIN,Role.RECEPTIONNISTE)
@Put(':id/complete')
async complete(
  @Param('id') id: string,
  @Body() body: { diagnostic: string; medicaments: string },
) {
  return this.appointmentService.complete(+id, body.diagnostic, body.medicaments);
}

/** facturation */
@Roles(Role.RECEPTIONNISTE)
@Put(':id/finish-and-bill')
async finishAndGenerateBill(@Param('id') id: string) {
  return this.appointmentService.finishAndGenerateBill(+id);
}
}