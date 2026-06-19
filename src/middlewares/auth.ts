import type { Request, Response, NextFunction } from 'express';
import {unauthorized, forbidden} from '../errors/ErrorIndex';


declare module "express-session" {
  interface SessionData {
    user? :{
        id: string;
        email : string;
        role: "USER" | "ADMIN"
    }
  }
}

export const requireSession = (req: Request, res: Response, next: NextFunction) => {
  if (!req.session.user?.id) {
    return next(unauthorized());
  }
  next();
}

export const authorize = (...roles: string[]) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.session.user) {
      return next(unauthorized());
    }
    if (!roles.includes(req.session.user.role)) {
      return next(forbidden("Access denied"));
    }
    next();
  };
};