import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { MedhubService } from 'src/external-api/medhub/medhub.service';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ProgramService {
  constructor(
    private medhubService: MedhubService,
    private prismaService: PrismaService
  ) {}
  
  /**
   * Pull and upsert programs from MedHub
   */
  async reloadPrograms() {
    const result = await this.medhubService.request({
      endpoint: 'programs/all'
    })

    const newPrograms = result.map((program): Prisma.programsCreateInput => ({
        programID: program.programID,
        name: program.program_name,
        data: program,
    }))

    await this.prismaService.$transaction(
      newPrograms.map(program => 
        this.prismaService.programs.upsert({
          where: { programID: program.programID },
          update: program,
          create: program
        })
      )
    )

    return await this.prismaService.programs.findMany()
  }
}
