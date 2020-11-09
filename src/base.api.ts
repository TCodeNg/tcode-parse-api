import express from 'express';
import { BaseController } from './base.controller';

export class BaseApi implements BaseController {
  public router: express.Router;
  constructor(router: express.Router) {
    this.router = router;
    this.initRoutes();
  }

  private initRoutes() {
    this.router.get('/', (_, res) => {
      res.status(200).send({message: 'Hello and welcome to Moving!'});
    });
  }
}