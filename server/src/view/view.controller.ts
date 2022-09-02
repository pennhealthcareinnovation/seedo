import { Controller, Get, Logger, Req, Res } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { Request, Response } from 'express';

import { IsPublicRoute } from '../auth/session.guard';
import { ViewService } from './view.service';

@IsPublicRoute()
@Controller('')
export class ViewController {
  constructor(
    private viewService: ViewService,
    private moduleRef: ModuleRef
  ) { }
  private logger = new Logger('ViewController')

  @Get('*')
  static(
    @Req() req: Request,
    @Res() res: Response
  ) {
    const handle = this.viewService.getNextServer().getRequestHandler()
    handle(req, res)
  }
}
