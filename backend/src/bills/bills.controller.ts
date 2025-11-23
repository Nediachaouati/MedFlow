import { Controller, Post, Param, Get, UseGuards, Patch, Body, Request } from '@nestjs/common';
import { BillsService } from './bills.service';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Roles } from 'src/auth/decorators/roles.decorator';
import { Role } from 'src/role.enum';

@Controller('bills')
@UseGuards(JwtAuthGuard, RolesGuard)
export class BillsController {
  constructor(private readonly billsService: BillsService) {}

  // Create a bill from an existing appointment (manual action)
  @Roles(Role.ADMIN, Role.RECEPTIONNISTE, Role.MEDECIN)
  @Post('from-appointment/:appointmentId')
  createFromAppointment(@Param('appointmentId') appointmentId: string) {
    return this.billsService.createFromAppointment(+appointmentId);
  }

  // List all bills (admin / receptionist)
  @Roles(Role.ADMIN, Role.RECEPTIONNISTE)
  @Get()
  findAll() {
    return this.billsService.findAll();
  }

  // Patient can fetch own bill (we assume req.user.id is patient id)
  @Roles(Role.PATIENT)
  @Get('my')
  findMy(@Request() req: any) {
    return this.billsService.findByPatient(req.user.id);
  }

  // Get single bill (patient OR receptionist/admin)
  @Roles(Role.ADMIN, Role.RECEPTIONNISTE, Role.PATIENT)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.billsService.findOne(+id);
  }

  // Mark bill as paid
  @Roles(Role.RECEPTIONNISTE, Role.ADMIN)
  @Patch(':id/pay')
  pay(@Param('id') id: string, @Body() body: { method: string }) {
    return this.billsService.pay(+id, body.method);
  }
}
