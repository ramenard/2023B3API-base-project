import { Controller, Post, Body, UseGuards, Get, Req } from '@nestjs/common';
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
  public findAll(@Req() req: Request) {
    const payload: { user: UserDto } = req.user as { user: UserDto };
    if (payload.user.role !== RoleEnum.Employee) {
      return this.projectUserService.findAllById(payload.user.id);
    }
    return this.projectUserService.findAll();
  }
  //
  // @Get(':id')
  // findOne(@Param('id') id: string) {
  //   return this.projectUserService.findOne(+id);
  // }
  //
  // @Patch(':id')
  // update(@Param('id') id: string, @Body() updateProjectUserDto: UpdateProjectUserDto) {
  //   return this.projectUserService.update(+id, updateProjectUserDto);
  // }
  //
  // @Delete(':id')
  // remove(@Param('id') id: string) {
  //   return this.projectUserService.remove(+id);
  // }
}
