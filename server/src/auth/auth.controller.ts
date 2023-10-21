import { Controller, Get, Logger, Req, Res } from '@nestjs/common';
// import { CurrentAdmin } from 'adminjs';
import { Response } from 'express';

import { Request } from '../types';
import { IsPublicRoute } from './session.guard';

@IsPublicRoute()
@Controller('auth')
export class AuthController {
  constructor(
  ) { }

  @Get('/login')
  async login() {
    return 'Login page here';
  }

  /** Receive JWT token from completed OIDC workflow from IdentityServer */
  @Get('/redirect')
  async redirect(
    @Req() req: Request,
    @Res() res: Response,
  ) {
    /** build adminUser object to be used by adminJS */
    // const adminUser: CurrentAdmin = {
    //   email: 'emeka.anyanwu@pennmedicine.upenn.edu',
    //   title: 'Emeka Anyanwu'
    // }
    // req.session.adminUser = adminUser;
    // req.session.save()
    console.debug('session', req.session)
    res.redirect(302, '/admin');
  }

  @Get('/logout')
  async logout(
    @Req() req: Request,
  ) {
    // req.session.destroy((err: any) => {
    //   if (err) {
    //     this.logService.error(`Unable to destroy session: ${err}`)
    //   }
    // })
    return 'Logged out';
  }
}
