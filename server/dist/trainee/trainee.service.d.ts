import { MedhubService } from '../external-api/medhub/medhub.service';
import { PrismaService } from '../prisma/prisma.service';
export declare class TraineeService {
    private medhubService;
    private prismaService;
    constructor(medhubService: MedhubService, prismaService: PrismaService);
    reloadProgramTrainees(programID: string): Promise<import(".prisma/client").trainees[]>;
}
