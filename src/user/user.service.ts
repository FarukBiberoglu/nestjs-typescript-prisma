import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateUserSettingsDto } from './dto/update-user-settings.dto';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async createUser(data: CreateUserDto) {
    const existing = await this.prisma.user.findUnique({
      where: { username: data.username },
    });
    if (existing) throw new BadRequestException('Username already taken');

    return this.prisma.user.create({
      data: {
        ...data,
        userSetting: {
          create: {
            notifications: false,
            smsEnabled: true,
          },
        },
      },
    });
  }
  getUser() {
    return this.prisma.user.findMany({
      include: {
        userSetting: true,
      },
    });
  }
  getUserById(id: number) {
    return this.prisma.user.findUnique({
      where: { id },
    });
  }

  async updateUser(id: number, data: UpdateUserDto) {
    const existingUser = await this.getUserById(id);
    if (!existingUser) throw new NotFoundException('User not found');

    if (data.username) {
      const userWithSameUsername = await this.prisma.user.findUnique({
        where: {
          username: data.username,
        },
      });
      if (userWithSameUsername && userWithSameUsername.id !== id) {
        throw new BadRequestException('Username already taken');
      }
    }
    return this.prisma.user.update({
      where: {
        id,
      },
      data,
    });
  }
  async deleteUser(id: number) {
    const findUser = await this.getUserById(id);
    if (!findUser) throw new NotFoundException('User not found');
    return this.prisma.user.delete({
      where: {
        id,
      },
    });
  }

  async updateUserSettingsByUserId(userId: number, dto: UpdateUserSettingsDto) {
    try {
      return await this.prisma.userSettings.update({
        where: { userId },
        data: dto,
      });
    } catch {
      throw new NotFoundException('User settings not found');
    }
  }
}
