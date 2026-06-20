import type { Request, Response, NextFunction } from 'express';
import catchAsync from '../../utils/catchAsync';
import { CreateUser, loginUser, getUserProfile } from './authServices';
import logger from '../../utils/logger';
import { createToken } from '../../utils/jwtUtils';


// POST /signup
export const signup = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { name, email, password } = req.body || {};

    const user = await CreateUser(email, name, password)

    const jwtToken = createToken(user.id, user.email, user.role);
    res.cookie('jwt', jwtToken, { httpOnly: true, sameSite: 'strict', secure: process.env.NODE_ENV === 'production', maxAge: 24 * 60 * 60 * 1000 });

    logger.info(`User ${user.email} signed up`, { userId: user.id });
    res.status(201).json({ success: true, user });
}
)

// POST /login
export const login = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { email, password, rememberMe } = req.body || {};

    const user = await loginUser(email, password)

    const jwtToken = createToken(user.id, user.email, user.role, rememberMe);
    res.cookie('jwt', jwtToken, { httpOnly: true, sameSite: 'strict', secure: process.env.NODE_ENV === 'production', maxAge: rememberMe ? 7 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000 });
    logger.info(`User ${user.email} logged in`, { userId: user.id });
    res.status(200).json({ success: true, user: {id : user.id, email: user.email, name: user.name} });
}
);

// POST /logout
export const logout = (req: Request, res: Response, next: NextFunction) => {
    const userEmail = req.user?.email || 'Unknown';
    const userId = req.user?.id || 'Unknown';
    res.clearCookie('jwt', { httpOnly: true, sameSite: 'strict', secure: process.env.NODE_ENV === 'production' });
    logger.info(`User ${userEmail} logged out`, { userId });
    res.status(200).json({ success: true, message: 'Logged out' });
};

// GET /profile
export const getProfile = catchAsync( async (req: Request, res: Response, next: NextFunction) => {
    
    const user = await getUserProfile(req.user!.id)
    
    res.status(200).json({ success: true, user });
}
)

