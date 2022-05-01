import { Inject, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { MedhubService } from 'src/external-api/medhub/medhub.service';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class TraineeService {
  constructor(
    private medhubService: MedhubService,
    private prismaService: PrismaService
  ) {}

  async reloadProgramTrainees(programID: string) {
    const trainees = await this.medhubService.request({
      endpoint: `users/residents`,
      request: { programID }
    })

    const newTrainees = trainees.map((trainee): Prisma.traineesCreateInput => ({
      medhubUserId: trainee.userID,
      pennId: trainee.employeeID,
      lastName: trainee.name_last,
      firstName: trainee.name_first,
      data: trainee,
      
      programs: {
        connect: { programID: trainee.programID }
      }
    }))

    await this.prismaService.$transaction(
      newTrainees.map(trainee =>
        this.prismaService.trainees.upsert({
          where: { medhubUserId: trainee.medhubUserId },
          create: trainee,
          update: trainee
        })
      )
    )

    return await this.prismaService.trainees.findMany()
  }
}
