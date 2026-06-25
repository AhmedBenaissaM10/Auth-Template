import {Router} from 'express';
import {signup, login, logout, getProfile, refresh, resendOTP, verifyEmail, forgotPassword, resetPassword, changePassword} from './authControllers'
import  { validate } from '../../middlewares/validate';
import  { requireAuth } from '../../middlewares/auth';
import { signupSchema, loginSchema, resendOTPSchema, forgotPasswordSchema, resetPasswordSchema, verifyEmailSchema, changePasswordSchema } from './authValidators';
import { authRateLimiter } from '../../middlewares/rateLimiter';

const router = Router();


router.post("/login", authRateLimiter, validate(loginSchema), login)

router.post("/signup", authRateLimiter, validate(signupSchema), signup)

router.post("/resend-otp", authRateLimiter, validate(resendOTPSchema), resendOTP)

router.post("/verify-email", authRateLimiter, validate(verifyEmailSchema), verifyEmail)

router.post("/forgot-password", authRateLimiter, validate(forgotPasswordSchema), forgotPassword)

router.post("/reset-password", authRateLimiter, validate(resetPasswordSchema), resetPassword)

router.post("/change-password", authRateLimiter, requireAuth, validate(changePasswordSchema), changePassword)

router.post("/logout", requireAuth, logout)

router.post("/refresh-token", authRateLimiter, refresh)

router.get("/profile",requireAuth, getProfile)





export default router;


