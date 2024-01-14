import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Event } from './entities/event.entity';
import { EventsController } from './events.controller';
import { EventsService } from './events.service';
import { ProjectsModule } from '../projects/projects.module';
import { ProjectUserModule } from '../project-user/project-user.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Event]),
    forwardRef(() => ProjectsModule),
    forwardRef(() => ProjectUserModule),
    forwardRef(() => UsersModule),
  ],
  controllers: [EventsController],
  providers: [EventsService],
  exports: [EventsService, TypeOrmModule],
})
export class EventsModule {}
