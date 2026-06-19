import {Router} from 'express';
import {getUsers, getUser, deleteUser, updateUser, addUser} from './adminControllers'
import  { validate, validateId } from '../../middlewares/validate';
import  { requireSession, authorize } from '../../middlewares/auth';
import { addUserSchema, updateUserSchema } from './adminValidators';


const router = Router();

router.use(requireSession);

router.use(authorize('ADMIN'));

router.get("/users", getUsers);

router.post("/users", validate(addUserSchema), addUser);

router.get("/users/:id", validateId, getUser);

router.patch("/users/:id", validateId, validate(updateUserSchema), updateUser);

router.delete("/users/:id", validateId, deleteUser);







export default router;


