"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.notFound = exports.errorHandler = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const errorHandler = (error, req, res, next) => {
    let statusCode = error.statusCode || 500;
    let message = error.message || 'Erro interno do servidor';
    if (error instanceof mongoose_1.default.Error.ValidationError) {
        statusCode = 400;
        const errors = Object.values(error.errors).map(err => err.message);
        message = `Erro de validação: ${errors.join(', ')}`;
    }
    if (error.name === 'MongoServerError' && error.code === 11000) {
        statusCode = 400;
        const field = Object.keys(error.keyValue)[0];
        message = `${field} já existe no sistema`;
    }
    if (error instanceof mongoose_1.default.Error.CastError) {
        statusCode = 400;
        message = 'ID inválido fornecido';
    }
    if (error.name === 'JsonWebTokenError') {
        statusCode = 401;
        message = 'Token inválido';
    }
    if (error.name === 'TokenExpiredError') {
        statusCode = 401;
        message = 'Token expirado';
    }
    if (process.env.NODE_ENV === 'development') {
        console.error('❌ Erro:', error);
    }
    res.status(statusCode).json({
        success: false,
        message,
        ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
    });
};
exports.errorHandler = errorHandler;
const notFound = (req, res, next) => {
    const error = new Error(`Rota não encontrada - ${req.originalUrl}`);
    error.statusCode = 404;
    next(error);
};
exports.notFound = notFound;
//# sourceMappingURL=errorHandler.js.map