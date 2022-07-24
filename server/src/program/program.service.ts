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
   * Get "active" programs - programs which have at least one defined task
   */
  async activePrograms() {
    const programs = await this.prismaService.programs.findMany({
      include: {
        _count: {
          select: {
            tasks: true
          }
        }
      }
    })
    const activeProgrmas = programs.filter(program => program._count.tasks > 0)

    return activeProgrmas
  }

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

  /**
   * Upsert program trainees from Medhub API
   * @param id - internal program id, *not* medhub program id
   */
  async reloadProgramFaculty(id: number) {
    const program = await this.prismaService.programs.findUnique({ where: { id } })
    const faculty = await this.medhubService.request({
      endpoint: 'users/faculty',
      request: { programID: program.medhubProgramId }
    })

    const newFaculty = faculty.map((facultyMember): Prisma.facultyCreateInput => ({
      medhubUserId: facultyMember.userID,
      email: facultyMember.email,
      employeeId: facultyMember.employeeID,
      lastName: facultyMember.name_last,
      firstName: facultyMember.name_first,
      program: { connect: { id } }
    }))

    const result = await this.prismaService.$transaction([
      ...newFaculty.map(facultyMember =>
        this.prismaService.faculty.upsert({
          where: { medhubUserId: facultyMember.medhubUserId },
          update: facultyMember,
          create: facultyMember
        })
      )
    ])

    return result
  }

  /**
   * Upsert program trainees from Medhub API
   * @param id - internal program id, *not* medhub program id
   * @returns 
   */
  async reloadProgramTrainees(id: number) {
    const program = await this.prismaService.programs.findUnique({ where: { id } })
    const trainees = await this.medhubService.request({
      endpoint: `users/residents`,
      request: { programID: program.medhubProgramId }
    })

    const newTrainees = trainees.map((trainee): Prisma.traineesCreateInput => ({
      medhubUserId: trainee.userID,
      email: trainee.email,
      employeeId: trainee.employeeID,
      lastName: trainee.name_last,
      firstName: trainee.name_first,
      data: trainee,

      programs: {
        connect: { id }
      }
    }))

    const result = await this.prismaService.$transaction(
      newTrainees.map(trainee =>
        this.prismaService.trainees.upsert({
          where: { medhubUserId: trainee.medhubUserId },
          create: trainee,
          update: trainee
        })
      )
    )

    return result
  }
}
