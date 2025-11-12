import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, IsNull } from 'typeorm';
import { User } from './entities/user.entity';
import * as bcrypt from 'bcryptjs';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Role } from '../role.enum';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async findUsersByRoles(role: Role): Promise<User[]> {
    return this.usersRepository.find({ where: { role } });
  }

  async findByIds(ids: number[]): Promise<User[]> {
    return this.usersRepository.find({ where: { id: In(ids) } });
  }

  async findReceptionnisteByMedecin(medecinId: number): Promise<User[]> {
    return this.usersRepository.find({
      where: { role: Role.RECEPTIONNISTE, medecinId, deleted_at: IsNull() },
    });
  }

  async findAllReceptionniste(): Promise<User[]> {
    return this.usersRepository.find({ where: { role: Role.RECEPTIONNISTE } });
  }

  async findOneById(id: number): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) throw new NotFoundException(`Utilisateur avec l'ID ${id} non trouvé`);
    return user;
  }

  async findById(id: number): Promise<User> {
    return this.findOneById(id);
  }

  async softDeleteUser(id: number): Promise<void> {
    await this.usersRepository.softDelete(id);
  }

  async delete(id: number): Promise<void> {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) throw new NotFoundException(`Utilisateur avec l'ID ${id} non trouvé`);
    await this.usersRepository.delete(id);
  }

  async findOne(email: string, selectSecrets: boolean = false): Promise<User | null> {
    return this.usersRepository.findOne({
      where: { email },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        password: selectSecrets,
      },
    });
  }

 async findByRole(role: string): Promise<User[]> {
  // Convertir string → Role enum
  const roleEnum = Role[role as keyof typeof Role];
  if (!roleEnum) {
    throw new BadRequestException('Rôle invalide');
  }

  return this.usersRepository.find({
    where: { role: roleEnum, deleted_at: IsNull() },
    select: ['id', 'name', 'email'],
  });
}

  async create(dto: CreateUserDto): Promise<User> {
    const { email, password, name, phoneNumber, address, birthDate } = dto;
    const hashedPassword = await bcrypt.hash(password, await bcrypt.genSalt());

    const user = this.usersRepository.create({
      email,
      password: hashedPassword,
      name,
      phoneNumber,
      address,
      birthDate,
      role: Role.PATIENT,
    });

    const newUser = await this.usersRepository.save(user);
    delete newUser.password;
    return newUser;
  }

  async createWithRole(dto: CreateUserDto, role: Role): Promise<{ user: User; plainPassword: string }> {
    const { email, password, name, medecinId } = dto;

    let medecin: User | undefined;
    if (role === Role.RECEPTIONNISTE && medecinId) {
      medecin = await this.findOneById(medecinId);
      if (medecin.role !== Role.MEDECIN)
        throw new BadRequestException('L’utilisateur assigné doit être un médecin.');
    }

    const hashedPassword = await bcrypt.hash(password, await bcrypt.genSalt());

    const user = this.usersRepository.create({
      email,
      password: hashedPassword,
      name,
      role,
      medecinId: role === Role.RECEPTIONNISTE ? medecinId : undefined,
    });

    const newUser = await this.usersRepository.save(user);
    delete (newUser as any).password;

    return { user: newUser, plainPassword: password };
  }
  

  async update(id: number, updateUserDto: UpdateUserDto, photo?: Express.Multer.File): Promise<User> {
    const user = await this.findOneById(id);

    if (updateUserDto.email !== undefined) user.email = updateUserDto.email;
    if (updateUserDto.name !== undefined) user.name = updateUserDto.name;
    if (updateUserDto.phoneNumber !== undefined) user.phoneNumber = updateUserDto.phoneNumber;
    if (updateUserDto.address !== undefined) user.address = updateUserDto.address;
    if (updateUserDto.birthDate !== undefined) user.birthDate = updateUserDto.birthDate;

    if (updateUserDto.password !== undefined) {
      user.password = await bcrypt.hash(updateUserDto.password, await bcrypt.genSalt());
    }

    if (photo) {
      user.photo = `uploads/photos/${photo.filename}`;
    }

    await this.usersRepository.save(user);
    delete user.password;
    return user;
  }
}
