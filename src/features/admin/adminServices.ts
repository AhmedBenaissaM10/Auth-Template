
import bcrypt from 'bcryptjs';
import {notFound, badRequest} from '../../errors/ErrorIndex';
import { prisma } from '../../lib/prisma';


export const createUser = async(email: string, name: string, password: string, role: "ADMIN" | "USER") => {
    const existingUser = await prisma.user.findUnique({where: { email: email}})
    if (existingUser) throw badRequest("Email already in use");
    const hashedPassword = await bcrypt.hash(password, 10);
    return  await prisma.user.create({data:{email, name, password: hashedPassword, role}, select: {id:true, name:true, email:true,  role:true, createdAt:true}})
}

export const findUsers = async() => {
    return await prisma.user.findMany({ select: { id: true, name: true, email: true, role: true, createdAt: true } });
}

export const findUser = async (id: string) => {
    const user = await prisma.user.findUnique({ where: { id }, select: { id: true, name: true, email: true, role: true, createdAt: true } });
    if (!user) throw notFound("User not found");
    return user;
}


export const deleteUserService = async (id: string) => {
    const user = await prisma.user.findUnique({where:{id}})
    if (!user) throw notFound("User not found");

    return await prisma.user.delete({where:{id}})
}

export const modifyUser = async (id: string, data: { name?: string; email?: string; role?: "ADMIN" | "USER"; password?: string }) => {
    const user = await prisma.user.findUnique({where:{id}})
    if (!user) throw notFound("User not found");
    if (data.password) {
        data.password = await bcrypt.hash(data.password, 10);
    }
    return await prisma.user.update({where:{id}, data})
}

