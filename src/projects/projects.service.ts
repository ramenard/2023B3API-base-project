import {
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateProjectDto } from './dto/create-project.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityNotFoundError, Repository } from 'typeorm';
import { Project } from './entities/project.entity';
import { ProjectUserService } from '../project-user/project-user.service';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectRepository(Project)
    private readonly projectRepository: Repository<Project>,
    @Inject(forwardRef(() => ProjectUserService))
    private readonly projectUserService: ProjectUserService,
  ) {}
  async create(createProjectDto: CreateProjectDto): Promise<Project> {
    const project: Project =
      await this.projectRepository.save(createProjectDto);
    return this.projectRepository.findOne({
      where: { id: project.id },
      relations: { referringEmployee: true },
    });
  }

  public async findAll(): Promise<Project[]> {
    return this.projectRepository.find({
      relations: { referringEmployee: true },
    });
  }

  public async findAllByUserId(userId: string): Promise<Project[]> {
    const projectsId: string[] =
      await this.projectUserService.getProjectIdByUser(userId);
    console.log(projectsId);
    // return this.projectUserService.findAllById(userId);
    const allProjects: Project[] = [];
    await Promise.all(
      projectsId.map(async (projectId) =>
        allProjects.push(
          await this.projectRepository.findOne({
            where: { id: projectId },
            relations: { referringEmployee: true },
          }),
        ),
      ),
    );
    console.log(allProjects);
    return allProjects;
  }

  public async findProjectByUser(
    userId: string,
    projectId: string,
  ): Promise<Project> {
    try {
      return this.projectRepository.findOneOrFail({
        where: {
          id: projectId,
        },
      });
    } catch (error) {
      if (error instanceof EntityNotFoundError) {
        throw new NotFoundException();
      }
      throw new UnauthorizedException();
    }
  }

  public async findProjectAsAdmin(projectId: string): Promise<Project> {
    try {
      return this.projectRepository.findOneOrFail({ where: { id: projectId } });
    } catch {
      throw new NotFoundException();
    }
  }

  public async isProjectExist(projectId: string): Promise<void> {
    try {
      await this.projectRepository.findOneOrFail({ where: { id: projectId } });
    } catch {
      throw new NotFoundException();
    }
  }

  public async getProjectsById(projectsId: string[]) {
    const allProjects: Project[] = [];
    projectsId.map(async (projectId) =>
      allProjects.push(
        await this.projectRepository.findOne({ where: { id: projectId } }),
      ),
    );
  }

  // findOne(id: number) {
  //   return `This action returns a #${id} project`;
  // }
  //
  // update(id: number, updateProjectDto: UpdateProjectDto) {
  //   return `This action updates a #${id} project`;
  // }
  //
  // remove(id: number) {
  //   return `This action removes a #${id} project`;
  // }
}
