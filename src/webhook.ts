import { BaseController } from "base.controller";
import express from 'express';
import * as crypto from 'crypto';
import * as axios from 'axios';

export class Webhook implements BaseController {
  public router: express.Router;
  constructor(router: express.Router) {
    this.router = router;
    this.initRoutes();
  }

  private initRoutes() {
    this.router.post('/webhook', async (req, res) => {
      const secret = process.env.PAYSTACK_SK;
      let hash;
      try {
        hash = crypto.createHmac('sha512', secret).update(JSON.stringify(req.body)).digest('hex');
      } catch (error) {
        console.warn(error);
      }

      console.log(hash);
      if (hash == req.headers['x-paystack-signature']) {
        const payload = req.body;
        const config: axios.AxiosRequestConfig = {
          headers: {
            'X-Parse-Application-Id': process.env.APP_ID || 'myAppId',
            'Content-Type': 'application/json',
            'X-Parse-Master-Key': process.env.MASTER_KEY || 'myMasterKey'
          }
        }
  
        const url = process.env.SERVER_URL || 'http://localhost:1337/api/';
  
        try {
          await axios.default.post(`${url}/functions/webhook`, payload, config);
        } catch (error) {
          console.log(error);
          res.status(500).send({error});
          return;
        }
        res.sendStatus(200);
      } else {
        res.sendStatus(401);
      }
    });
  }
}
