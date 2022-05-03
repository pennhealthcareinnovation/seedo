import { ClarityService } from 'src/external-api/clarity/clarity.service';
import { MedhubService } from '../external-api/medhub/medhub.service';
import { PrismaService } from '../prisma/prisma.service';
export declare class TraineeService {
    private medhubService;
    private clarityService;
    private prismaService;
    constructor(medhubService: MedhubService, clarityService: ClarityService, prismaService: PrismaService);
    reloadProgramTrainees(programID: string): Promise<import(".prisma/client").trainees[]>;
}
