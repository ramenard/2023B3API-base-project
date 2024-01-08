import {
  Controller,
  Post,
  Body,
  UseGuards,
  Req,
  Param,
  Get,
} from '@nestjs/common';
import { EventsService } from './events.service';
import { CreateEventDto } from './dto/create-event.dto';
import { AuthGuard } from '../guards/auth.guard';
import { UserDto } from '../users/dto/user.dto';
import { Request } from 'express';
import { Event } from './entities/event.entity';
import { RolesGuard } from '../guards/role.guard';
import { Roles } from '../decorator/roles.decorator';

enum EventStatusEnum {
  Pending = 'Pending',
  Accepted = 'Accepted',
  Declined = 'Declined',
}

enum RoleEnum {
  Employee = 'Employee',
  Admin = 'Admin',
  ProjectManager = 'ProjectManager',
}

@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @UseGuards(AuthGuard)
  @Post('')
  public create(
    @Body() createEventDto: CreateEventDto,
    @Req() request: Request,
  ) {
    const payload: { user: UserDto } = request.user as { user: UserDto };
    return this.eventsService.create(createEventDto, payload.user.id);
  }

  @UseGuards(AuthGuard)
  @Get('')
  public getAll(): Promise<Event[]> {
    return this.eventsService.findAll();
  }

  @UseGuards(AuthGuard)
  @Get(':id')
  public getOne(@Param('id') eventId: string): Promise<Event> {
    return this.eventsService.findOne(eventId);
  }

  @Roles([RoleEnum.Admin, RoleEnum.ProjectManager])
  @UseGuards(AuthGuard, RolesGuard)
  @Post(':id/validate')
  public validate(@Param('id') eventId: string, @Req() request: Request) {
    const payload: { user: UserDto } = request.user as { user: UserDto };
    if (payload.user.role === RoleEnum.Admin) {
      return this.eventsService.changeStatusAsAdmin(
        eventId,
        EventStatusEnum.Accepted,
      );
    }
    return this.eventsService.changeStatusAsManager(
      eventId,
      payload.user.id,
      EventStatusEnum.Accepted,
    );
  }

  @Roles([RoleEnum.Admin, RoleEnum.ProjectManager])
  @UseGuards(AuthGuard, RolesGuard)
  @Post(':id/decline')
  public decline(@Param('id') eventId: string, @Req() request: Request) {
    const payload: { user: UserDto } = request.user as { user: UserDto };
    if (payload.user.role === RoleEnum.Admin) {
      return this.eventsService.changeStatusAsAdmin(
        eventId,
        EventStatusEnum.Declined,
      );
    }
    return this.eventsService.changeStatusAsManager(
      eventId,
      payload.user.id,
      EventStatusEnum.Declined,
    );
  }

  // @Roles([RoleEnum.Admin, RoleEnum.ProjectManager])
  // @UseGuards(AuthGuard, RolesGuard)
  // @Post(':id/decline')
  // public decline(@Param('id') eventId: string, @Req() request: Request) {
  //   const payload: { user: UserDto } = request.user as { user: UserDto };
  //   if (payload.user.role === RoleEnum.ProjectManager) {
  //     return this.eventsService.declineAsManager(eventId, payload.user.id);
  //   }
  //   return this.eventsService.decline(eventId);
  // }
}
