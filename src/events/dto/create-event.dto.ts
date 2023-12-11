import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

enum EventTypeEnum {
  RemoteWork = 'RemoteWork',
  PaidLeave = 'PaidLeave',
}

export class CreateEventDto {
  @IsDateString()
  public date!: Date;

  @IsString()
  @IsOptional()
  public eventDescription?: string = null;

  @IsEnum(EventTypeEnum)
  @IsNotEmpty()
  public eventType!: EventTypeEnum;
}
