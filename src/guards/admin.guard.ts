import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Observable } from 'rxjs';
import { RoleType } from 'src/schemas/user.schema';

@Injectable()
export class AdminGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request: Request = context.switchToHttp().getRequest();
    const upsertMethods = ['POST', 'PUT', 'DELETE'];

    if (upsertMethods.includes(request.method)) {
      return request.user?.role === RoleType.ADMIN;
    }
    return true;
  }
}
