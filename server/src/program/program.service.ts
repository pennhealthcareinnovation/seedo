import { Injectable, Logger } from '@nestjs/common';
import { Prisma } from '@prisma/client';

import { MedhubService } from '../external-api/medhub/medhub.service';
import { Faculty, Resident } from '../external-api/medhub/medhub.types';
import { LogService } from '../log/log.service';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProgramService {
  constructor(
    private medhubService: MedhubService,
    private prismaService: PrismaService,
    private logService: LogService
  ) { }

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
   * Upsert program faculty from Medhub API
   * Also deactivates faculty who are no longer in the program
   * @param id - internal program id, *not* medhub program id
   */
  async reloadProgramFaculty(id: number) {
    const program = await this.prismaService.programs.findUnique({
      where: { id },
      include: {
        faculty: true
      }
    })
    const medhubFaculty = await this.medhubService.request({
      endpoint: 'users/faculty',
      request: { programID: program.medhubProgramId }
    }) as Faculty[]

    /** Deactivate faculty who are no longer in the program */
    const toDeactivate = program.faculty.filter(facultyMem => {
      const search = medhubFaculty.find(f => f.userID == facultyMem.medhubUserId)
      return search == undefined
    })
    await this.prismaService.$transaction(
      toDeactivate.map(f => this.prismaService.faculty.update({
        where: { id: f.id },
        data: { active: false }
      }))
    )

    /** 
     * There is currently no way to upsert in batch outside of a transaction
     * So instead we run through and array of upsert calls
     * https://www.prisma.io/docs/guides/performance-and-optimization/prisma-client-transactions-guide#bulk-operations
     * */
    const result = await Promise.all(medhubFaculty.map(async f => {
      try {
        if (f.employeeID == '') {
          throw new Error('missing employeeID')
        }

        const newFaculty: Prisma.facultyCreateInput = {
          medhubUserId: f.userID.toString(),
          email: f.email,
          employeeId: f.employeeID.toString(),
          lastName: f.name_last,
          firstName: f.name_first,
          program: { connect: { id } }
        }

        await this.prismaService.faculty.upsert({
          where: { medhubUserId: newFaculty.medhubUserId },
          create: newFaculty,
          update: newFaculty
        })
      }

      catch (error) {
        this.logService.error(`Failed to upsert faculty with MedHub user id: ${f.userID}: ${error.message}`, ProgramService.name)
      }
    }))

    return result
  }

  /**
   * Upsert program trainees from Medhub API
   * Also deactivates trainees who are no longer in the program
   * @param id - internal program id, *not* medhub program id
   * @returns 
   */
  async reloadProgramTrainees(id: number) {
    const program = await this.prismaService.programs.findUnique({
      where: { id },
      include: {
        trainees: true
      }
    })
    const medhubTrainees = await this.medhubService.request({
      endpoint: `users/residents`,
      request: { programID: program.medhubProgramId }
    }) as Resident[]

    /**
     * Deactivate trainees who are no longer in the program
     */
    const toDeactivate = program.trainees.filter(trainee => {
      const search = medhubTrainees.find(t => t.userID == trainee.medhubUserId)
      return search == undefined
    })
    await this.prismaService.$transaction(
      toDeactivate.map(trainee => this.prismaService.trainees.update({
        where: { id: trainee.id },
        data: { active: false }
      }))
    )

    /** 
        * There is currently no way to upsert in batch outside of a transaction
        * So instead we run through and array of upsert calls
        * https://www.prisma.io/docs/guides/performance-and-optimization/prisma-client-transactions-guide#bulk-operations
        * */
    const result = await Promise.all(medhubTrainees.map(async t => {
      try {
        if (t.employeeID == '') {
          throw new Error('missing employeeID')
        }

        const newTrainee: Prisma.traineesCreateInput = {
          medhubUserId: t.userID.toString(),
          email: t.email,
          employeeId: t.employeeID.toString(),
          lastName: t.name_last,
          firstName: t.name_first,
          program: { connect: { id } }
        }

        await this.prismaService.trainees.upsert({
          where: { medhubUserId: newTrainee.medhubUserId },
          create: newTrainee,
          update: newTrainee
        })
      }

      catch (error) {
        this.logService.error(`Failed to upsert trainee with MedHub user id: ${t.userID}: ${error.message}`, ProgramService.name)
      }
    }))

    return result
  }
}
