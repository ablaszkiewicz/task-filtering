import { ValidationError } from 'class-validator';

export interface IQuery<TParams, TResponse> {
  validate(params: TParams): Promise<ValidationError[]>;
  execute(params: TParams): Promise<TResponse>;
}
