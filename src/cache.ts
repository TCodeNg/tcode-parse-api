import { NextFunction } from "express"
import { createClient, RedisClient } from "redis";
import * as express from 'express';

export const _redisClient = (() => {
  let _client = {
    get: function (key: string, cb: (err: Error, data: string) => void) {
      cb(null, null);
      return false;
    },
    setex: function (key: string, time: number, value: any): boolean {
      return false;
    }
  };

  const c: RedisClient = createClient({
    password: process.env.REDIS_PASSWORD,
    host: process.env.REDIS_HOST,
    port: +process.env.REDIS_PORT,
    retry_strategy: (options) => {
      if (options.error.code === 'ECONNREFUSED') {
        // This will suppress the ECONNREFUSED unhandled exception
        // that results in app crash
        return;
      }
    }
  });

  c.on('ready', function () {
    _client = c;
  });

  const getClient = (): RedisClient => {
    return _client as RedisClient;
  };

  return {
    getClient
  };
})();

export const routeCache = (client: RedisClient) => (req: express.Request, res: express.Response, next: NextFunction) => {
  const key = req.originalUrl;
  client.get(key, (err, data) => {
    if (err) {
      next(err);
    } else if (!!data) {
      console.log('from cache');
      res.status(200).send(JSON.parse(data));
    } else {
      next();
    }
  })
}

export const setCache = (key: string, data: any, client: RedisClient, ttl = 60 * 60 * 24): boolean => {
  return client.setex(key, ttl, JSON.stringify(data))
}

export function getCache<T extends Object>(key: string, client: RedisClient): Promise<T> {
  return new Promise((resolve, reject) => {
    client.get(key, (err, data) => {
      if (err) {
        reject(err);
      } else if (!!data) {
        resolve(JSON.parse(data))
      } else {
        resolve()
      }
    });
  })
}