import { Inject, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { ClarityService } from '../external-api/clarity/clarity.service';
import { MedhubService } from '../external-api/medhub/medhub.service';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TraineeService {
  constructor(
    private medhubService: MedhubService,
    private clarityService: ClarityService,
    private prismaService: PrismaService
  ) {}


}
