import { MedhubService } from '../external-api/medhub/medhub.service';
import { PrismaService } from '../prisma/prisma.service';
export declare class ProgramService {
    private medhubService;
    private prismaService;
    constructor(medhubService: MedhubService, prismaService: PrismaService);
    reloadPrograms(): Promise<import(".prisma/client").programs[]>;
}
