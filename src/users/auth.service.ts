import * as bcrypt from 'bcrypt';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { User } from './entities/user.entity';
import { UserDto } from './dto/user.dto';
import { UsersService } from './users.service';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async login(
    email: string,
    password: string,
  ): Promise<Record<string, string>> {
    const user: User = await this.usersService.login(email);
    if (!(await bcrypt.compare(password, user.password))) {
      throw new UnauthorizedException();
    }
    const userDto: UserDto = {
      username: user.username,
      role: user.role,
      email: user.email,
      id: user.id,
    };
    const payload = { user: userDto };
    return {
      access_token: await this.jwtService.signAsync(payload),
    };
  }
}
