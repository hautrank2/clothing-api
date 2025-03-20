import { SigninDto } from './dto/signin.dto';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { from, map, mergeMap, Observable } from 'rxjs';
import { UserService } from 'src/modules/user/user.service';
import * as bcrypt from 'bcrypt';
import { throwError } from 'rxjs';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  signin(dto: SigninDto): Observable<{ token: string }> {
    const { password, ...restDto } = dto;
    return from(
      this.userService.findOneByQuery(restDto).pipe(
        mergeMap(user => {
          if (!user) {
            return throwError(
              new UnauthorizedException(
                'Username, email or phone number not found',
              ),
            );
          }
          console.log(user);
          return from(bcrypt.compare(password, user.password)).pipe(
            mergeMap(isMatch => {
              if (!isMatch) {
                return throwError(
                  new UnauthorizedException('Invalid password'),
                );
              }
              const payload = { id: user._id, username: user.username };
              return from(this.jwtService.signAsync(payload)).pipe(
                map(token => ({ token, user })),
              );
            }),
          );
        }),
      ),
    );
  }
}
