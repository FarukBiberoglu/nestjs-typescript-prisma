import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';

@Injectable()
export class PostService {
  constructor(private prisma: PrismaService) {}

  create(dto: CreatePostDto) {
    return this.prisma.post.create({
      data: {
        title: dto.title,
        description: dto.description,
        user: { connect: { id: dto.userId } },
      },
    });
  }

  findAll() {
    return this.prisma.post.findMany({
      include: { user: true },
      orderBy: { id: 'desc' },
    });
  }

  findById(id: number) {
    return this.prisma.post.findUnique({
      where: { id },
      include: { user: true },
    });
  }

  async update(id: number, dto: UpdatePostDto) {
    const existing = await this.prisma.post.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Post not found');

    return this.prisma.post.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: number) {
    const existing = await this.prisma.post.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Post not found');

    return this.prisma.post.delete({ where: { id } });
  }
}
