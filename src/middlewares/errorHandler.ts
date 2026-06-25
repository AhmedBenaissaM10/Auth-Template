import type { Request, Response, NextFunction } from 'express';
import AppError from '../errors/AppError';
import logger from '../utils/logger';




// --- Development vs Production response ---
function sendErrorDev(err: AppError, res: Response) {
  res.status(err.statusCode).json({
    success: false,
    status: err.status,
    message: err.message,
    error: err,
    stack: err.stack, 
  });
}

function sendErrorProd(err: AppError, res: Response) {
  // Operational, trusted error: send message to client
  if (err.isOperational) {
    res.status(err.statusCode).json({
      success: false,
      status: err.status,
      message: err.message,
    });
  } else {
    // Programming or unknown error: don't leak details
    logger.error({ message: err.message, stack: err.stack, url: res.req?.originalUrl });
    res.status(500).json({
      success: false,
      status: 'error',
      message: 'Something went wrong. Please try again later.',
    });
  }
}

const errorHandler = (err: Error, _req: Request, res: Response, next: NextFunction) => {
  if(err instanceof AppError){
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';
    if (process.env.NODE_ENV === 'development') {
      logger.error(err.message || 'Server Error');
      sendErrorDev(err, res);
    } else {
      let error = Object.assign(Object.create(Object.getPrototypeOf(err)), err);
      logger.error(error.message || 'Server Error');
      sendErrorProd(error, res);
    }
  }
  else{
    logger.error(err.message || 'Server Error');
    res.status(500).json({
      success: false,
      status: 'error',
      message: 'Something went wrong. Please try again later.',
    });
  }
};
export default errorHandler;