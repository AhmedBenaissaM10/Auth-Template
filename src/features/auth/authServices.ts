
import bcrypt from 'bcryptjs';
import {notFound, badRequest, unauthorized, internalServerError} from '../../errors/ErrorIndex';
import { prisma } from '../../lib/prisma';
import { createAccessToken, createRefreshToken, verifyRefreshToken } from '../../utils/jwtUtils';
import redisClient from '../../lib/redis';
import { sendOTPEmail } from '../../lib/mailer';
import AppError from '../../errors/AppError';


export const sendOTP = async (id: string, email: string) => {
   
    const codeOtp = Math.floor(100000 + Math.random() * 900000).toString();

    await redisClient.set(`otp:${id}`, codeOtp, {EX: 10 * 60 });
    
    await sendOTPEmail(email, codeOtp, "Verify your email");

}

export const CreateUser = async(email: string, name: string, password: string) => {

    const existingUser = await prisma.user.findUnique({where: { email: email}})
    if (existingUser) throw badRequest("Email already in use");
    const hashedPassword = await bcrypt.hash(password, 10);
    const user =  await prisma.user.create({data:{email, name, password: hashedPassword}, select: {id:true, name:true, email:true,  role:true, createdAt:true, isVerified:true}})
    try {
        await sendOTP(user.id, email);
    } catch (error) {
        await prisma.user.delete({where: {id: user.id}});
        throw internalServerError("Failed to send OTP");
    }

    return user 
}

export const loginUser = async ( email : string , password: string ) => {
    const user = await prisma.user.findUnique({where:{email}})
    if (!user) throw badRequest("Invalid credentials");
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw badRequest("Invalid credentials");

    if (!user.isVerified) {
        await sendOTP(user.id, email);
        throw unauthorized("Email not verified, please check your email for the verification code");
    }

    const accessToken = createAccessToken(user.id, user.email, user.role);
    const refreshToken = createRefreshToken(user.id, user.email, user.role);
    await redisClient.set(`refresh:${user.id}`, refreshToken, {EX: 7 * 24 * 60 * 60});
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
    if(!storedToken) throw unauthorized("Refresh token not found")
    if(storedToken !== refreshToken) throw unauthorized("Refresh token does not match")
    const accessToken = createAccessToken(refreshDecoded.id, refreshDecoded.email, refreshDecoded.role);
    const newRefreshToken = createRefreshToken(refreshDecoded.id, refreshDecoded.email, refreshDecoded.role);
    await redisClient.set(`refresh:${refreshDecoded.id}`, newRefreshToken, {EX: 7 * 24 * 60 * 60});
    return { email: refreshDecoded.email, newRefreshToken, accessToken };
}

export const verifyEmailService = async (email: string, code: string) => {
    const user = await prisma.user.findUnique({where: {email}});
    if (!user) throw badRequest("Invalid credentials");

    const storedCode = await redisClient.get(`otp:${user.id}`);
    if (!storedCode) throw badRequest("OTP expired");
    if (storedCode !== code) throw badRequest("Invalid OTP");

    await prisma.user.update({where: {id: user.id}, data: {isVerified: true}});
    await redisClient.del(`otp:${user.id}`);

    const accessToken = createAccessToken(user.id, user.email, user.role);
    const refreshToken = createRefreshToken(user.id, user.email, user.role);
    await redisClient.set(`refresh:${user.id}`, refreshToken, {EX: 7 * 24 * 60 * 60});
    return { user, accessToken, refreshToken }
}

export const resendOTPService = async ( email: string) => {
    const user = await prisma.user.findUnique({where: {email}});
    if (!user) return; // Do not throw error to prevent email enumeration
    if (user.isVerified) throw badRequest("Email already verified");
    await sendOTP(user.id, email);
}

export const resetPasswordService = async (email: string,  code: string, newPassword: string) => {
    const user = await prisma.user.findUnique({where: {email}});
    if (!user) return; // Do not throw error to prevent email enumeration
    const storedCode = await redisClient.get(`reset:${user.id}`);
    if (!storedCode) throw badRequest("Reset code expired");
    if (storedCode !== code) throw badRequest("Invalid reset code");
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({where: {id: user.id}, data: {password: hashedPassword}});
    await redisClient.del(`reset:${user.id}`);
}

export const changePasswordService = async (userId: string, currentPassword: string, newPassword: string) => {
    const user = await prisma.user.findUnique({where: {id: userId}});
    if (!user) throw badRequest("Invalid credentials");
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) throw badRequest("Current password is incorrect, please try again");
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({where: {id: user.id}, data: {password: hashedPassword}});
}

export const forgotPasswordService = async (email: string) => {
    const user = await prisma.user.findUnique({where: {email}});
    if (!user) return; // Do not throw error to prevent email enumeration

    const codeOtp = Math.floor(100000 + Math.random() * 900000).toString();

    await redisClient.set(`reset:${user.id}`, codeOtp, {EX: 10 * 60 });
    
    await sendOTPEmail(email, codeOtp, "Reset your password");
}