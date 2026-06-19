import type { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcryptjs';
import {notFound, badRequest} from '../../errors/ErrorIndex';
import catchAsync from '../../utils/catchAsync';
import { findUser, findUsers, createUser, deleteUserService, modifyUser } from './adminServices';
import logger from '../../utils/logger';



// GET /users
export const getUsers = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const users = await findUsers();
    res.status(200).json({ success: true, users });
});

// GET /user/:id
export const getUser = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id as string;

    const user = await findUser(id);
    logger.info(`User with ID ${id} retrieved successfully.`);
    res.status(200).json({ success: true, user });
});

// POST /admin/create-user
export const addUser = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { name, email, password , role} = req.body;
    const user = await createUser(name, email, password, role);
    logger.info(`User ${user.email} created successfully.`);
    res.status(201).json({ success: true, user });
}
)
// DELETE /user/:id
export const deleteUser = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const id  = req.params.id as string;
    const user = await deleteUserService(id);
    logger.info(`User with email ${user.email} deleted successfully.`);
    res.status(200).json({ success: true, message: 'User deleted' });
})


// PATCH /user/:id
export const updateUser = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.id as string;
    const { name, email, role, password } = req.body || {};
   
    const user = await modifyUser(id, {name, email, role, password});
    logger.info(`User with email ${user.email} updated successfully.`);
    res.status(200).json({ success: true, user: user });
})



