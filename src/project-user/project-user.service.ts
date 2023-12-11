import {
  ConflictException,
  ForbiddenException,
  forwardRef,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateProjectUserDto } from './dto/create-project-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProjectUser } from './entities/project-user.entity';
import { UsersService } from '../users/users.service';
import { ProjectsService } from '../projects/projects.service';

@Injectable()
export class ProjectUserService {
  constructor(
    @InjectRepository(ProjectUser)
    private readonly projectUserRepository: Repository<ProjectUser>,
    @Inject(forwardRef(() => ProjectsService))
    private readonly projectsService: ProjectsService,
    private readonly usersService: UsersService,
  ) {}

  public async create(createProjectUserDto: CreateProjectUserDto) {
    await this.projectsService.isProjectExist(createProjectUserDto.projectId);
    await this.usersService.findOneById(createProjectUserDto.userId);
    const allProjectsUser = await this.findAllById(createProjectUserDto.userId);
    const isNotAvailable = allProjectsUser.some(
      (userProject: ProjectUser) =>
        new Date(createProjectUserDto.startDate) <=
          new Date(userProject.endDate) ||
        new Date(createProjectUserDto.endDate) <= new Date(userProject.endDate),
    );
    if (isNotAvailable) {
      throw new ConflictException();
    }
    const projectUser: ProjectUser =
      await this.projectUserRepository.save(createProjectUserDto);
    return this.projectUserRepository.findOne({
      where: { id: projectUser.id },
      relations: {
        project: {
          referringEmployee: true,
        },
        user: true,
      },
    });
  }

  public findAll(): Promise<ProjectUser[]> {
    return this.projectUserRepository.find();
  }

  public async findAllById(userId: string): Promise<ProjectUser[]> {
    return await this.projectUserRepository.find({
      where: { userId },
    });
  }

  public async isUserInProject(projectId: string, userId: string) {
    try {
      await this.projectUserRepository.findOneOrFail({
        where: { projectId: projectId, userId: userId },
      });
    } catch {
      throw new ForbiddenException();
    }
  }

  public async getProjectIdByUser(userId: string): Promise<string[]> {
    const projectUsers = await this.projectUserRepository.find({
      select: ['projectId'],
      where: { userId: userId },
    });
    return projectUsers.map((projectUser) => projectUser.projectId);
  }

  public async findByIdAsAdmin(projectId: string): Promise<ProjectUser> {
    return this.projectUserRepository.findOne({
      where: { id: projectId },
    });
  }

  public async findByIdAsUser(
    userId: string,
    projectId: string,
  ): Promise<ProjectUser> {
    try {
      return this.projectUserRepository.findOneOrFail({
        where: { userId: userId, id: projectId },
      });
    } catch {
      throw new UnauthorizedException();
    }
  }
}
