import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { EventsModule } from '../events/events.module';
import { ProjectUser } from './entities/project-user.entity';
import { ProjectUserController } from './project-user.controller';
import { ProjectUserService } from './project-user.service';
import { ProjectsModule } from '../projects/projects.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ProjectUser]),
    forwardRef(() => ProjectsModule),
    forwardRef(() => EventsModule),
    forwardRef(() => UsersModule),
  ],
  controllers: [ProjectUserController],
  providers: [ProjectUserService],
  exports: [ProjectUserService, TypeOrmModule],
})
export class ProjectUserModule {}
