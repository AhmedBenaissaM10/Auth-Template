import {Router} from 'express';
import {signup, login, logout, getProfile, refresh, resendOTP, verifyEmail} from './authControllers'
import  { validate } from '../../middlewares/validate';
import  { requireAuth } from '../../middlewares/auth';
import { signupSchema, loginSchema } from './authValidators';
import { authRateLimiter } from '../../middlewares/rateLimiter';

const router = Router();


router.post("/login", authRateLimiter, validate(loginSchema), login)

router.post("/signup", authRateLimiter, validate(signupSchema), signup)

router.post("/resend-otp", authRateLimiter, resendOTP)

router.post("/verify-email", authRateLimiter, verifyEmail)

router.post("/logout",logout)

router.post("/refresh-token",refresh)

router.get("/profile",requireAuth, getProfile)





export default router;


