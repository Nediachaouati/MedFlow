import { BadRequestException, Body, Controller, Delete, Get, Param, Post, Put, Query, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
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

  @Roles(Role.ADMIN, Role.RECEPTIONNISTE)
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
  @Delete(':id')
  async deleteUser(@Param('id') id: string) {
    await this.usersService.softDeleteUser(+id);
    return { message: `Utilisateur avec l'ID ${id} supprimé avec succès` };
  }
  


}