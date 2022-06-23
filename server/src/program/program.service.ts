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
   * Pull and upsert programs from MedHub
   */
  async reloadPrograms() {
    const result = await this.medhubService.request({
      endpoint: 'programs/all'
    })

    const newPrograms = result.map((program): Prisma.programsCreateInput => ({
      medhubProgramId: program.programID,
        name: program.program_name,
        data: program,
    }))

    await this.prismaService.$transaction([
      ...newPrograms.map(program =>
        this.prismaService.programs.upsert({
          where: { medhubProgramId: program.medhubProgramId },
          update: program,
          create: program
        })
      )
    ])

    return await this.prismaService.programs.findMany()
  }

  /** Upsert program procedure types */
  async reloadProcedureTypes(id: number) {
    const program = await this.prismaService.programs.findUnique({ where: { id } })
    const programProcedureTypes = await this.medhubService.request({
      endpoint: 'procedures/procedureTypes',
      request: { programID: program.medhubProgramId }
    })

    const newProcedureTypes = programProcedureTypes.map((procedureType): Prisma.procedureTypesCreateInput => ({
      medhubProcedureTypeId: procedureType.typeID,
      name: procedureType.procedure_name,
      program: { connect: { id } },
    }))

    await this.prismaService.$transaction([
      ...newProcedureTypes.map(procedureType =>
        this.prismaService.procedureTypes.upsert({
          where: { medhubProcedureTypeId: procedureType.medhubProcedureTypeId },
          update: procedureType,
          create: procedureType
        })
      )
    ])
  }
}
