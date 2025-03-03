import { NextFunction, Request, Response } from 'express';

import HttpError from '@/helpers/HttpError.js';
import { verifyToken } from '@/helpers/jwt.js';
import { findUser } from '@/services/authServices.js';

export async function authenticate(req: Request, res: Response, next: NextFunction) {
    const { authorization } = req.headers;

    if (!authorization) {
        return next(new HttpError('Authorization header was missed', 401));
    }

    const [bearer, token] = authorization.split(' ');
    if (bearer !== 'Bearer' || !token) {
        return next(new HttpError('Invalid token', 401));
    }

    const { data, error } = verifyToken(token);

    if (error) {
        return next(new HttpError(error.message, 401));
    }

    const user = await findUser({ email: data.email, id: data.id });

    if (!user) {
        return next(new HttpError('User not found', 401));
    }

    if (user.token !== token) {
        return next(new HttpError('Invalid token', 401));
    }

    req.user = user;

    next();
}
