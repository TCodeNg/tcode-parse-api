import * as express from "express";
import * as bodyParser from "body-parser";
import * as cors from "cors";
import { createClient, RedisClient } from "redis";
import { BaseController } from "./base.controller";
import { ParseMiddleware } from "./parse-controllers";
import { routeCache, setCache } from "./cache";
import * as axios from "axios";
import * as winston from "winston";
import * as expressWinston from "express-winston";
import { countries } from "./countries";
import * as http from "http";

const ParseServer = require("parse-server").ParseServer;

let redisClient: RedisClient;

class App {
  public app: express.Application;
  private port: number;

  constructor(
    app: express.Application,
    port: number,
    controllers: BaseController[],
    env = "DEV"
  ) {
    redisClient = createClient({
      port: +process.env.REDIS_PORT, // replace with your port
      host: process.env.REDIS_HOST, // replace with your hostanme or IP address
      password: process.env.REDIS_PASSWORD, // replace with your password
      retry_strategy: (options) => {
        if (options.error && options.error.code === "ENOTFOUND") {
          return new Error("Cannot connect to the redis server.");
        }
        if (options.error && options.error.code === "ECONNREFUSED") {
          // End reconnecting on a specific error and flush all commands with
          // a individual error
          return new Error("The server refused the connection");
        }
        if (options.total_retry_time > 1000 * 60 * 60) {
          // End reconnecting after a specific timeout and flush all commands
          // with a individual error
          return new Error("Retry time exhausted");
        }
        if (options.attempt > 10) {
          return undefined;
        }
        // reconnect after
        return Math.min(options.attempt * 100, 3000);
      },
    });
    this.app = app;
    this.port = port;
    redisClient.on("ready", () => {
      console.log("===Redis connected===");
      this.initializeMiddleware(env);
      this.initializeControllers(controllers);
    });
    redisClient.on("error", (err) => console.log);
  }

  private initializeMiddleware(env = "DEV") {
    this.app.use(bodyParser.json());
    this.app.use(bodyParser.urlencoded({ extended: true }));
    this.app.use(
      expressWinston.logger({
        transports: [new winston.transports.Console()],
        format: winston.format.combine(
          winston.format.colorize(),
          winston.format.json()
        ),
        meta: true,
        msg: "HTTP {{req.method}} {{req.url}}",
        expressFormat: true,
        colorize: false,
        ignoreRoute: function (req, res) {
          return false;
        },
      })
    );
    const corsOptions = App.getCorsOptions(env);
    this.app.use(cors(corsOptions));
    this.app.options("*", cors(corsOptions));
    ParseMiddleware.init(this.app);

    this.app.use(
      (
        err: Error,
        req: express.Request,
        res: express.Response,
        next: express.NextFunction
      ) => {
        res.status(500).send("Something broke!");
      }
    );
  }

  private initializeControllers(controllers: BaseController[]) {
    for (const controller of controllers) {
      this.app.use(controller.router);
    }
    this.app.get("/country/all", routeCache(redisClient), async (req, res) => {
      redisClient.setex(
        req.originalUrl,
        60 * 60 * 24 * 30 * 12,
        JSON.stringify(countries)
      );
      res.status(200).send(countries);
    });
    this.app.get("/banks", routeCache(redisClient), async (req, res) => {
      const config: axios.AxiosRequestConfig = {
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SK}`,
        },
      };
      let _data;
      try {
        const { data } = await axios.default.get(
          `${process.env.PAYSTACK_BEP}/bank`,
          config
        );
        _data = data;
      } catch (error) {
        res
          .status(500)
          .send({ error: error.message, message: "Could not get banks" });
        return;
      }
      setCache(req.originalUrl, _data.data, redisClient);
      res.status(200).send(_data.data);
    });
  }

  public listen(): void {
    const server = http.createServer(this.app);
    server.listen(this.port);
    ParseServer.createLiveQueryServer(server);
  }

  private static getCorsOptions(env = "DEV"): cors.CorsOptions {
    return {
      allowedHeaders: [
        "Origin",
        "X-Requested-With",
        "Content-Type",
        "Accept",
        "X-Access-Token",
      ],
      credentials: true,
      methods: "GET,HEAD,OPTIONS,PUT,PATCH,POST,DELETE",
      origin: "*",
      preflightContinue: false,
    };
  }
}

export default App;
