
import bcrypt from 'bcryptjs';
import {notFound, badRequest, unauthorized} from '../../errors/ErrorIndex';
import { prisma } from '../../lib/prisma';
import { createAccessToken, createRefreshToken, verifyRefreshToken } from '../../utils/jwtUtils';
import redisClient from '../../lib/redis';



export const CreateUser = async(email: string, name: string, password: string) => {
    const existingUser = await prisma.user.findUnique({where: { email: email}})
    if (existingUser) throw badRequest("Email already in use");
    const hashedPassword = await bcrypt.hash(password, 10);
    const user =  await prisma.user.create({data:{email, name, password: hashedPassword}, select: {id:true, name:true, email:true,  role:true, createdAt:true}})
    const accessToken = createAccessToken(user.id, user.email, user.role);
    const refreshToken = createRefreshToken(user.id, user.email, user.role);
    await redisClient.set(`refresh:${user.id}`, refreshToken, {EX: 7 * 24 * 60 * 60});

    return { user, accessToken, refreshToken }
}

export const loginUser = async ( email : string , password: string, rememberMe: boolean = false ) => {
    const user = await prisma.user.findUnique({where:{email}})
    if (!user) throw badRequest("Invalid credentials");
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw badRequest("Invalid credentials");
    const accessToken = createAccessToken(user.id, user.email, user.role);
    const refreshToken = createRefreshToken(user.id, user.email, user.role, rememberMe);
    await redisClient.set(`refresh:${user.id}`, refreshToken, {EX: rememberMe ? 28 * 24 * 60 * 60 : 7 * 24 * 60 * 60});
    return { user, accessToken, refreshToken }
}

export const getUserProfile = async (userId: string) => {
    const user = await prisma.user.findUnique({where:{id: userId}, select: {id:true, name:true, email:true,  role:true, createdAt:true}})
    if (!user)  throw notFound("User not found");
    return user
}

export const logoutService = async (refreshToken: string) => {
    const refreshDecoded = verifyRefreshToken(refreshToken);

    await redisClient.del(`refresh:${refreshDecoded.id}`);
    return { id: refreshDecoded.id, email: refreshDecoded.email}
}

export const refreshService = async (refreshToken: string) => {
    const refreshDecoded = verifyRefreshToken(refreshToken);

    const storedToken = await redisClient.get(`refresh:${refreshDecoded.id}`);
    if(!storedToken || storedToken !== refreshToken) throw unauthorized("Refresh token not found")
    const accessToken = createAccessToken(refreshDecoded.id, refreshDecoded.email, refreshDecoded.role);
    const newRefreshToken = createRefreshToken(refreshDecoded.id, refreshDecoded.email, refreshDecoded.role);
    await redisClient.set(`refresh:${refreshDecoded.id}`, newRefreshToken, {EX: 7 * 24 * 60 * 60});
    return { email: refreshDecoded.email, accessToken };
}