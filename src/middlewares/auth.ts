import type { Request, Response, NextFunction } from 'express';
import {unauthorized, forbidden} from '../errors/ErrorIndex';
import { decodeToken } from '../utils/jwtUtils';


export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  const jwtToken: string | undefined = req.cookies.jwt || req.headers.authorization?.split(' ')[1];
  if(!jwtToken) return next(unauthorized("No token provided"));
  const decoded = decodeToken(jwtToken);
  req.user = decoded;
  next();
}

export const authorize = (...roles: string[]) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(unauthorized());
    }
    if (!roles.includes(req.user.role)) {
      return next(forbidden("Access denied"));
    }
    next();
  };
};