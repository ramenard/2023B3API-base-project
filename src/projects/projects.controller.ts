import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Req,
  UnauthorizedException,
  Param,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { Request } from 'express';

import { AuthGuard } from '../guards/auth.guard';
import { CreateProjectDto } from './dto/create-project.dto';
import { Project } from './entities/project.entity';
import { ProjectsService } from './projects.service';
import { ProjectUserService } from '../project-user/project-user.service';
import { Roles } from '../decorator/roles.decorator';
import { RolesGuard } from '../guards/role.guard';
import { UserDto } from '../users/dto/user.dto';
import { UsersService } from '../users/users.service';

enum RoleEnum {
  Employee = 'Employee',
  Admin = 'Admin',
  ProjectManager = 'ProjectManager',
}

@Controller('projects')
export class ProjectsController {
  constructor(
    private readonly projectsService: ProjectsService,
    private usersService: UsersService,
    @Inject(forwardRef(() => ProjectUserService))
    private readonly projectUserService: ProjectUserService,
  ) {}

  @Roles([RoleEnum.Admin])
  @UseGuards(AuthGuard, RolesGuard)
  @Post('')
  async createProject(
    @Body() createProjectDto: CreateProjectDto,
  ): Promise<Project> {
    const authorizedRole = [RoleEnum.Admin, RoleEnum.ProjectManager];
    const user: UserDto = await this.usersService.findOneById(
      createProjectDto.referringEmployeeId,
    );
    if (!authorizedRole.includes(user.role)) {
      throw new UnauthorizedException();
    }
    return this.projectsService.create(createProjectDto);
  }

  @Get('')
  @UseGuards(AuthGuard)
  public findAll(@Req() req: Request): Promise<Project[]> {
    const payload: { user: UserDto } = req.user as { user: UserDto };
    if (payload.user.role !== RoleEnum.Employee) {
      return this.projectsService.findAll();
    }
    return this.projectsService.findAllByUserId(payload.user.id);
  }

  @Get(':id')
  @UseGuards(AuthGuard)
  public async findOne(
    @Param('id') projectId: string,
    @Req() req: Request,
  ): Promise<Project> {
    const payload: { user: UserDto } = req.user as { user: UserDto };
    await this.projectsService.isProjectExist(projectId);

    if (payload.user.role === RoleEnum.Employee) {
      await this.projectUserService.isUserInProject(projectId, payload.user.id);
      return this.projectsService.findProjectByUser(payload.user.id, projectId);
    }
    return this.projectsService.findProjectAsAdmin(projectId);
  }
}
