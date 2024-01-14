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

import { AuthGuard } from '../guards/auth.guard';
import { AuthService } from './auth.service';
import { CreateUserDto } from './dto/create-user.dto';
import { SignInDto } from './dto/signIn.dto';
import { UserDto } from './dto/user.dto';
import { UsersService } from './users.service';

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
    return this.usersService.create(createUserDto);
  }

  @Get(':id/meal-vouchers/:month')
  public(
    @Param('id') userId: string,
    @Param('month') month: number,
  ): Promise<number> {
    return this.usersService.getNumberOfDay(month, userId);
  }
}
