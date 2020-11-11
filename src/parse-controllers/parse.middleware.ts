import express from 'express';
import { BaseMiddleware } from "../base.middleware";
const ParseServer = require('parse-server').ParseServer;

export class ParseMiddleware implements BaseMiddleware {
  app: express.Application;
  static init: (app: express.Application) => express.Application = (app: express.Application) => {
    const api = new ParseServer({
      databaseURI: process.env.MONGO_DB, // Connection string for your MongoDB database
      cloud: './dist/parse-controllers/main.js', // Absolute path to your Cloud Code
      appId: process.env.APP_ID || 'myAppId',
      masterKey: process.env.MASTER_KEY || 'myMasterKey', // Keep this key secret!
      fileKey: process.env.FILE_KEY || 'optionalFileKey',
      serverURL: process.env.SERVER_URL || 'http://localhost:1337/api', // Don't forget to change to https if needed
      liveQuery: {
        classNames: ['Cart', 'Product', 'Order']
      }
    });
    return app.use('/api', api);
  }
  constructor(app: express.Application) {
    this.app = app;
  }

}
