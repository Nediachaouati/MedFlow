import { BadRequestException, Body, Controller, Delete, ForbiddenException, Get, Param, Post, Put, Query, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Role } from '../role.enum';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { MailerService } from '@nestjs-modules/mailer';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class UsersController {
  constructor(private usersService: UsersService, private mailerService: MailerService) {}

  @Roles(Role.ADMIN, Role.PATIENT, Role.RECEPTIONNISTE)
  @Get()
  async findUsersByRole(@Query('role') role: string) {
    if (!Object.values(Role).includes(role as Role)) {
      throw new BadRequestException(`Rôle invalide: ${role}`);
    }
    return this.usersService.findUsersByRoles(role as Role);
  }

  @Roles(Role.ADMIN, Role.PATIENT, Role.RECEPTIONNISTE)
  @Get('ids')
  async findUsersByIds(@Query('ids') ids: string) {
    const idArray = ids.split(',').map(Number);
    if (idArray.some(isNaN)) throw new BadRequestException('Les IDs doivent être des nombres valides');
    return this.usersService.findByIds(idArray);
  }

  @Roles(Role.ADMIN, Role.MEDECIN)
  @Get('receptionniste/:medecinId')
  async findReceptionnisteByMedecin(@Param('medecinId') medecinId: string) {
    return this.usersService.findReceptionnisteByMedecin(+medecinId);
  }

  @Roles(Role.ADMIN)
  @Get('receptionniste')
  findAllReceptionniste() {
    return this.usersService.findAllReceptionniste();
  }

  @Get('profile')
  async getProfile(@CurrentUser() user: User) {
    return this.usersService.findById(user.id);
  }

  //Liste des médecins 
  @Get()
@Roles(Role.PATIENT, Role.RECEPTIONNISTE, Role.ADMIN)
async findByRole(@Query('role') role: string) {
  if (role === 'MEDECIN') {
    return this.usersService.findByRole(role);
  }
  throw new BadRequestException('Rôle non autorisé');
}
  @Put('profile')
  @UseInterceptors(
    FileInterceptor('photo', {
      storage: diskStorage({
        destination: './uploads/photos',
        filename: (_, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          cb(null, `photo-${uniqueSuffix}${extname(file.originalname)}`);
        },
      }),
      fileFilter: (_, file, cb) => {
        if (!file.mimetype.match(/\/(jpg|jpeg|png|gif)$/)) {
          return cb(new Error('Seules les images sont autorisées (jpg, jpeg, png, gif)'), false);
        }
        cb(null, true);
      },
    }),
  )
  async updateProfile(@CurrentUser() user: User, @Body() dto: UpdateUserDto, @UploadedFile() photo: Express.Multer.File) {
    return this.usersService.update(user.id, dto, photo);
  }

  @Roles(Role.ADMIN)
  @Post('add-medecin')
  async addMedecin(@Body() dto: CreateUserDto) {
    const { user, plainPassword } = await this.usersService.createWithRole(dto, Role.MEDECIN);

    try {
      await this.mailerService.sendMail({
        to: user.email,
        subject: 'Détails de votre compte Médecin',
        template: 'welcome-medecin',
        context: { name: user.name || 'MEDECIN', email: user.email, password: plainPassword },
      });
    } catch (error) {
      console.error('Erreur lors de l’envoi de l’email :', error);
    }

    return user;
  }

  @Roles(Role.RECEPTIONNISTE)
  @Post('add-patient')
  async addPatient(@Body() dto: CreateUserDto) {
  return this.createWithRoleAndEmail(dto, Role.PATIENT);
}

  @Roles(Role.ADMIN)
  @Post('add-receptionniste')
  async addReceptionniste(@Body() dto: CreateUserDto) {
    const { user, plainPassword } = await this.usersService.createWithRole(dto, Role.RECEPTIONNISTE);

    try {
      await this.mailerService.sendMail({
        to: user.email,
        subject: 'Détails de votre compte Receptionniste',
        template: 'welcome-receptionniste',
        context: { name: user.name || 'RECEPTIONNISTE', email: user.email, password: plainPassword },
      });
    } catch (error) {
      console.error('Erreur lors de l’envoi de l’email :', error);
    }

    return user;
  }


  @Roles(Role.ADMIN)
  @Delete('admin/:id')
  async deleteUser(@Param('id') id: string) {
  await this.usersService.softDeleteUser(+id);
  return { message: `Utilisateur avec l'ID ${id} supprimé avec succès` };
}


  @Roles(Role.RECEPTIONNISTE)
  @Delete('patient/:id')
  async deletePatient(@Param('id') id: string) {
  const user = await this.usersService.findById(+id);
  if (user.role !== Role.PATIENT) {
    throw new ForbiddenException('Vous ne pouvez supprimer que des patients.');
  }
  await this.usersService.softDeleteUser(+id);
  return { message: `Patient avec l'ID ${id} supprimé avec succès` };
}
  
private async createWithRoleAndEmail(dto: CreateUserDto, role: Role) {
  const { user, plainPassword } = await this.usersService.createWithRole(dto, role);

  try {
    const template = 
      role === Role.PATIENT ? 'welcome-patient' :
      role === Role.MEDECIN ? 'welcome-medecin' :
      'welcome-receptionniste';

    await this.mailerService.sendMail({
      to: user.email,
      subject: `Détails de votre compte ${role}`,
      template,
      context: { name: user.name || role, email: user.email, password: plainPassword },
    });
  } catch (error) {
    console.error('Erreur email :', error);
  }

  return user;
}


}