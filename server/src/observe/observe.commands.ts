import { Command, CommandRunner, Option } from "nest-commander";

import { TasksService } from "./tasks.service";
import { ProgramService } from "../program/program.service";
import { SummaryService } from "./summary.service";
import { SyncService } from "./sync.service";

interface TasksOptions {
    lookbackDays: number
}

@Command({ name: 'tasks', description: 'Run all tasks that collect observations' })
export class TasksCommand extends CommandRunner {
    constructor(
        private tasksService: TasksService,
        private programService: ProgramService
    ) { super() }


    async run(args: string[], options: TasksOptions) {
        await this.programService.reloadActivePrograms()
        await this.tasksService.runAllTasks({ lookbackDays: options.lookbackDays })
    }

    @Option({
        flags: '-l, --lookbackDays <lookbackDays>',
        name: 'lookbackDays',
        description: 'Number of days to look back for observations',
        defaultValue: 7,
    })
    parseLookbackDays(value: string): TasksOptions['lookbackDays'] {
        const lookbackDays = parseInt(value)
        if (isNaN(lookbackDays)) {
            throw new Error('lookbackDays must be a number')
        }
        return lookbackDays
    }
}

@Command({ name: 'summaries', description: 'Send summaries to trainees' })
export class SummariesCommand extends CommandRunner {
    constructor(
        private summaryService: SummaryService
    ){ super() }

    async run () {
        await this.summaryService.sendSummaries()
    }
}

@Command({ name: 'sync', description: 'Sync observations to MedHub' })
export class SyncCommand extends CommandRunner {
    constructor(
        private syncService: SyncService
    ){ super() }

    async run () {
        await this.syncService.syncToMedhub()
    }
}