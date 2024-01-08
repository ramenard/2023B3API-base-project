import { forwardRef, Module } from '@nestjs/common';
import { ProjectUser } from './entities/project-user.entity';
import { ProjectUserService } from './project-user.service';
import { ProjectUserController } from './project-user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProjectsModule } from '../projects/projects.module';
import { UsersModule } from '../users/users.module';
import { EventsModule } from '../events/events.module';

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
