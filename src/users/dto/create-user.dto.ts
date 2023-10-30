import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
} from 'class-validator';

enum RoleEnum {
  Employee = 'Employee',
  Admin = 'Admin',
  ProjectManager = 'ProjectManager',
}

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  @Length(3)
  public username!: string;

  @IsEmail()
  @IsNotEmpty()
  public email!: string;

  @IsString()
  @IsNotEmpty()
  @Length(8)
  public password!: string;

  @IsOptional()
  public role?: RoleEnum = RoleEnum.Employee;
}
