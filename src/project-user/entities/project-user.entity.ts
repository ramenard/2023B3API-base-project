import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

import { User } from '../../users/entities/user.entity';
import { Project } from '../../projects/entities/project.entity';

@Entity()
export class ProjectUser {
  @PrimaryGeneratedColumn('uuid')
  public id!: string;

  @Column({ type: 'timestamptz' })
  public startDate!: Date;

  @Column({ type: 'timestamptz' })
  public endDate!: Date;

  @Column('uuid')
  public projectId!: string;

  @Column('uuid')
  public userId!: string;

  @ManyToOne(() => User, (user) => user.projectUser)
  public user!: User;

  @ManyToOne(() => Project, (project) => project.projectUsers)
  public project!: Project;
}
