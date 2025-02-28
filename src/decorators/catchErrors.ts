import { NextFunction, Request, Response } from 'express';
import {
    DatabaseError,
    ForeignKeyConstraintError,
    UniqueConstraintError,
    ValidationError,
} from 'sequelize';

import HttpError from '@/helpers/HttpError.js';

export function catchErrors(
    fn: (req: Request, res: Response, next: NextFunction) => Promise<void>,
) {
    return async (req: Request, res: Response, next: NextFunction) => {
        try {
            await fn(req, res, next);
        } catch (error) {
            if (error instanceof UniqueConstraintError) {
                return next(new HttpError('Resource already exists', 409));
            }

            if (error instanceof ValidationError) {
                return next(new HttpError(error.message, 400));
            }

            if (error instanceof ForeignKeyConstraintError) {
                return next(new HttpError('Referenced resource not found', 404));
            }

            if (error instanceof DatabaseError) {
                return next(new HttpError('Database error occurred', 500));
            }

            next(error);
        }
    };
}
