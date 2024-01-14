import * as bcrypt from 'bcrypt';
import {
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CreateUserDto } from './dto/create-user.dto';
import { EventsService } from '../events/events.service';
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
    @Inject(forwardRef(() => EventsService))
    private readonly eventsService: EventsService,
  ) {}

  public async create(createUserDto: CreateUserDto): Promise<UserDto> {
    if (!createUserDto.role) {
      createUserDto.role = RoleEnum.Employee;
    }
    const saltOrRounds = 10;
    const hash = await bcrypt.hash(createUserDto.password, saltOrRounds);
    const user: User = await this.userRepository.save({
      ...createUserDto,
      password: hash,
    });
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

  public async getNumberOfDay(month: number, userId: string): Promise<number> {
    const firstDayOfMonth = new Date(new Date().getFullYear(), month - 1, 1);
    const lastDayOfMonth = new Date(new Date().getFullYear(), month, 0);

    let numberOfDay = 0;
    const currentDate = firstDayOfMonth;

    while (currentDate <= lastDayOfMonth) {
      const weekDay = currentDate.getDay();
      if (weekDay !== 0 && weekDay !== 6) {
        numberOfDay++;
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }
    const numberOfEventInMonth = await this.eventsService.numberOfEventInMonth(
      userId,
      month,
    );

    return (numberOfDay - numberOfEventInMonth) * 8;
  }
}
