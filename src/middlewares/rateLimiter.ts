import {RateLimiterRedis} from 'rate-limiter-flexible'
import redisClient from '../lib/redis'
import { Request, Response, NextFunction } from 'express'
import logger from '../utils/logger';

// Global rate limiter 
const globalLimiter = new RateLimiterRedis({
    storeClient: redisClient,
    keyPrefix: 'global_rate_limiter',
    points: 100, // Number of requests
    duration: 60, // Per second(s)
    blockDuration: 60, // Block for 60 seconds if consumed more than points
    useRedisPackage: true, // Use the redis package for better performance
})
// Auth rate limiter
const authLimiter = new RateLimiterRedis({
    storeClient: redisClient,
    keyPrefix: 'auth_rate_limiter',
    points: 5, // Number of requests
    duration: 60 * 5, 
    blockDuration: 60 * 3, 
    useRedisPackage: true, // Use the redis package for better performance
})
const makeMiddleware = (limiter: RateLimiterRedis) => {
    return async (req: Request, res: Response, next: NextFunction) => {
        try{
            const rateLimiterRes = await limiter.consume(req.ip!)
            res.setHeader('X-RateLimit-Limit', limiter.points)
            res.setHeader('X-RateLimit-Remaining', rateLimiterRes.remainingPoints)
            res.setHeader('X-RateLimit-Reset', new Date(Date.now() + rateLimiterRes.msBeforeNext).toUTCString())
        
            next()
        } catch (err: any) {
            res.setHeader('X-RateLimit-Limit', limiter.points)
            res.setHeader('X-RateLimit-Remaining', 0)
            res.setHeader('X-RateLimit-Reset', new Date(Date.now() + err.msBeforeNext).toUTCString())
            res.setHeader('Retry-After', Math.ceil(err.msBeforeNext / 1000))
            logger.warn(`Rate limit exceeded for IP: ${req.ip}`, { ip: req.ip, path: req.path, method: req.method });
            res.status(429).json({ error: 'Too Many Requests' })
        }
}}

export const globalRateLimiter = makeMiddleware(globalLimiter)
export const authRateLimiter = makeMiddleware(authLimiter)