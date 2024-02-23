import { TaskStatus } from '../shared/task-status.enum';

export interface GetTasksParams {
  status: TaskStatus;
}
