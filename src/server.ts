import * as express from 'express';
import { BaseApi } from "./base.api";
import { BaseController } from "base.controller";
import { Webhook } from "./webhook";
import App from './app';
const _app: express.Application = express();
const router: express.Router = express.Router();
const port: number = +process.env.PORT || 1337;
const env = process.env.ENV || 'DEV';

// BASE API
const controllers: BaseController[] = [];
const baseApi = new BaseApi(router);
const webhook = new Webhook(router);
controllers.push(baseApi, webhook);
const app: App = new App(_app, port, controllers, env);

app.listen();