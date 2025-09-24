import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';

export interface ApiError extends Error {
  statusCode?: number;
  isOperational?: boolean;
}

export const errorHandler = (
  error: ApiError,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  let statusCode = error.statusCode || 500;
  let message = error.message || 'Erro interno do servidor';

  // Erro de validação do Mongoose
  if (error instanceof mongoose.Error.ValidationError) {
    statusCode = 400;
    const errors = Object.values(error.errors).map(err => err.message);
    message = `Erro de validação: ${errors.join(', ')}`;
  }

  // Erro de chave duplicada do MongoDB
  if (error.name === 'MongoServerError' && (error as any).code === 11000) {
    statusCode = 400;
    const field = Object.keys((error as any).keyValue)[0];
    message = `${field} já existe no sistema`;
  }

  // Erro de cast do Mongoose (ID inválido)
  if (error instanceof mongoose.Error.CastError) {
    statusCode = 400;
    message = 'ID inválido fornecido';
  }

  // Erro de JWT
  if (error.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Token inválido';
  }

  // Erro de JWT expirado
  if (error.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expirado';
  }

  // Log do erro em desenvolvimento
  if (process.env.NODE_ENV === 'development') {
    console.error('❌ Erro:', error);
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
  });
};

export const notFound = (req: Request, res: Response, next: NextFunction): void => {
  const error = new Error(`Rota não encontrada - ${req.originalUrl}`) as ApiError;
  error.statusCode = 404;
  next(error);
};
