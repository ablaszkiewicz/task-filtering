import express, { Express } from 'express';
import { Server } from 'http';
import { GetTasksCountQuery } from './internal-api/get-tasks-count.query';
import { IQuery } from './internal-api/query';
import { parse } from 'url';

interface ServerParams {
  port?: number;
}

export class CustomServer {
  public app!: Express;
  private server!: Server;

  constructor(params?: ServerParams) {
    this.initializeServer(params);
    this.registerRoutes();
  }

  private initializeServer(params?: ServerParams): void {
    const port = params?.port || 3000;

    this.app = express();

    this.server = this.app.listen(params?.port || 3000);
  }

  public registerRoutes() {
    this.registerValidatedGetRoute('/tasks/:status/count', new GetTasksCountQuery());
  }

  private registerValidatedGetRoute(endpoint: string, query: IQuery<any, any>) {
    this.app.get(endpoint, async (req, res) => {
      const requestQuery = parse(req.url, true).query;
      const requestParams = req.params;

      const params = { ...requestQuery, ...requestParams };

      const validationErrors = await query.validate(params);

      if (validationErrors.length > 0) {
        res.status(400).json({ errors: validationErrors });
        return;
      }

      const result = await query.execute(params);
      res.status(200).json(result);
    });
  }

  public async close(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.server.close((err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }
}
