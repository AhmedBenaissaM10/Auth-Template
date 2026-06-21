import {Router} from 'express';
import {signup, login, logout, getProfile, refresh} from './authControllers'
import  { validate } from '../../middlewares/validate';
import  { requireAuth } from '../../middlewares/auth';
import { signupSchema, loginSchema } from './authValidators';
import { authRateLimiter } from '../../middlewares/rateLimiter';

const router = Router();


router.post("/login", authRateLimiter, validate(loginSchema), login)

router.post("/signup", authRateLimiter, validate(signupSchema), signup)

router.post("/logout",logout)

router.post("/refresh-token",refresh)

router.get("/profile",requireAuth, getProfile)





export default router;


