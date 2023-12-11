import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

enum EventStatusEnum {
  Pending = 'Pending',
  Accepted = 'Accepted',
  Declined = 'Declined',
}

enum EventTypeEnum {
  RemoteWork = 'RemoteWork',
  PaidLeave = 'PaidLeave',
}

@Entity()
export class Event {
  @PrimaryGeneratedColumn('uuid')
  public id!: string;

  @Column({ type: 'timestamptz' })
  public date!: Date;

  @Column({
    type: 'enum',
    enum: EventStatusEnum,
    default: EventStatusEnum.Pending,
  })
  public eventStatus?: EventStatusEnum;

  @Column({
    type: 'enum',
    enum: EventTypeEnum,
  })
  public eventType!: EventTypeEnum;

  @Column()
  public eventDescription?: string | null;

  @Column()
  public userId: string;
}
