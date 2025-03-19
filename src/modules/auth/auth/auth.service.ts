import { Injectable } from '@nestjs/common';
import { UserService } from 'src/modules/user/user.service';

@Injectable()
export class AuthService {
  constructor(private usersService: UserService) {}
}
