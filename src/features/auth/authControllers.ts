import type { Request, Response, NextFunction } from 'express';
import {badRequest} from '../../errors/ErrorIndex';
import catchAsync from '../../utils/catchAsync';
import { CreateUser, loginUser, getUserProfile } from './authServices';
import logger from '../../utils/logger';


// POST /signup
export const signup = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { name, email, password } = req.body || {};

    const user = await CreateUser(email, name, password)

    req.session.user = { id: user.id, email: user.email, role: user.role };
    req.session.cookie.maxAge =  24 * 60 * 60 * 1000;
    logger.info(`User ${user.email} signed up`, { userId: user.id });
    res.status(201).json({ success: true, user });
}
)

// POST /login
export const login = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { email, password, rememberMe } = req.body || {};

    const user = await loginUser(email, password)

    req.session.user = { id: user.id, email: user.email, role: user.role };
    req.session.cookie.maxAge = rememberMe ? 7 * 24 * 60 * 60 * 1000: 24 * 60 * 60 * 1000;
    logger.info(`User ${user.email} logged in`, { userId: user.id });
    res.status(200).json({ success: true, user: {id : user.id, email: user.email, name: user.name} });
}
);

// POST /logout
export const logout = (req: Request, res: Response, next: NextFunction) => {
  const userEmail = req.session.user?.email;
  const userId = req.session.user?.id;

  req.session.destroy((err) => {
    if (err) return next(badRequest("Logout failed")); 

    logger.info(`User ${userEmail} logged out`, { userId });
    res.clearCookie('connect.sid');
    res.status(200).json({ success: true, message: 'Logged out' });
  });
};

// GET /profile
export const getProfile = catchAsync( async (req: Request, res: Response, next: NextFunction) => {
    
    const user = await getUserProfile(req.session.user!.id)
    
    res.status(200).json({ success: true, user });
}
)

