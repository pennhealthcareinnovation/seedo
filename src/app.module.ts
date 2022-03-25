import { Module } from '@nestjs/common';

import { AppController } from './app.controller';
import { DatabaseModule } from './database/database.module';
import { ExternalApiModule } from './external-api/external-api.module';
import { TasksModule } from './tasks/tasks.module';

@Module({
  imports: [
    ExternalApiModule, // PCX, Epic, Clarity
    DatabaseModule, // Postgres
    TasksModule
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
