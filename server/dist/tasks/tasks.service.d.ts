import { ObservableService } from '../observe/observable.service';
import { PrismaService } from '../prisma/prisma.service';
import { ClarityService } from '../external-api/clarity/clarity.service';
import { MedhubService } from '../external-api/medhub/medhub.service';
export declare class TasksService {
    private clarityService;
    private medhubService;
    private observableService;
    private prismaService;
    private readonly logger;
    constructor(clarityService: ClarityService, medhubService: MedhubService, observableService: ObservableService, prismaService: PrismaService);
    cardiology(): Promise<string>;
}
