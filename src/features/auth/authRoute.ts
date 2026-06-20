import {Router} from 'express';
import {signup, login, logout, getProfile} from './authControllers'
import  { validate } from '../../middlewares/validate';
import  { requireSession } from '../../middlewares/auth';
import { signupSchema, loginSchema } from './authValidators';
import { authRateLimiter } from '../../middlewares/rateLimiter';

const router = Router();


router.post("/login", authRateLimiter, validate(loginSchema), login)

router.post("/signup", authRateLimiter, validate(signupSchema), signup)

router.post("/logout",logout)

router.get("/profile",requireSession, getProfile)





export default router;


