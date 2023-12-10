import {
  Controller,
  Post,
  Body,
  ValidationPipe,
  UsePipes,
  Get,
  UseGuards,
  Req,
  Param,
  ParseUUIDPipe,
} from '@nestjs/common';
import { Request } from 'express';

import { CreateUserDto } from './dto/create-user.dto';
import { SignInDto } from './dto/signIn.dto';
import { AuthService } from './auth.service';
import { UsersService } from './users.service';
import { AuthGuard } from '../guards/auth.guard';
import { UserDto } from './dto/user.dto';

@Controller('users')
export class UsersController {
  constructor(
    private authService: AuthService,
    private usersService: UsersService,
  ) {}

  @UseGuards(AuthGuard)
  @Get('me')
  @UsePipes(ValidationPipe)
  public async findAll(@Req() req: Request): Promise<UserDto> {
    const payload: { user: UserDto } = req.user as { user: UserDto };
    return this.usersService.findOneById(payload.user.id);
  }

  @UseGuards(AuthGuard)
  @Get(':id')
  public async getUserById(
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<UserDto> {
    return this.usersService.findOneById(id);
  }

  @UseGuards(AuthGuard)
  @Get('')
  public async getAllUsers(): Promise<UserDto[]> {
    try {
      return await this.usersService.findAll();
    } catch (err: unknown) {
      console.error(err);
    }
  }

  @Post('/auth/login')
  public login(@Body() signInDto: SignInDto) {
    return this.authService.login(signInDto.email, signInDto.password);
  }

  @Post('/auth/sign-up')
  public register(@Body() createUserDto: CreateUserDto) {
    return this.authService.register(createUserDto);
  }
}
