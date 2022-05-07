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

  async reloadProgramTrainees(programID: string) {
    const trainees = await this.medhubService.request({
      endpoint: `users/residents`,
      request: { programID }
    })
    const employeeInfo = await this.clarityService.employeeInfo(
      trainees.map(trainee => trainee.employeeID)
    )

    const newTrainees = trainees.map((trainee): Prisma.traineesCreateInput => ({
      medhubUserId: trainee.userID,
      pennId: trainee.employeeID,
      lastName: trainee.name_last,
      firstName: trainee.name_first,
      data: trainee,
      
      programs: {
        connect: { programID: trainee.programID }
      },

      ehrMetadata: {
        create: {
          data: employeeInfo.find(info => info.user_alias === trainee.employeeID)
        }
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
