import { ClarityService } from './external-api/clarity/clarity.service';
import { MedhubService } from './external-api/medhub/medhub.service';
import { TasksService } from './tasks/tasks.service';
export declare class AppController {
    private clarityService;
    private medhubService;
    private tasksService;
    constructor(clarityService: ClarityService, medhubService: MedhubService, tasksService: TasksService);
    getHello(): string;
    getEchos(): Promise<string>;
}
