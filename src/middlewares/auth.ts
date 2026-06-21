import type { Request, Response, NextFunction } from 'express';
import {unauthorized, forbidden} from '../errors/ErrorIndex';
import { verifyAccessToken } from '../utils/jwtUtils';


export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  const accessToken: string | undefined = req.cookies.accessToken || req.headers.authorization?.split(' ')[1];
  if(!accessToken) return next(unauthorized("No token provided"));
  const decoded = verifyAccessToken(accessToken);
  req.user = decoded;
  next();
}

export const authorize = (...roles: string[]) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(unauthorized());
    }
    if (!roles.includes(req.user.role)) {
      return next(forbidden("Access denied, you're not authorized to access this resource"));
    }
    next();
  };
};