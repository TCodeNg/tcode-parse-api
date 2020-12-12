import * as express                          from 'express';
import { BaseApi }                           from './base.api';
import { BaseController }                    from './base.controller';
import { Webhook }                           from './webhook';
import App                                   from './app';
import { CloudinaryConfig, MediaController } from "./media.controller";
import * as dotenv                           from "dotenv";
const _app: express.Application = express();
const router: express.Router = express.Router();
const port: number = +process.env.PORT || 1337;
const env = process.env.ENV || 'DEV';
dotenv.config();

// BASE API
const controllers: BaseController[] = [];
const baseApi = new BaseApi(router);
const webhook = new Webhook(router);
const cloudinaryConfig: CloudinaryConfig = {
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME
}
const mediaController = new MediaController(router, cloudinaryConfig)
controllers.push(baseApi, webhook, mediaController);
const app: App = new App(_app, port, controllers, env);

app.listen();
