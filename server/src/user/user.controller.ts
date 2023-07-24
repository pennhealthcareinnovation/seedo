import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { IsPublicRoute } from '../auth/session.guard';

import { PrismaService } from '../prisma/prisma.service';

@IsPublicRoute()
@ApiTags('User')
@Controller('user')
export class UserController {
  constructor(
    private prismaService: PrismaService,
  ) { }

  @Get('/')
  async getUser() {
    return await this.prismaService.user.findUnique({
      where: {
        id: 1
      }
    });
  }
}
