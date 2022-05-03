import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ObservationService {
  constructor(
    private prismaService: PrismaService,
  ) {}

  async createMany(args) {
    return this.prismaService.observations.createMany(args)
  }
}
