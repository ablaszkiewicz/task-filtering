import { CustomServer } from './base.server';
import { GetTasksCountQuery } from '../internal-api/get-tasks-count.query';

export class TaskFilteringServer extends CustomServer {
  constructor() {
    super();
  }

  registerRoutes(): void {
    this.registerValidatedGetRoute('/tasks/:status/count', new GetTasksCountQuery());
  }
}
