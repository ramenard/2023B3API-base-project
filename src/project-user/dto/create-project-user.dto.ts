import { IsDateString, IsNotEmpty, IsString } from 'class-validator';

export class CreateProjectUserDto {
  @IsDateString()
  @IsNotEmpty()
  public startDate!: Date;

  @IsDateString()
  @IsNotEmpty()
  public endDate!: Date;

  @IsString()
  @IsNotEmpty()
  public projectId!: string;

  @IsString()
  @IsNotEmpty()
  public userId!: string;
}
