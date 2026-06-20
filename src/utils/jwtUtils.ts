import jwt from "jsonwebtoken";
import {env }from "../config/env";
import { handleJWTError, handleJWTExpiredError, unauthorized } from "../errors/ErrorIndex";

interface AuthUser {
    id: string,
    email: string,
    role: string
}
declare global {
    namespace Express {
        interface Request {
            user?: AuthUser;
        }
    }
}

export const createToken = (id: string, email: string, role: string, rememberMe: boolean = false): string => {
    
    return jwt.sign({ id, email, role }, env.JWT_SECRET, {
        expiresIn: rememberMe ? "7d" : "1d"
    });
};


export const decodeToken = (token: string): AuthUser => {
    try{
        return jwt.verify(token, env.JWT_SECRET) as AuthUser;
    } catch (error) {
        if (error instanceof jwt.TokenExpiredError) {
            throw handleJWTExpiredError();
        }
        if (error instanceof jwt.JsonWebTokenError) {
            throw handleJWTError();
        }
        throw unauthorized(error instanceof Error ? error.message : "Unauthorized");
    }
};

