import { CanActivate, ExecutionContext, Injectable, SetMetadata } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { Observable } from "rxjs";
import { Request } from "../types";

export const IS_PUBLIC_ROUTE = 'IS_PUBLIC_ROUTE';
export const AUTH_DISABLED = process.env?.AUTH_DISABLED === 'true' ?? false;
export const IsPublicRoute = () => SetMetadata(IS_PUBLIC_ROUTE, true);

@Injectable()
export class SessionGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  validateAdmin (req: Request): boolean {
    return !!req.session.adminUser
  }

  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    // if (AUTH_DISABLED) return true;

    const request = context.switchToHttp().getRequest();
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_ROUTE, [
      context.getHandler(),
      context.getClass(),
    ]);
    
    if (isPublic)
      return true;
    else
      return this.validateAdmin(request);
  }
}