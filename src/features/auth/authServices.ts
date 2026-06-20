
import bcrypt from 'bcryptjs';
import {notFound, badRequest} from '../../errors/ErrorIndex';
import { prisma } from '../../lib/prisma';
import logger from '../../utils/logger';



export const CreateUser = async(email: string, name: string, password: string) => {
    const existingUser = await prisma.user.findUnique({where: { email: email}})
    if (existingUser) throw badRequest("Email already in use");
    const hashedPassword = await bcrypt.hash(password, 10);
    return  await prisma.user.create({data:{email, name, password: hashedPassword}, select: {id:true, name:true, email:true,  role:true, createdAt:true}})
}

export const loginUser = async ( email : string , password: string ) => {
    const user = await prisma.user.findUnique({where:{email}})
    logger.debug(`Attempting login for email: ${email}`);
    logger.debug(`User found: ${user ? user.id : 'No user found'}`);
    if (!user) throw badRequest("Invalid credentials");
    logger.debug(`Found user: ${user.id}`);
    const isMatch = await bcrypt.compare(password, user.password);
    logger.debug(`Password comparison for user ${email}: ${isMatch}`);
    if (!isMatch) throw badRequest("Invalid credentials");
    return user
}

export const getUserProfile = async (userId: string) => {
    const user = await prisma.user.findUnique({where:{id: userId}, select: {id:true, name:true, email:true,  role:true, createdAt:true}})
    if (!user)  throw notFound("User not found");
    return user
}
