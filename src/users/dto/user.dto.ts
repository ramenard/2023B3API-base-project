import { IsEmail, IsEnum, IsNotEmpty, IsString, Length } from 'class-validator';

enum RoleEnum {
  Employee = 'Employee',
  Admin = 'Admin',
  ProjectManager = 'ProjectManager',
}

export class UserDto {
  @IsString()
  @IsNotEmpty()
  public id!: string;

  @IsString()
  @IsNotEmpty()
  @Length(3)
  public username!: string;

  @IsEmail()
  @IsNotEmpty()
  public email!: string;

  @IsEnum(RoleEnum)
  public role!: RoleEnum;
}
