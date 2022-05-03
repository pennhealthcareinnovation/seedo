import { PrismaService } from 'src/prisma/prisma.service';
export declare class ObservationService {
    private prismaService;
    constructor(prismaService: PrismaService);
    createMany(args: any): Promise<import(".prisma/client").Prisma.BatchPayload>;
}
