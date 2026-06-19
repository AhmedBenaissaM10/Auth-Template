import {Router} from 'express';
import {signup, login, logout, getProfile} from './authControllers'
import  { validate } from '../../middlewares/validate';
import  { requireSession } from '../../middlewares/auth';
import { signupSchema, loginSchema } from './authValidators';


const router = Router();


router.post("/login", validate(loginSchema), login)

router.post("/signup", validate(signupSchema), signup)

router.post("/logout",logout)

router.get("/profile",requireSession, getProfile)





export default router;


