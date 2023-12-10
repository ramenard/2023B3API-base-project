import { IsNotEmpty, IsString, Length } from 'class-validator';

export class CreateProjectDto {
  @IsString()
  @IsNotEmpty()
  @Length(3)
  public name!: string;

  @IsString()
  @IsNotEmpty()
  referringEmployeeId!: string;
}
