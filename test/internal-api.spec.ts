import request from 'supertest';
import { TaskStatus } from '../src/shared/task-status.enum';
import { TaskFilteringServer } from '../src/server/task-filtering.server';
import nock from 'nock';

describe('InternalApi', () => {
  let server: TaskFilteringServer;

  beforeAll(async () => {
    server = new TaskFilteringServer();
    await server.initializeServer();
  });

  afterAll(async () => {
    await server.close();
  });

  const expectResult = async (props: {
    status: TaskStatus;
    priority: number;
    dateStr: string;
    expectedCount: number;
  }) => {
    const urlQuery = new URLSearchParams();
    urlQuery.set('dateStr', props.dateStr);
    urlQuery.set('priority', props.priority.toString());

    const response = await request(server.app).get(`/tasks/${props.status}/count?${urlQuery.toString()}`);

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ numTasks: props.expectedCount });
  };

  it.each([
    [TaskStatus.Closed, 45, '04-2019', 3],
    [TaskStatus.Review, 3, '05-2019', 2],
    [TaskStatus.Closed, 30, '01-2019', 7],
    [TaskStatus.Closed, 87, '01-2019', 2],
    [TaskStatus.Active, 3, '01-2019', 0],
    [TaskStatus.Review, 6, '07-2019', 2],
    [TaskStatus.Review, 6, '07-2019', 2],
    [TaskStatus.Review, 9, '05-2019', 0],
    [TaskStatus.Closed, 15, '05-2019', 1],
  ])(
    'For tasks with status %s and priority %s and date %s it should return count %s',
    async (status: TaskStatus, priority: number, dateStr: string, expectedCount: number) => {
      await expectResult({ status, priority, dateStr, expectedCount });
    }
  );

  it('should propagate error message from an external API', async () => {
    // given
    nock('https://7d9hgwsl2k.execute-api.us-east-1.amazonaws.com/dev/api')
      .get('/tasks?status=ACTIVE&page=1')
      .reply(500, {
        message: 'Something went wrong',
      });

    const status = TaskStatus.Active;
    const priority = 3;
    const dateStr = '01-2019';

    // when
    const response = await request(server.app).get(`/tasks/${status}/count?dateStr=${dateStr}&priority=${priority}`);

    // then
    expect(response.status).toBe(500);
    expect(response.body).toEqual(JSON.stringify({ message: 'Something went wrong' }));
  });
});
