import { ConfigModule, ConfigService } from '@nestjs/config';
import { Module, ValidationPipe } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Project } from './projects/entities/project.entity';
import { ProjectsModule } from './projects/projects.module';
import { ProjectUser } from './project-user/entities/project-user.entity';
import { ProjectUserModule } from './project-user/project-user.module';
import { User } from './users/entities/user.entity';
import { UsersModule } from './users/users.module';
import { APP_PIPE } from '@nestjs/core';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('DB_HOST'),
        port: +configService.get<number>('DB_PORT'),
        username: configService.get('DB_USERNAME'),
        password: configService.get('DB_PASSWORD'),
        database: configService.get('DB_NAME'),
        entities: [User, Project, ProjectUser],
        synchronize: true,
      }),
      inject: [ConfigService],
    }),
    UsersModule,
    ProjectsModule,
    ProjectUserModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_PIPE,
      useClass: ValidationPipe,
    },
  ],
})
export class AppModule {}
