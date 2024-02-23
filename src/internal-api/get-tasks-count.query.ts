import { ValidationError, validate as classValidatorValidate } from 'class-validator';
import { GetTasksCountParams } from './get-tasks-count.params';
import { IQuery } from './query';
import { plainToClass } from 'class-transformer';

export class GetTasksCountQuery implements IQuery<GetTasksCountParams, number> {
  public async validate(params: GetTasksCountParams): Promise<ValidationError[]> {
    const paramsClass = plainToClass(GetTasksCountParams, params);
    const result = await classValidatorValidate(paramsClass);

    return result;
  }

  public execute(params: GetTasksCountParams): Promise<number> {
    return Promise.resolve(1);
  }
}
