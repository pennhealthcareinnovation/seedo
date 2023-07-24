import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { IsPublicRoute } from '../auth/session.guard';

import { PrismaService } from '../prisma/prisma.service';

@IsPublicRoute()
@ApiTags('Program')
@Controller('trainees')
export class TraineeController {
  constructor(
    private prismaService: PrismaService,
  ) { }

  @Get('/')
  async get() {
    return await this.prismaService.trainees.findMany();
  }
}
