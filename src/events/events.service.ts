import { Injectable, UnauthorizedException } from '@nestjs/common';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Event } from './entities/event.entity';

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
  ) {}

  public async create(
    createEventDto: CreateEventDto,
    userId: string,
  ): Promise<Event> {
    let status = EventStatusEnum.Pending;
    const eventsOfUser = await this.findAll(userId);
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

  public async findAll(userId: string) {
    return this.eventRepository.find({ where: { userId: userId } });
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
}
