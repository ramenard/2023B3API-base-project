import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Project } from '../../projects/entities/project.entity';
import { ProjectUser } from '../../project-user/entities/project-user.entity';

enum RoleEnum {
  Employee = 'Employee',
  Admin = 'Admin',
  ProjectManager = 'ProjectManager',
}

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  public id!: string;

  @Column({ unique: true })
  public username!: string;

  @Column({ unique: true })
  public email!: string;

  @Column({ select: false })
  public password!: string;

  @Column()
  public role!: RoleEnum;

  @OneToMany(() => Project, (project) => project.referringEmployee)
  public projects!: Project[];

  @OneToMany(() => ProjectUser, (projectUser) => projectUser.user)
  public projectUser!: ProjectUser[];
}
