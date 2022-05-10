import { CurrentAdmin } from "adminjs";
import { Request } from "express";
import * as session from 'express-session'

export interface Session extends session.Session {
  adminUser: CurrentAdmin;
}

export interface Request extends Request {
  session: Session;
}