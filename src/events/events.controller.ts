import { Controller, Post, Body, UseGuards, Req } from '@nestjs/common';
import { EventsService } from './events.service';
import { CreateEventDto } from './dto/create-event.dto';
import { AuthGuard } from '../guards/auth.guard';
import { UserDto } from '../users/dto/user.dto';
import { Request } from 'express';

@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @UseGuards(AuthGuard)
  @Post('')
  create(@Body() createEventDto: CreateEventDto, @Req() request: Request) {
    const payload: { user: UserDto } = request.user as { user: UserDto };
    return this.eventsService.create(createEventDto, payload.user.id);
  }

  // @Get('')
  // findAll() {
  //   return this.eventsService.findAll();
  // }

  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.eventsService.findOne(+id);
  // }
  //
  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateEventDto: UpdateEventDto) {
  //   return this.eventsService.update(+id, updateEventDto);
  // }
  //
  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.eventsService.remove(+id);
  // }
}
