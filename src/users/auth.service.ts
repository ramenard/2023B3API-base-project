import * as bcrypt from 'bcrypt';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UserDto } from './dto/user.dto';
import { User } from './entities/user.entity';

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

  public async register(createUserDto: CreateUserDto): Promise<UserDto> {
    return await this.usersService.create(createUserDto);
  }
}
