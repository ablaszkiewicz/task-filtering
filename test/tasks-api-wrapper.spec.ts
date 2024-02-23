import { CustomServer } from '../src/custom-server';
import { GetTasksCountParams } from '../src/internal-api/get-tasks-count.params';
import request from 'supertest';
import { TaskStatus } from '../src/shared/task-status.enum';
import { ValidationError } from 'class-validator';
import { TasksApiWrapper } from '../src/tasks-api/tasks-api-wrapper';
import nock from 'nock';
import { PaginatedResponse } from '../src/shared/paginated-response';
import { Task } from '../src/tasks-api/task';
import { v4 } from 'uuid';

const getMockTask = (): Task => {
  return {
    priority: 10,
    status: TaskStatus.Active,
    task_id: v4(),
    task_name: 'some name',
    timestamp: 'some timestamp',
  };
};

const getMockData = () => [getMockTask(), getMockTask()];

const mockFirstPage: PaginatedResponse<Task> = {
  page: 1,
  per_page: 2,
  total: 4,
  total_pages: 2,
  data: getMockData(),
};

const mockSecondPage: PaginatedResponse<Task> = {
  page: 2,
  per_page: 2,
  total: 4,
  total_pages: 2,
  data: getMockData(),
};

describe('TasksApiWrapper', () => {
  const api = new TasksApiWrapper();

  beforeAll(() => {
    nock.disableNetConnect();
  });

  afterAll(() => {
    nock.enableNetConnect();
  });

  const mockEndpoints = () => {
    nock('https://7d9hgwsl2k.execute-api.us-east-1.amazonaws.com/dev/api')
      .get('/tasks?status=ACTIVE&page=1')
      .reply(200, mockFirstPage)
      .get('/tasks?status=ACTIVE&page=2')
      .reply(200, mockSecondPage);
  };

  it('download tasks from all pages', async () => {
    // given
    mockEndpoints();

    // when
    const data = await api.getTasks({
      status: TaskStatus.Active,
    });

    // then
    expect(new Set(data.map((t) => t.task_id)).size).toBe(4);
  });
});
