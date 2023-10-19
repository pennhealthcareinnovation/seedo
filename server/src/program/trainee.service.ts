import { Inject, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { MedhubService } from '../external-api/medhub/medhub.service';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TraineeService {
  constructor(
    private medhubService: MedhubService,
    private prismaService: PrismaService
  ) {}


}
