import { IsEnum, IsNumber, Matches } from 'class-validator';
import { TaskStatus } from '../shared/task-status.enum';
import { Transform } from 'class-transformer';

export class GetTasksCountParams {
  @IsEnum(TaskStatus)
  status!: TaskStatus;

  @IsNumber()
  @Transform(({ value }) => Number(value))
  priority!: number;

  @Matches(/^(0[1-9]|1[0-2])-(19|20)\d{2}$/)
  dateStr!: string;
}
