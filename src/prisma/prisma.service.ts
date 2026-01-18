import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    const databaseUrl = process.env['DATABASE_URL'];

    if (
      databaseUrl?.startsWith('prisma://') ||
      databaseUrl?.startsWith('prisma+postgres://')
    ) {
      super({ accelerateUrl: databaseUrl });
      return;
    }
    if (!databaseUrl) {
      throw new Error(
        'DATABASE_URL bulunamadı. `.env` dosyanı veya environment değişkenlerini kontrol et.',
      );
    }

    const adapter = new PrismaPg({ connectionString: databaseUrl });
    super({ adapter });
  }

  async onModuleInit() {
    await this.$connect();
    this.logger.log('Connected to Db');
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
