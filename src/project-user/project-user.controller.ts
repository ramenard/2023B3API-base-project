import {
  Controller,
  Post,
  Body,
  UseGuards,
  Get,
  Req,
  Param,
} from '@nestjs/common';
import { ProjectUserService } from './project-user.service';
import { CreateProjectUserDto } from './dto/create-project-user.dto';
import { RolesGuard } from '../guards/role.guard';
import { Roles } from '../decorator/roles.decorator';
import { AuthGuard } from '../guards/auth.guard';
import { ProjectUser } from './entities/project-user.entity';
import { Request } from 'express';
import { UserDto } from '../users/dto/user.dto';

enum RoleEnum {
  Employee = 'Employee',
  Admin = 'Admin',
  ProjectManager = 'ProjectManager',
}

@Controller('project-users')
export class ProjectUserController {
  constructor(private readonly projectUserService: ProjectUserService) {}

  @Roles([RoleEnum.Admin, RoleEnum.ProjectManager])
  @UseGuards(AuthGuard, RolesGuard)
  @Post('')
  public create(
    @Body() createProjectUserDto: CreateProjectUserDto,
  ): Promise<ProjectUser> {
    return this.projectUserService.create(createProjectUserDto);
  }

  @UseGuards(AuthGuard)
  @Get('')
  public async findAll(@Req() req: Request) {
    const payload: { user: UserDto } = req.user as { user: UserDto };
    if (payload.user.role !== RoleEnum.Employee) {
      return (await this.projectUserService.findAll()).map(
        (projectUser) => projectUser.project,
      );
    }
    return (await this.projectUserService.findAllById(payload.user.id)).map(
      (projectUser) => projectUser.project,
    );
  }

  @UseGuards(AuthGuard)
  @Get(':id')
  findOne(@Param('id') projectId: string, @Req() req: Request) {
    const payload: { user: UserDto } = req.user as { user: UserDto };
    if (payload.user.role !== RoleEnum.Employee) {
      return this.projectUserService.findByIdAsAdmin(projectId);
    }
    return this.projectUserService.findByIdAsUser(payload.user.id, projectId);
  }
}
