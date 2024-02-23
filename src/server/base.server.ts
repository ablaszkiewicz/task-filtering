import express, { Express } from 'express';
import { Server } from 'http';
import { IQuery } from '../internal-api/query';
import { parse } from 'url';

interface ServerParams {
  port?: number;
}

export abstract class CustomServer {
  private readonly PORT = 3000;
  public app!: Express;
  private server!: Server;

  constructor(private readonly params?: ServerParams) {}

  public initializeServer(): Promise<void> {
    this.app = express();

    return new Promise((resolve) => {
      this.server = this.app.listen(this.PORT, () => {
        this.registerRoutes();
        resolve();
      });
    });
  }

  abstract registerRoutes(): void;

  protected registerValidatedGetRoute(endpoint: string, query: IQuery<any, any>) {
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
    return new Promise((resolve) => {
      this.server.close(() => {
        resolve();
      });
    });
  }
}
