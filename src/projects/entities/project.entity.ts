import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { ProjectUser } from '../../project-user/entities/project-user.entity';

@Entity()
export class Project {
  @PrimaryGeneratedColumn('uuid')
  public id!: string;

  @Column()
  public name!: string;

  @Column()
  public referringEmployeeId!: string;

  @ManyToOne(() => User, (user) => user.projects)
  public referringEmployee!: User;

  @OneToMany(() => ProjectUser, (projectUser) => projectUser.project)
  public projectUsers!: ProjectUser[];
}
