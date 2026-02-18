import * as express from 'express';
import { JwtPayload } from "jsonwebtoken";
declare global {
  namespace Express {
    interface Request {
      decoded?: any | Record<string, any>;
      user?: {
        userId: string;
        email: string;
        id: string;
        referralCode?: string;
      };
      token?: string;

    }
  }
}
