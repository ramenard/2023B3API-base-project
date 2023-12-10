import * as bcrypt from 'bcrypt';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CreateUserDto } from './dto/create-user.dto';
import { User } from './entities/user.entity';
import { UserDto } from './dto/user.dto';

enum RoleEnum {
  Employee = 'Employee',
  Admin = 'Admin',
  ProjectManager = 'ProjectManager',
}

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  public async create(createUserDto: CreateUserDto): Promise<UserDto> {
    if (!createUserDto.role) {
      createUserDto.role = RoleEnum.Employee;
    }
    const saltOrRounds = 10;
    const hash = await bcrypt.hash(createUserDto.password, saltOrRounds);
    const user: User = (await this.userRepository.save({
      ...createUserDto,
      password: hash,
    })) as User;
    return this.findOneById(user.id);
  }

  public async findAll(): Promise<UserDto[]> {
    return await this.userRepository.find({
      select: ['id', 'username', 'email', 'role'],
    });
  }

  public async findOneById(id: string): Promise<UserDto> {
    try {
      return await this.userRepository.findOneOrFail({
        where: { id },
        select: ['id', 'username', 'email', 'role'],
      });
    } catch (error) {
      throw new NotFoundException();
    }
  }

  public async login(email: string): Promise<User> {
    return await this.userRepository.findOne({
      where: { email },
      select: ['id', 'username', 'email', 'password', 'role'],
    });
  }
}
