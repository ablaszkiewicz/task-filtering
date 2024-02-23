import axios from 'axios';
import { PaginatedResponse } from '../shared/paginated-response';
import { GetTasksParams } from './get-tasks.params';
import { Task } from './task';

export class TasksApiWrapper {
  private BASE_URL = 'https://7d9hgwsl2k.execute-api.us-east-1.amazonaws.com/dev/api/tasks';

  public async getTasks(params: GetTasksParams): Promise<Task[]> {
    const initialResponse = await this.getTasksOnPage(1, params);
    const numberOfPages = initialResponse.total_pages;

    const promises: Promise<PaginatedResponse<Task>>[] = [];
    for (let i = 2; i <= numberOfPages; i++) {
      promises.push(this.getTasksOnPage(i, params));
    }

    const responses = await Promise.all(promises);

    return [initialResponse, ...responses].map((r) => r.data).flat();
  }

  private async getTasksOnPage(page: number, params: GetTasksParams): Promise<PaginatedResponse<Task>> {
    const urlQuery = new URLSearchParams();
    urlQuery.set('status', params.status);
    urlQuery.set('page', page.toString());

    const response = await axios.get(`${this.BASE_URL}?${urlQuery.toString()}`);
    return response.data;
  }
}
