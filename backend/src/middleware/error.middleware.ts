import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors';

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error('Error:', err);

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
  }

  // Handle Axios errors
  if (err.name === 'AxiosError') {
    const axiosError = err as any;
    return res.status(axiosError.response?.status || 500).json({
      status: 'error',
      message: axiosError.response?.data?.message || 'External API error',
      ...(process.env.NODE_ENV === 'development' && {
        details: axiosError.response?.data,
        stack: err.stack
      })
    });
  }

  // Default error
  return res.status(500).json({
    status: 'error',
    message: 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
}; 