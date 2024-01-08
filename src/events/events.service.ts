import {
  ConflictException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateEventDto } from './dto/create-event.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Event } from './entities/event.entity';
import { ProjectsService } from '../projects/projects.service';
import { ProjectUserService } from '../project-user/project-user.service';
import { ProjectUser } from '../project-user/entities/project-user.entity';

enum EventTypeEnum {
  RemoteWork = 'RemoteWork',
  PaidLeave = 'PaidLeave',
}

enum EventStatusEnum {
  Pending = 'Pending',
  Accepted = 'Accepted',
  Declined = 'Declined',
}

@Injectable()
export class EventsService {
  constructor(
    @InjectRepository(Event)
    private readonly eventRepository: Repository<Event>,
    @Inject(forwardRef(() => ProjectsService))
    private readonly projectsService: ProjectsService,
    @Inject(forwardRef(() => ProjectUserService))
    private readonly projectUserService: ProjectUserService,
  ) {}

  public async create(
    createEventDto: CreateEventDto,
    userId: string,
  ): Promise<Event> {
    let status = EventStatusEnum.Pending;
    const eventsOfUser = await this.findByUserId(userId);
    const allDates: Date[] = eventsOfUser.map(
      (eventOfUser) => eventOfUser.date,
    );
    if (!this.isDateAvailable(createEventDto.date, allDates)) {
      throw new UnauthorizedException();
    }
    if (createEventDto.eventType === EventTypeEnum.RemoteWork) {
      status = EventStatusEnum.Accepted;
    }
    return await this.eventRepository.save({
      date: createEventDto.date,
      eventDescription: createEventDto.eventDescription,
      eventStatus: status,
      eventType: createEventDto.eventType,
      userId: userId,
    });
  }

  public async findAll() {
    return this.eventRepository.find();
  }

  public async findByUserId(userId: string) {
    return this.eventRepository.find({ where: { userId: userId } });
  }

  public async findOne(eventId: string): Promise<Event> {
    try {
      return this.eventRepository.findOneOrFail({ where: { id: eventId } });
    } catch {
      throw new NotFoundException();
    }
  }

  public isDateAvailable(dateToValidate: Date, dateList: Date[]) {
    const dateListInWeek = dateList.map((date: Date) => {
      const firstDayOfWeek = new Date();
      firstDayOfWeek.setDate(date.getDate() - date.getDay());
      const lastDayOfWeek = new Date();
      lastDayOfWeek.setDate(firstDayOfWeek.getDate() + 6);
      if (dateToValidate >= firstDayOfWeek && dateToValidate <= lastDayOfWeek) {
        return;
      }
      return date;
    });
    if (dateListInWeek) {
      if (dateListInWeek.length >= 2) {
        return false;
      }

      return !dateListInWeek.some(
        (date: Date) =>
          new Date(date).getTime() === new Date(dateToValidate).getTime(),
      );
    }

    return true;
  }

  public async changeStatusAsAdmin(
    eventId: string,
    newEventStatus: EventStatusEnum,
  ): Promise<Event> {
    const event: Event = await this.findOne(eventId);
    if (event.eventStatus !== EventStatusEnum.Pending) {
      throw new ConflictException();
    }
    await this.eventRepository.save({
      eventStatus: newEventStatus,
      id: eventId,
    });
    return this.findOne(eventId);
  }

  public async changeStatusAsManager(
    eventId: string,
    userId: string,
    newEventStatus: EventStatusEnum,
  ): Promise<Event> {
    const event: Event = await this.findOne(eventId);
    if (event.eventStatus !== EventStatusEnum.Pending) {
      throw new ConflictException();
    }
    const projectManagerIds: string[] =
      await this.projectUserService.getProjectIdsByReferring(userId);
    const projectUserIds: string[] =
      await this.projectUserService.getProjectIdsByUser(event.userId);
    const inCommon: string[] = projectManagerIds.filter(
      (projectMangerId: string) => projectUserIds.includes(projectMangerId),
    );
    if (!inCommon.length) {
      throw new UnauthorizedException();
    }
    const projectsUsers: ProjectUser[] =
      await this.projectUserService.getProjectsUserById(inCommon);
    const isAvailable: boolean = projectsUsers.some(
      (projectUser: ProjectUser) =>
        new Date(projectUser.startDate) <= new Date(event.date) &&
        new Date(projectUser.endDate) >= new Date(event.date),
    );
    if (!isAvailable) {
      throw new UnauthorizedException();
    }
    await this.eventRepository.save({
      eventStatus: newEventStatus,
      id: eventId,
    });
    return this.findOne(eventId);
  }

  public async numberOfEventInMonth(
    userId: string,
    month: number,
  ): Promise<number> {
    const events: Event[] = await this.findByUserId(userId);
    const eventsInMonth = events.filter(
      (eventOfUser: Event) =>
        new Date(eventOfUser.date).getMonth() === month - 1 &&
        eventOfUser.eventStatus !== EventStatusEnum.Pending,
    );

    return eventsInMonth.length;
  }
}
