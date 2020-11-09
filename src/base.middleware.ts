import express from 'express';

export interface BaseMiddleware {
  app: express.Application;
}