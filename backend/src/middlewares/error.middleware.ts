import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { AppError } from '../utils/errors';

/**
 * Centralized Error Handling Middleware
 * 
 * All errors thrown in route handlers (via asyncHandler) or passed to next(err)
 * are caught here and formatted into a consistent JSON response.
 * 
 * Handles:
 * - AppError (custom application errors)
 * - ZodError (validation errors from Zod schemas)
 * - Prisma known request errors (e.g., unique constraint violations)
 * - Unknown/unexpected errors (500 Internal Server Error)
 */
export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  // --- 1. Custom AppError ---
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      error: {
        code: err.code,
        message: err.message,
        ...(err.details && { details: err.details }),
      },
    });
  }

  // --- 2. Zod Validation Error ---
  if (err instanceof ZodError) {
    const formattedErrors = err.issues.map((e) => ({
      field: e.path.join('.'),
      message: e.message,
    }));

    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Data input tidak valid.',
        details: formattedErrors,
      },
    });
  }

  // --- 3. Prisma Known Request Error (e.g., unique constraint) ---
  if (err.constructor.name === 'PrismaClientKnownRequestError') {
    const prismaError = err as any;
    if (prismaError.code === 'P2002') {
      const target = prismaError.meta?.target;
      const field = Array.isArray(target) ? target.join(', ') : 'field';
      return res.status(409).json({
        success: false,
        error: {
          code: 'CONFLICT',
          message: `Data dengan ${field} tersebut sudah terdaftar.`,
        },
      });
    }
    if (prismaError.code === 'P2025') {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Data yang diminta tidak ditemukan.',
        },
      });
    }
  }

  // --- 4. Unknown/Unexpected Error ---
  console.error('UNHANDLED ERROR:', err);

  return res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message: 'Terjadi kesalahan internal pada server.',
      ...(process.env.NODE_ENV !== 'production' && { stack: err.stack }),
    },
  });
};

/**
 * 404 Not Found Handler
 * Catches requests to undefined routes.
 */
export const notFoundHandler = (req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'ROUTE_NOT_FOUND',
      message: `Route ${req.method} ${req.originalUrl} tidak ditemukan.`,
    },
  });
};
