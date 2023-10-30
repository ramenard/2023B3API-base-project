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
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { Request } from 'express';

import { CreateUserDto } from './dto/create-user.dto';
import { SignInDto } from './dto/signIn.dto';
import { AuthService } from './auth.service';
import { UsersService } from './users.service';
import { AuthGuard } from './auth.guard';
import { UserDto } from './dto/user.dto';

@Controller('users')
export class UsersController {
  constructor(
    private authService: AuthService,
    private usersService: UsersService,
  ) {}

  // @Post()
  // create(@Body() createUserDto: CreateUserDto) {
  //   return this.usersService.create(createUserDto);
  // }

  @UseGuards(AuthGuard)
  @Get('me')
  @UsePipes(ValidationPipe)
  public async findAll(@Req() req: Request): Promise<UserDto> {
    const payload: { id: string } = req.user as { id: string };
    return this.usersService.findOneById(payload.id);
  }

  @UseGuards(AuthGuard)
  @Get(':id')
  @UsePipes(ValidationPipe)
  public async getUserById(
    @Param('id', new ParseUUIDPipe()) id: string,
  ): Promise<UserDto> {
    const user: UserDto = await this.usersService.findOneById(id);
    if (user?.id === '') {
      throw new NotFoundException();
    }
    return user;
  }

  @UseGuards(AuthGuard)
  @Get('')
  @UsePipes(ValidationPipe)
  public async getAllUsers(): Promise<UserDto[]> {
    try {
      return await this.usersService.findAll();
    } catch (err: unknown) {
      console.error(err);
    }
  }

  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.usersService.remove(+id);
  // }

  @Post('/auth/login')
  @UsePipes(ValidationPipe)
  public login(@Body() signInDto: SignInDto) {
    return this.authService.login(signInDto.email, signInDto.password);
  }

  @Post('/auth/sign-up')
  @UsePipes(ValidationPipe)
  public register(@Body() createUserDto: CreateUserDto) {
    return this.authService.register(createUserDto);
  }
}
