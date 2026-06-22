import type { Request, Response, NextFunction } from 'express';
import catchAsync from '../../utils/catchAsync';
import { CreateUser, loginUser, getUserProfile, logoutService, refreshService, verifyEmailService, sendOTP, resendOTPService } from './authServices';
import logger from '../../utils/logger';
import { setAuthCookies, clearAuthCookies } from '../../utils/cookie';
import { badRequest, unauthorized } from '../../errors/ErrorIndex';


// POST /signup
export const signup = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { name, email, password } = req.body || {};

    const user  = await CreateUser(email, name, password)

    logger.info(`User ${user.email} created, waiting for email verification`, { userId: user.id });
    res.status(201).json({ success: true, message: 'User created, please verify your email' });
}
)

// POST /login
export const login = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { email, password, rememberMe } = req.body || {};

    const { user, accessToken, refreshToken } = await loginUser(email, password)

    setAuthCookies(res, accessToken, refreshToken, rememberMe);
    logger.info(`User ${user.email} logged in`, { userId: user.id });
    res.status(200).json({ success: true, user: {id : user.id, email: user.email, name: user.name} });
}
);

// POST /logout
export const logout = async(req: Request, res: Response, next: NextFunction) => {
    const refreshToken: string | undefined = req.cookies.refreshToken;
    
    if(refreshToken){
        const {id, email} = await logoutService(refreshToken)

        logger.info(`User ${email} logged out`, { id });
    } 
    clearAuthCookies(res);
    res.status(200).json({ success: true, message: 'Logged out' });
};

// GET /profile
export const getProfile = catchAsync( async (req: Request, res: Response, next: NextFunction) => {
    
    const user = await getUserProfile(req.user!.id)
    
    res.status(200).json({ success: true, user });
}
)

// POST /refresh-token
export const refresh = catchAsync( async (req: Request, res: Response, next: NextFunction) => {
    const refreshToken: string | undefined = req.cookies.refreshToken;
    if(!refreshToken) return next(unauthorized("No token provided"));
    
    const { email, accessToken } = await refreshService(refreshToken);
    setAuthCookies(res, accessToken);
    logger.info(`${email} created a new access token`)
    res.status(200).json({success: true, message: "Access Token created"})
})

// POST /verfiry-email
export const verifyEmail = catchAsync( async (req: Request, res: Response, next: NextFunction) => {
    const { email, code } = req.body || {};
    const { user, accessToken, refreshToken } = await verifyEmailService(email, code);
    setAuthCookies(res, accessToken, refreshToken);
    logger.info(`User ${email} verified their email`)
    res.status(200).json({success: true, message: "Email verified successfully", user: {id: user.id, email: user.email, name: user.name}})
})

export const resendOTP = catchAsync( async (req: Request, res: Response, next: NextFunction) => {
    const { email } = req.body || {};
    await resendOTPService(email);
    logger.info(`User ${email} requested a new OTP`)
    res.status(200).json({success: true, message: "OTP sent to your email"})
})