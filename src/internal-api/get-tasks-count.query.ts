import { ValidationError, validate as classValidatorValidate } from 'class-validator';
import { GetTasksCountParams } from './get-tasks-count.params';
import { IQuery } from './query';
import { plainToClass } from 'class-transformer';
import { TasksApiWrapper } from '../tasks-api/tasks-api-wrapper';
import moment from 'moment';
import { GetTasksResponse } from './get-tasks.response';

export class GetTasksCountQuery implements IQuery<GetTasksCountParams, GetTasksResponse> {
  private tasksApiWrapper = new TasksApiWrapper();

  public async validate(params: GetTasksCountParams): Promise<ValidationError[]> {
    const paramsClass = plainToClass(GetTasksCountParams, params);
    const result = await classValidatorValidate(paramsClass);

    return result;
  }

  public async execute(params: GetTasksCountParams): Promise<GetTasksResponse> {
    const tasks = await this.tasksApiWrapper.getTasks({
      status: params.status,
    });

    const tasksFilteredByDate = tasks.filter((t) => moment(t.timestamp).format('MM-YYYY') === params.dateStr);
    const tasksFilteredByPriority = tasksFilteredByDate.filter((t) => t.priority > params.priority);

    return {
      numTasks: tasksFilteredByPriority.length,
    };
  }
}
