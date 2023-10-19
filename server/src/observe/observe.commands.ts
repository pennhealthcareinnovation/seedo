import { Command, CommandRunner } from "nest-commander";

import { TasksService } from "./tasks.service";
import { ProgramService } from "../program/program.service";
import { SummaryService } from "./summary.service";
import { SyncService } from "./sync.service";

@Command({ name: 'tasks', description: 'Run all tasks that collect observations' })
export class TasksCommand extends CommandRunner {
    constructor(
        private tasksService: TasksService,
        private programService: ProgramService
    ) { super() }

    async run () {
        await this.programService.reloadActivePrograms()
        await this.tasksService.runAllTasks()
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