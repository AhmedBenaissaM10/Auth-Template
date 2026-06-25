import type {Response} from 'express';

interface Meta{
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
    [key: string]: unknown;
}

export const sendSuccess = <T>(res: Response,statusCode: number = 200, data: T,message?: string ,meta?: Meta, ) => {
    return res.status(statusCode).json({
        success: true,
        ...(message && { message }),
        data,
        ...(meta && { meta })
     });
}
export const sendError = (res: Response, code: string, statusCode: number = 500, message: string) => {
    return res.status(statusCode).json({
        success: false,
        error: { code, message},
    });
}