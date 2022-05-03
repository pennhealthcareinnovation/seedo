import { ClarityService } from 'src/external-api/clarity/clarity.service';
export declare class ObservableService {
    private clarityService;
    private readonly logger;
    private observables;
    constructor(clarityService: ClarityService);
    run<ReturnType>({ category, name, args }: {
        category: string;
        name: string;
        args: any;
    }): Promise<ReturnType[]>;
}
