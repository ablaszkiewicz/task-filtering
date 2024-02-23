import { TaskFilteringServer } from '../src/server/task-filtering.server';
import { GetTasksCountParams } from '../src/internal-api/get-tasks-count.params';
import request from 'supertest';
import { TaskStatus } from '../src/shared/task-status.enum';
import { ValidationError } from 'class-validator';

describe('InternalApiValidation', () => {
  let server: TaskFilteringServer;

  beforeAll(async () => {
    server = new TaskFilteringServer();
    await server.initializeServer();
  });

  afterAll(async () => {
    await server.close();
  });

  const validParams: GetTasksCountParams = {
    priority: 10,
    dateStr: '04-2019',
    status: TaskStatus.Active,
  };

  const expectValidationError = (error: string, errors: ValidationError[]) => {
    const constraints = errors.map((e) => e.constraints);
    const rawErrors = constraints.map((c) => Object.values(c!)).flat();

    expect(rawErrors).toContain(error);
  };

  it.each([
    ['status', 'INVALID', 'status must be one of the following values: ACTIVE, REVIEW, CLOSED'],
    ['priority', 'not-number', 'priority must be a number conforming to the specified constraints'],
    ['dateStr', 'not-date', 'dateStr must match /^(0[1-9]|1[0-2])-(19|20)\\d{2}$/ regular expression'],
    ['dateStr', '21-01-2019', 'dateStr must match /^(0[1-9]|1[0-2])-(19|20)\\d{2}$/ regular expression'],
  ])('when "%s" is "%s", then it should return "%s"', async (property, value, error) => {
    const params = { ...validParams, [property]: value };

    const urlQuery = new URLSearchParams();
    urlQuery.set('dateStr', params.dateStr);
    urlQuery.set('priority', params.priority.toString());

    const response = await request(server.app).get(`/tasks/${params.status}/count?${urlQuery.toString()}`);

    expectValidationError(error, response.body.errors);
  });
});
