import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  UseGuards,
  Request,
} from '@nestjs/common';
import { AppointmentService } from './appointment.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';
import { UpdateAppointmentDto } from './dto/update-appointment.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../role.enum';

@Controller('appointments')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AppointmentController {
  constructor(private readonly appointmentService: AppointmentService) {}

  @Roles(Role.PATIENT)
  @Post('add')
  create(@Body() dto: CreateAppointmentDto, @Request() req) {
    return this.appointmentService.create(dto, req.user.id);
  }

  @Roles(Role.PATIENT)
  @Get('my')
  findMy(@Request() req) {
    return this.appointmentService.findByPatient(req.user.id);
  }

  @Roles(Role.MEDECIN)
  @Get('doctor')
  findDoctor(@Request() req) {
    return this.appointmentService.findByDoctor(req.user.id);
  }

  @Roles(Role.PATIENT, Role.MEDECIN)
  @Put(':id/cancel')
  cancel(@Param('id') id: string, @Request() req) {
    return this.appointmentService.cancel(+id, req.user.id);
  }

  @Roles(Role.ADMIN)
  @Put(':id')
  update(@Param('id') id: string, @Body() dto: UpdateAppointmentDto) {
    return this.appointmentService.update(+id, dto);
  }

  @Roles(Role.ADMIN)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.appointmentService.remove(+id);
  }
}