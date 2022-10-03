import { type INestApplication, Injectable, type OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaClient } from '@prisma/client';

export * from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  constructor(
    private configService: ConfigService
  ) {
    super({
      datasources: {
        db: {
          url: configService.getOrThrow<string>('DATABASE_URL')
        }
      }
    })
  }
  async onModuleInit() {
    const connection = await this.$connect();
  }

  async enableShutdownHooks(app: INestApplication) {
    this.$on('beforeExit', async () => {
      await app.close();
    });
  }
}
