import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { MedhubService } from '../external-api/medhub/medhub.service';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProgramService {
  constructor(
    private medhubService: MedhubService,
    private prismaService: PrismaService
  ) {}
  
  /**
   * Pull and upsert programs from MedHub with their procedureTypes
   */
  async reloadPrograms() {
    const result = await this.medhubService.request({
      endpoint: 'programs/all'
    })

    let newPrograms = result.map((program): Prisma.programsCreateInput => ({
        programID: program.programID,
        name: program.program_name,
        data: program,
    }))

    /** load procedureTYpes for each program */
    const procedureTypes = await Promise.all(
      newPrograms.map(async program => ({
        programID: program.programID, 
        procedureTypes: await this.medhubService.request({
          endpoint: 'procedures/procedureTypes',
          request: { programID: program.programID }
        })
      }))
    )

    newPrograms = newPrograms.map(program => {
      program.procedureTypes = procedureTypes.find(procedureType => procedureType.programID === program.programID).procedureTypes
      return program
    })

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
