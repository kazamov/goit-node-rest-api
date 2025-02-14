import { NextFunction, Request, Response } from 'express';
import { ZodSchema } from 'zod';

import HttpError from '../helpers/HttpError.js';

export function validateBody<T>(schema: ZodSchema<T>) {
    const func = (req: Request, _res: Response, next: NextFunction) => {
        const { error } = schema.safeParse(req.body);
        if (error) {
            const errorMessages = error.issues.map((issue) => {
                if (issue.path.length === 0) {
                    return issue.message;
                }
                return `${issue.path.join('.')}: ${issue.message}`;
            });
            next(new HttpError('Validation failed', 400, errorMessages));
        }
        next();
    };

    return func;
}
