import type { Request, Response, NextFunction } from 'express';
import catchAsync from '../../utils/catchAsync';
import { CreateUser, loginUser, getUserProfile, logoutService, refreshService, verifyEmailService, sendOTP, resendOTPService, resetPasswordService, forgotPasswordService, changePasswordService } from './authServices';
import logger from '../../utils/logger';
import { setAuthCookies, clearAuthCookies } from '../../utils/cookie';
import { unauthorized } from '../../errors/ErrorIndex';
import { sendSuccess } from '../../utils/response';


// POST /signup
export const signup = catchAsync(async (req: Request, res: Response) => {
    const { name, email, password } = req.body || {};

    const user  = await CreateUser(email, name, password)

    logger.info(`User ${user.email} created, waiting for email verification`, { userId: user.id });
    sendSuccess(res,201, user,'User created, please verify your email')
}
)

// POST /login
export const login = catchAsync(async (req: Request, res: Response) => {
    const { email, password } = req.body || {};

    const { user, accessToken, refreshToken } = await loginUser(email, password)

    setAuthCookies(res, accessToken, refreshToken);
    logger.info(`User ${user.email} logged in`, { userId: user.id });
    sendSuccess(res,200, {id : user.id, email: user.email, name: user.name},'Logged in successfully')
}
);

// POST /logout
export const logout = catchAsync(async (req: Request, res: Response) => {
  const refreshToken: string | undefined = req.cookies.refreshToken
  if (refreshToken) {
    const { id, email } = await logoutService(refreshToken)
    logger.info(`User ${email} logged out`, { id })
  }
  clearAuthCookies(res)
  sendSuccess(res, 200, null, 'User logged out')
})

// GET /profile
export const getProfile = catchAsync( async (req: Request, res: Response) => {
    
    const user = await getUserProfile(req.user!.id)
    
    sendSuccess(res,200, user,'Profile retrieved successfully');
}
)

// POST /refresh-token
export const refresh = catchAsync( async (req: Request, res: Response, next: NextFunction) => {
    const refreshToken: string | undefined = req.cookies.refreshToken;
    if(!refreshToken) return next(unauthorized("No token provided"));
    
    const { email, accessToken, newRefreshToken } = await refreshService(refreshToken);
    setAuthCookies(res, accessToken, newRefreshToken);
    logger.info(`${email} created a new access token`)
    sendSuccess(res,200, null, "Access Token created")
})

// POST /verfiry-email
export const verifyEmail = catchAsync( async (req: Request, res: Response) => {
    const { email, code } = req.body || {};
    const { user, accessToken, refreshToken } = await verifyEmailService(email, code);
    setAuthCookies(res, accessToken, refreshToken);
    logger.info(`User ${email} verified their email`)
    sendSuccess(res,200, {id: user.id, email: user.email, name: user.name}, "Email verified successfully")
})

export const resendOTP = catchAsync( async (req: Request, res: Response) => {
    const { email } = req.body || {};
    await resendOTPService(email);
    logger.info(`User ${email} requested a new OTP`)
    sendSuccess(res,200, null, "OTP sent to your email")
})

export const resetPassword = catchAsync( async (req: Request, res: Response) => {
    const { email, code, newPassword } = req.body || {};
    await resetPasswordService(email, code, newPassword);
    logger.info(`User ${email} reset their password`)
    sendSuccess(res,200, null, "Password reset successfully")
})

export const forgotPassword = catchAsync( async (req: Request, res: Response) => {
    const { email } = req.body || {};
    await forgotPasswordService(email);
    logger.info(`User ${email} requested a password reset OTP`)
    sendSuccess(res,200, null, "OTP sent to your email")
})

export const changePassword = catchAsync( async (req: Request, res: Response) => {
    const { oldPassword, newPassword } = req.body || {};
    const userId = req.user!.id;
    await changePasswordService(userId, oldPassword, newPassword);
    logger.info(`User ${req.user!.email} changed their password`)
    sendSuccess(res,200, null, "Password changed successfully")
})