import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { faculty, programs, trainees } from '@prisma/client';
import { ModuleMocker, MockFunctionMetadata } from 'jest-mock';

import { MedhubService } from '../external-api/medhub/medhub.service';
import { Faculty, Resident } from '../external-api/medhub/medhub.types';
import { PrismaService } from '../prisma/prisma.service';
import { ProgramService } from './program.service';

const moduleMocker = new ModuleMocker(global);

describe('ProgramService', () => {
  let programService: ProgramService;
  let prismaService: jest.MockedObjectDeep<PrismaService>
  let medhubService: jest.Mocked<MedhubService>

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      // imports: [PrismaModule],
      providers: [ProgramService],
    })
      .useMocker((token) => {
        switch (token) {
          case MedhubService:
            return {
              request: jest.fn()
            }
          case PrismaService:
            return {
              programs: { findUnique: jest.fn() },
              faculty: { update: jest.fn(), upsert: jest.fn() },
              trainees: { update: jest.fn(), upsert: jest.fn() },
              $transaction: jest.fn()
            }
          default:
            const mockMetadata = moduleMocker.getMetadata(token) as MockFunctionMetadata<any, any>;
            const Mock = moduleMocker.generateFromMetadata(mockMetadata);
            return new Mock();
        }
      })
      .compile();

    programService = module.get<ProgramService>(ProgramService)
    prismaService = module.get(PrismaService);
    medhubService = module.get(MedhubService);
  });

  it('should be defined', () => {
    expect(programService).toBeDefined();
  });

  describe('reloadProgramFaculty', () => {
    /** Faculty with medhubUserId 002 isn't returned from MedHub API, deactivate them */
    it('should deactivate faculty no longer defined on MedHub API', async () => {
      prismaService.programs.findUnique = jest.fn().mockResolvedValue({
        id: 0,
        faculty: [
          { id: 1, medhubUserId: '001' },
          { id: 2, medhubUserId: '002' }]
      } as Partial<programs & { faculty: Partial<faculty>[] }>)
      medhubService.request = jest.fn().mockResolvedValue([{ userID: '001' }] as Faculty[])

      await programService.reloadProgramFaculty(0)
      expect(prismaService.faculty.update.mock.calls.length).toBe(1)
      expect(prismaService.faculty.update.mock.calls[0][0].data.active).toBe(false)
    })

    /** 
     * A new Faculty with medhubUserId 003 isn't present in faculty table, add them
     * TODO: not sure why the Promise.all wrap is causing the mock calls to be empty
     */
    xit('should add faculty missing from database', async () => {
      prismaService.programs.findUnique = jest.fn().mockResolvedValue({
        id: 0,
        faculty: [
          { id: 1, medhubUserId: '001' }]
      })
      medhubService.request = jest.fn().mockResolvedValue([{ userID: '001' }, { userID: '003' }])

      await programService.reloadProgramFaculty(0)
      expect(prismaService.faculty.upsert.mock.calls.length).toBe(1)
      expect(prismaService.faculty.upsert.mock.calls[0][0].where.medhubUserId).toBe('002')
    })
  })

  describe('reloadProgramTrainees', () => {
    /** Trainee with medhubUserId 002 isn't returned from MedHub API, deactivate them */
    it('should deactivate trainees no longer defined on MedHub API', async () => {
      prismaService.programs.findUnique = jest.fn().mockResolvedValue({
        id: 0,
        trainees: [
          { id: 1, medhubUserId: '001' },
          { id: 2, medhubUserId: '002' }]
      } as Partial<programs & { trainees: Partial<trainees>[] }>)
      medhubService.request = jest.fn().mockResolvedValue([{ userID: '001' }] as Resident[])

      await programService.reloadProgramTrainees(0)
      expect(prismaService.trainees.update.mock.calls.length).toBe(1)
      expect(prismaService.trainees.update.mock.calls[0][0].data.active).toBe(false)
    })

    /**
     * Trainee with medhubUserId 003 isn't present in trainees table, add them 
     * TODO: not sure why the Promise.all wrap is causing the mock calls to be empty
     * */
    xit('should add trainees missing from database', async () => {
      prismaService.programs.findUnique = jest.fn().mockResolvedValue({
        id: 0,
        trainees: [
          { id: 1, medhubUserId: '001' }]
      })
      medhubService.request = jest.fn().mockResolvedValue([{ userID: '001' }, { userID: '003' }])

      await programService.reloadProgramTrainees(0)
      expect(prismaService.trainees.upsert.mock.calls.length).toBe(1)
      expect(prismaService.trainees.upsert.mock.calls[0][0].where.medhubUserId).toBe('002')
    })
  })
});
