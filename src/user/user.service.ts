import { ConflictException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { CreateUserDto } from './dto/createUser.dto';
import * as bcrypt from 'bcrypt';
import { User } from '@prisma/client';
import { UserDto } from './dto/user.dto';
import { UpdateUserDto } from './dto/updateUser.dto';
import { Validator } from 'src/validation';

@Injectable()
export class UserService {
  constructor(
    private prismaService: PrismaService,
    private validator: Validator,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const { email, password, passwordConfirmation } = createUserDto;

    await this.validator.validatingEmail(email);

    if (password !== passwordConfirmation) {
      throw new ConflictException('Senhas digitas não estão iguais.');
    }

    delete createUserDto.passwordConfirmation;

    const hashedPassword = await bcrypt.hash(password, 10);

    const createdUser = await this.prismaService.user.create({
      data: {
        ...createUserDto,
        password: hashedPassword,
      },
      include: { Table: true },
    });

    delete createUserDto.password;

    return createdUser;
  }

  async findMany(): Promise<UserDto[]> {
    const users = await this.prismaService.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        createAt: true,
        updateAt: true,
      },
    });
    return users;
  }

  async findUnique(userId: string): Promise<User> {
    const userFinded = await this.validator.findUserId(userId);

    delete userFinded.password;
    return userFinded;
  }

  async update(userId: string, updateUserDto: UpdateUserDto): Promise<User> {
    const { name, email, role } = updateUserDto;

    await this.validator.findUserId(userId);

    // await this.validator.validatingEmail(email);

    if (email) {
      const emailExisting = await this.prismaService.user.findUnique({
        where: { email: email },
      });
      if (emailExisting) {
        throw new ConflictException('email já cadastrado');
      }
    }

    const updatedUser = await this.prismaService.user.update({
      where: { id: userId },
      data: {
        email: email,
        name: name,
        role: role,
      },
      include: { Table: true },
    });

    delete updatedUser.password;
    return updatedUser;
  }

  async delete(userId: string): Promise<User> {
    await this.validator.findUserId(userId);

    const deletedUser = await this.prismaService.user.delete({
      where: { id: userId },
      include: { Table: true },
    });

    delete deletedUser.password;
    return deletedUser;
  }
}
