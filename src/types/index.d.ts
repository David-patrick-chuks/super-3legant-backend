// src/types/express/index.d.ts
import * as express from 'express';

declare global {
  namespace Express {
    interface Request {
      userId?: string; // or the type of userId
    }
  }
}
