import { Injectable, Logger } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import next, { NextServer } from 'next/dist/server/next';
import { LogService } from '../log/log.service';
import { ObservableController } from '../observe/observable.controller';

import { SummaryService } from '../observe/summary.service';

@Injectable()
export class ViewService {
  constructor(
    private summaryService: SummaryService,
    private observableController: ObservableController,
    private logService: LogService
  ) {
    this.logService.setContext(ViewService.name)
  }

  private server: NextServer

  async onModuleInit(): Promise<void> {
    try {
      this.server = next({
        dev: true,
        dir: './client',
        conf: {
          // https://nextjs.org/docs/api-reference/next.config.js/runtime-configuration:
          serverRuntimeConfig: {
            observableController: this.observableController
          }
        }
      })
      await this.server.prepare()
    } catch (error) {
      this.logService.error(error)
    }
  }

  getNextServer(): NextServer {
    return this.server
  }
}
